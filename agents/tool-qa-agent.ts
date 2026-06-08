/**
 * Tool QA Agent — Main Orchestrator
 *
 * Daily pipeline:
 *   1. Select 5 tools most overdue for testing (rotating round-robin)
 *   2. Run all test cases for each tool (real HTTP calls to production)
 *   3. For each failure: fetch source via GitHub API, AI-diagnose bug, create fix PR
 *   4. Competitor analysis for 2 tools/day (cached 7 days):
 *      fetch competitor pages → AI extract features → AI identify gaps
 *   5. Feature addition: for top-priority gap, AI-generate enhancement, create feature PR
 *   6. Log run to Supabase, send Resend summary email
 *
 * Token budget per run: ~6,000–10,000 tokens (Groq free tier friendly)
 */

import { callAI, sanitizeJsonString } from '@/lib/ai';
import { TOOL_REGISTRY, TESTABLE_SLUGS } from '@/lib/tool-qa/registry';
import { runToolTests, summarizeResults, classifyBugSeverity } from '@/lib/tool-qa/tester';
import { createPR, getFileContent, isGitHubConfigured } from '@/lib/tool-qa/github';
import {
  getToolsOrderedByLastTested,
  markToolTested,
  storeBug,
  updateBugWithPR,
  getRecentOpenBugsForTool,
  storeFeatureGap,
  updateFeatureGapWithPR,
  getTopUnimplementedGap,
  getCachedCompetitor,
  cacheCompetitorAnalysis,
  logQARun,
} from '@/lib/tool-qa/tracker';
import type { ToolDefinition, TestResult, BugReport, FeatureGap, CompetitorFeatures, QARunResult } from '@/lib/tool-qa/types';

const TOOLS_PER_RUN = 5;
const COMPETITOR_TOOLS_PER_RUN = 2;  // how many tools get competitor analysis each day
const MAX_BUG_FIX_PRS_PER_RUN = 2;  // limit GitHub PRs to avoid noise
const MAX_FEATURE_PRS_PER_RUN = 1;

// ── Helper: select 5 tools to test today ─────────────────────────────────────

async function selectToolsToTest(): Promise<ToolDefinition[]> {
  const testedSlugs = await getToolsOrderedByLastTested();
  const testedSet = new Set(testedSlugs);

  // Never-tested tools first, then least-recently-tested
  const untested = TESTABLE_SLUGS.filter(s => !testedSet.has(s));
  const ordered = [...untested, ...testedSlugs.filter(s => TESTABLE_SLUGS.includes(s))];

  const selected = ordered.slice(0, TOOLS_PER_RUN).map(s => TOOL_REGISTRY.find(t => t.slug === s)!).filter(Boolean);

  // If we have fewer than TOOLS_PER_RUN, fill with random from registry
  if (selected.length < TOOLS_PER_RUN) {
    const remaining = TOOL_REGISTRY.filter(t => !selected.some(s => s.slug === t.slug));
    selected.push(...remaining.slice(0, TOOLS_PER_RUN - selected.length));
  }

  return selected;
}

// ── Bug analysis and fix generation ──────────────────────────────────────────

async function generateBugFix(
  tool: ToolDefinition,
  failures: TestResult[]
): Promise<{ patchedContent: string; explanation: string } | null> {
  if (!isGitHubConfigured()) return null;

  const sourceFile = await getFileContent(tool.sourceFile);
  if (!sourceFile) {
    console.log(`  [QA] Could not fetch source for ${tool.sourceFile}`);
    return null;
  }

  // Truncate source to first 200 lines to save tokens (most bugs are in validation/handler logic)
  const sourceLines = sourceFile.content.split('\n');
  const truncatedSource = sourceLines.slice(0, 200).join('\n');

  const failureSummary = failures.slice(0, 3).map(f => ({
    test: f.testName,
    desc: f.description,
    status: f.response?.status,
    expected: f.validationResult?.reason ?? f.error,
    responseSnippet: (f.response?.text ?? '').slice(0, 200),
  }));

  const raw = await callAI([
    {
      role: 'system',
      content: `You are a senior TypeScript/Next.js engineer fixing bugs in a Next.js 14 API route.
The file is: ${tool.sourceFile}
Tool: ${tool.name}

Analyze the failing tests, identify the root cause in the source code, and provide a fixed version.

Respond ONLY with valid JSON in this exact format:
{
  "rootCause": "One sentence describing the bug",
  "fix": "One sentence describing what was changed",
  "patchedFile": "// FULL corrected TypeScript file content here"
}

Rules for the fix:
- Only fix what is clearly broken — minimal changes
- Preserve all existing functionality
- Do not add new imports unless necessary
- Ensure the fix addresses all failing tests
- The patchedFile must be complete, valid TypeScript, compilable`,
    },
    {
      role: 'user',
      content: `Failing tests:
${JSON.stringify(failureSummary, null, 2)}

Current source (${sourceLines.length} total lines, showing first 200):
\`\`\`typescript
${truncatedSource}
\`\`\`
${sourceLines.length > 200 ? `\n[${sourceLines.length - 200} more lines truncated]` : ''}`,
    },
  ], { maxTokens: 2500, temperature: 0.1, skipCache: true });

  try {
    const cleaned = sanitizeJsonString(raw);
    const parsed = JSON.parse(cleaned) as { rootCause: string; fix: string; patchedFile: string };

    if (!parsed.patchedFile || parsed.patchedFile.length < 100) return null;

    // Safety: if AI returned more than 300 lines, something went wrong
    const newLines = parsed.patchedFile.split('\n').length;
    if (newLines > Math.max(sourceLines.length * 2, 300)) {
      console.log(`  [QA] Patched file suspiciously large (${newLines} lines) — skipping`);
      return null;
    }

    return { patchedContent: parsed.patchedFile, explanation: `${parsed.rootCause} | Fix: ${parsed.fix}` };
  } catch {
    return null;
  }
}

// ── Competitor analysis ───────────────────────────────────────────────────────

async function fetchCompetitorFeatures(
  toolSlug: string,
  competitor: { name: string; url: string }
): Promise<CompetitorFeatures | null> {
  // Check cache first
  const cached = await getCachedCompetitor(toolSlug, competitor.name);
  if (cached) {
    console.log(`  [QA] Competitor cache hit: ${competitor.name}`);
    return cached;
  }

  // Fetch competitor page
  let pageContent = '';
  try {
    const res = await fetch(competitor.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FormlyQA/1.0; +https://formly.tools)' },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const html = await res.text();
      // Strip tags, get text content (first 3000 chars is enough for feature extraction)
      pageContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 3000);
    }
  } catch {
    console.log(`  [QA] Could not fetch ${competitor.url} — using AI knowledge`);
  }

  // AI-extract features (with or without page content)
  const raw = await callAI([
    {
      role: 'system',
      content: `You are a competitive analysis specialist. Extract the key product features from the competitor tool.
Return ONLY a JSON array of feature strings. Max 15 features. Each feature should be 5-15 words describing one specific capability.
Example: ["Word count and reading time display", "Synonym suggestions inline", "Tone analysis score"]`,
    },
    {
      role: 'user',
      content: `Competitor: ${competitor.name} (${competitor.url})
Category: ${toolSlug.replace(/-/g, ' ')} tool

${pageContent ? `Page content snippet:\n${pageContent}` : `Use your knowledge of ${competitor.name} to list their key features.`}`,
    },
  ], { maxTokens: 400, temperature: 0.2 });

  try {
    const cleaned = sanitizeJsonString(raw);
    const features = JSON.parse(cleaned) as string[];
    if (!Array.isArray(features) || features.length === 0) return null;

    const result: CompetitorFeatures = {
      name: competitor.name,
      url: competitor.url,
      features: features.slice(0, 15),
    };

    await cacheCompetitorAnalysis(toolSlug, result);
    return result;
  } catch {
    return null;
  }
}

async function identifyFeatureGaps(
  tool: ToolDefinition,
  competitorData: CompetitorFeatures[]
): Promise<FeatureGap[]> {
  if (competitorData.length === 0) return [];

  const allCompetitorFeatures = competitorData.flatMap(c =>
    c.features.map(f => `${c.name}: ${f}`)
  );

  const raw = await callAI([
    {
      role: 'system',
      content: `You are a product strategist identifying missing features.
Compare the competitor features against what Formly already has and identify gaps.
Return ONLY JSON array with this exact structure:
[{
  "featureName": "concise feature name",
  "featureDescription": "what it does and how to implement it in ~30 words",
  "competitorName": "which competitor has it",
  "priority": "high|medium|low",
  "complexity": "easy|medium|hard"
}]
Focus on: easy/medium complexity features that would delight users. Max 5 gaps.
Ignore: enterprise features, auth requirements, complex integrations.`,
    },
    {
      role: 'user',
      content: `Tool: ${tool.name} (${tool.slug})
Formly already has: ${tool.features.join(', ')}

Competitor features:
${allCompetitorFeatures.join('\n')}`,
    },
  ], { maxTokens: 500, temperature: 0.3 });

  try {
    const cleaned = sanitizeJsonString(raw);
    const gaps = JSON.parse(cleaned) as Array<{
      featureName: string;
      featureDescription: string;
      competitorName: string;
      priority: string;
      complexity: string;
    }>;

    return gaps.map(g => ({
      toolSlug: tool.slug,
      competitorName: g.competitorName,
      competitorUrl: competitorData.find(c => c.name === g.competitorName)?.url ?? '',
      featureName: g.featureName,
      featureDescription: g.featureDescription,
      priority: (g.priority as FeatureGap['priority']) ?? 'medium',
      complexity: (g.complexity as FeatureGap['complexity']) ?? 'medium',
    }));
  } catch {
    return [];
  }
}

// ── Feature implementation ────────────────────────────────────────────────────

async function generateFeatureImplementation(
  tool: ToolDefinition,
  gap: { id: string; featureName: string; featureDescription: string; competitorName: string }
): Promise<{ patchedContent: string; explanation: string } | null> {
  if (!isGitHubConfigured()) return null;

  const sourceFile = await getFileContent(tool.sourceFile);
  if (!sourceFile) return null;

  const sourceLines = sourceFile.content.split('\n');
  const truncatedSource = sourceLines.slice(0, 180).join('\n');

  const raw = await callAI([
    {
      role: 'system',
      content: `You are a senior TypeScript/Next.js engineer adding a new feature to an existing API route.
File: ${tool.sourceFile}
Tool: ${tool.name}

Add the requested feature while preserving all existing functionality.
Make minimal, targeted changes. The implementation must be production-ready.

Respond ONLY with valid JSON:
{
  "summary": "One sentence describing what was added",
  "patchedFile": "// COMPLETE updated TypeScript file"
}`,
    },
    {
      role: 'user',
      content: `Feature to add: ${gap.featureName}
Description: ${gap.featureDescription}
Seen in: ${gap.competitorName}

Current source (first 180 lines):
\`\`\`typescript
${truncatedSource}
\`\`\``,
    },
  ], { maxTokens: 3000, temperature: 0.15, skipCache: true });

  try {
    const cleaned = sanitizeJsonString(raw);
    const parsed = JSON.parse(cleaned) as { summary: string; patchedFile: string };
    if (!parsed.patchedFile || parsed.patchedFile.length < 100) return null;
    return { patchedContent: parsed.patchedFile, explanation: parsed.summary };
  } catch {
    return null;
  }
}

// ── Main agent run ────────────────────────────────────────────────────────────

export async function runToolQAAgent(trigger = 'cron'): Promise<QARunResult> {
  console.log('[Tool QA Agent] Starting run…');
  const runStart = Date.now();

  const result: QARunResult = {
    toolsTested: [],
    testsRun: 0,
    testsPassed: 0,
    testsFailed: 0,
    bugsFiled: 0,
    prUrls: [],
    featuresIdentified: 0,
    featurePrUrls: [],
    summary: '',
  };

  let bugPRsCreated = 0;
  let featurePRsCreated = 0;

  // ── Phase 1: Select tools ─────────────────────────────────────────────────
  const tools = await selectToolsToTest();
  console.log(`[Tool QA Agent] Testing ${tools.length} tools: ${tools.map(t => t.slug).join(', ')}`);

  // ── Phase 2: Test each tool ───────────────────────────────────────────────
  for (const tool of tools) {
    console.log(`\n[Tool QA Agent] Testing: ${tool.name} (${tool.testCases.length} tests)`);

    const testResults = await runToolTests(tool);
    const summary = summarizeResults(testResults);

    result.toolsTested.push(tool.slug);
    result.testsRun += summary.total;
    result.testsPassed += summary.passed;
    result.testsFailed += summary.failed + summary.errors;

    await markToolTested(tool.slug, summary.passRate);

    // ── Phase 3: Bug analysis and fix PRs ────────────────────────────────
    const failures = testResults.filter(r => r.status !== 'pass');
    if (failures.length > 0 && bugPRsCreated < MAX_BUG_FIX_PRS_PER_RUN) {
      console.log(`  [QA] ${failures.length} failures found — analyzing bugs`);

      // Check for duplicate recent bugs
      const recentBugDescriptions = await getRecentOpenBugsForTool(tool.slug);

      for (const failure of failures) {
        const severity = classifyBugSeverity(failure, tool.slug);

        const bugReport: BugReport = {
          toolSlug: tool.slug,
          testName: failure.testName,
          errorType: failure.response?.status !== undefined && failure.response.status >= 500
            ? 'server_error'
            : failure.error?.includes('Timeout') ? 'timeout'
            : failure.validationResult?.reason?.includes('Missing fields') ? 'missing_field'
            : 'wrong_response',
          description: `${tool.name}: ${failure.testName} — ${failure.validationResult?.reason ?? failure.error ?? 'test failed'}`,
          testInput: failure.response ? undefined : undefined,
          expected: failure.validationResult?.reason,
          actual: { status: failure.response?.status, snippet: failure.response?.text?.slice(0, 300) },
          severity,
        };

        // Skip if duplicate
        const isDuplicate = recentBugDescriptions.some(d => d.includes(failure.testName));
        if (isDuplicate) {
          console.log(`  [QA] Skipping duplicate bug: ${failure.testName}`);
          continue;
        }

        const bugId = await storeBug(bugReport);

        // Only attempt fix PR for critical/high bugs with GitHub configured
        if ((severity === 'critical' || severity === 'high') && bugPRsCreated < MAX_BUG_FIX_PRS_PER_RUN) {
          const fix = await generateBugFix(tool, failures);
          if (fix && bugId) {
            const date = new Date().toISOString().split('T')[0];
            const branchName = `agent/bugfix-${tool.slug}-${date}`;
            const prUrl = await createPR({
              branchName,
              title: `[QA Agent] Fix ${tool.name}: ${failure.testName}`,
              body: `## Bug Report\n\n**Tool:** ${tool.name}\n**Test:** ${failure.testName}\n**Severity:** ${severity}\n\n### Root Cause\n${fix.explanation}\n\n### Tests Fixed\n${failures.map(f => `- \`${f.testName}\`: ${f.validationResult?.reason ?? f.error}`).join('\n')}\n\n*Auto-generated by Formly Tool QA Agent on ${new Date().toISOString()}*`,
              files: [{ path: tool.sourceFile, content: fix.patchedContent }],
              labels: ['bug', 'qa-agent', severity],
            });

            if (prUrl) {
              await updateBugWithPR(bugId, prUrl);
              result.prUrls.push(prUrl);
              bugPRsCreated++;
              console.log(`  [QA] Bug fix PR created: ${prUrl}`);
            }
          }
        }
        result.bugsFiled++;
      }
    }

    // Small delay between tools
    await new Promise(r => setTimeout(r, 2000));
  }

  // ── Phase 4: Competitor analysis (for COMPETITOR_TOOLS_PER_RUN tools) ────
  const toolsForCompetitorAnalysis = tools.slice(0, COMPETITOR_TOOLS_PER_RUN);

  for (const tool of toolsForCompetitorAnalysis) {
    if (!tool.competitors.length) continue;
    console.log(`\n[Tool QA Agent] Competitor analysis: ${tool.name}`);

    const competitorData: CompetitorFeatures[] = [];

    for (const comp of tool.competitors.slice(0, 3)) {
      const features = await fetchCompetitorFeatures(tool.slug, comp);
      if (features) {
        competitorData.push(features);
        console.log(`  [QA] ${comp.name}: ${features.features.length} features extracted`);
      }
      await new Promise(r => setTimeout(r, 1500));
    }

    if (competitorData.length === 0) continue;

    // Identify gaps
    const gaps = await identifyFeatureGaps(tool, competitorData);
    console.log(`  [QA] ${gaps.length} feature gaps identified for ${tool.name}`);

    for (const gap of gaps) {
      await storeFeatureGap(gap);
      result.featuresIdentified++;
    }

    // ── Phase 5: Implement top-priority easy feature ──────────────────────
    if (featurePRsCreated < MAX_FEATURE_PRS_PER_RUN) {
      const topGap = await getTopUnimplementedGap(tool.slug);
      if (topGap) {
        console.log(`  [QA] Implementing feature: ${topGap.featureName}`);
        const impl = await generateFeatureImplementation(tool, topGap);

        if (impl) {
          const date = new Date().toISOString().split('T')[0];
          const branchName = `agent/feature-${tool.slug}-${date}`;
          const prUrl = await createPR({
            branchName,
            title: `[QA Agent] Add feature to ${tool.name}: ${topGap.featureName}`,
            body: `## New Feature\n\n**Tool:** ${tool.name}\n**Feature:** ${topGap.featureName}\n**Inspired by:** ${topGap.competitorName}\n\n### What was added\n${impl.explanation}\n\n### Description\n${topGap.featureDescription}\n\n*Auto-generated by Formly Tool QA Agent on ${new Date().toISOString()}*`,
            files: [{ path: tool.sourceFile, content: impl.patchedContent }],
            labels: ['enhancement', 'qa-agent'],
          });

          if (prUrl) {
            await updateFeatureGapWithPR(topGap.id, prUrl);
            result.featurePrUrls.push(prUrl);
            featurePRsCreated++;
            console.log(`  [QA] Feature PR created: ${prUrl}`);
          }
        }
      }
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  // ── Phase 6: Log and summarize ────────────────────────────────────────────
  const durationSec = Math.round((Date.now() - runStart) / 1000);
  const passRate = result.testsRun > 0 ? Math.round((result.testsPassed / result.testsRun) * 100) : 100;

  result.summary = [
    `Tested ${result.toolsTested.length} tools · ${result.testsRun} tests · ${passRate}% pass rate`,
    result.testsFailed > 0 ? `${result.testsFailed} failures · ${result.bugsFiled} bugs filed` : 'All tests passed',
    result.prUrls.length > 0 ? `${result.prUrls.length} fix PR(s) created` : '',
    result.featuresIdentified > 0 ? `${result.featuresIdentified} feature gaps identified · ${result.featurePrUrls.length} feature PR(s) created` : '',
    `Duration: ${durationSec}s`,
  ].filter(Boolean).join(' | ');

  await logQARun(result, trigger);

  // Send email summary if Resend is configured
  await sendSummaryEmail(result).catch(err => console.error('[Tool QA Agent] Email error:', err));

  console.log(`\n[Tool QA Agent] Done. ${result.summary}`);
  return result;
}

// ── Summary email ─────────────────────────────────────────────────────────────

async function sendSummaryEmail(result: QARunResult): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const passRate = result.testsRun > 0 ? Math.round((result.testsPassed / result.testsRun) * 100) : 100;
  const statusEmoji = passRate >= 90 ? '✅' : passRate >= 70 ? '⚠️' : '🚨';

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'qa-agent@formly.tools',
      to: ['dubdubgophew@gmail.com'],
      subject: `${statusEmoji} Formly QA Agent — ${passRate}% pass rate (${new Date().toLocaleDateString()})`,
      html: `
        <h2>Daily Tool QA Report</h2>
        <p><strong>Tools tested:</strong> ${result.toolsTested.join(', ')}</p>
        <p><strong>Tests:</strong> ${result.testsPassed}/${result.testsRun} passed (${passRate}%)</p>
        <p><strong>Bugs filed:</strong> ${result.bugsFiled}</p>
        ${result.prUrls.length > 0 ? `<p><strong>Bug fix PRs:</strong><br>${result.prUrls.map(u => `<a href="${u}">${u}</a>`).join('<br>')}</p>` : ''}
        <p><strong>Feature gaps identified:</strong> ${result.featuresIdentified}</p>
        ${result.featurePrUrls.length > 0 ? `<p><strong>Feature PRs:</strong><br>${result.featurePrUrls.map(u => `<a href="${u}">${u}</a>`).join('<br>')}</p>` : ''}
        <hr>
        <p style="color:#666;font-size:12px">View dashboard: <a href="https://formly.tools/dashboard/seo?secret=${process.env.ADMIN_SECRET}">formly.tools/dashboard/seo</a></p>
      `,
    }),
  });
}
