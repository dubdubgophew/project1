/**
 * GitHub API wrapper for creating fix/feature PRs
 * Requires GITHUB_TOKEN env var (PAT with repo write access)
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'dubdubgophew';
const REPO = 'project1';
const BASE_BRANCH = 'claude/autonomous-saas-product-V9Uun';
const API_BASE = 'https://api.github.com';

async function ghFetch(endpoint: string, method: string, body?: unknown) {
  if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not configured');

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'FormlyTools-QA-Agent/1.0',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitHub ${method} ${endpoint}: HTTP ${res.status} — ${text.slice(0, 300)}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

export async function getFileContent(filePath: string): Promise<{ content: string; sha: string } | null> {
  try {
    const data = await ghFetch(`/repos/${OWNER}/${REPO}/contents/${filePath}?ref=${BASE_BRANCH}`, 'GET');
    return {
      content: Buffer.from(data.content as string, 'base64').toString('utf-8'),
      sha: data.sha as string,
    };
  } catch {
    return null;
  }
}

export async function getBaseBranchSha(): Promise<string | null> {
  try {
    const ref = await ghFetch(`/repos/${OWNER}/${REPO}/git/ref/heads/${BASE_BRANCH}`, 'GET');
    return (ref.object as { sha: string }).sha;
  } catch {
    return null;
  }
}

export async function createBranch(branchName: string, fromSha: string): Promise<boolean> {
  try {
    await ghFetch(`/repos/${OWNER}/${REPO}/git/refs`, 'POST', {
      ref: `refs/heads/${branchName}`,
      sha: fromSha,
    });
    return true;
  } catch (err) {
    // Branch may already exist
    if (String(err).includes('422')) return true;
    console.error('[GitHub] createBranch error:', err);
    return false;
  }
}

export async function upsertFile(
  filePath: string,
  content: string,
  commitMessage: string,
  branchName: string
): Promise<boolean> {
  try {
    const existing = await getFileContent(filePath);
    await ghFetch(`/repos/${OWNER}/${REPO}/contents/${filePath}`, 'PUT', {
      message: commitMessage,
      content: Buffer.from(content).toString('base64'),
      ...(existing ? { sha: existing.sha } : {}),
      branch: branchName,
    });
    return true;
  } catch (err) {
    console.error(`[GitHub] upsertFile ${filePath}:`, err);
    return false;
  }
}

export interface PRInput {
  branchName: string;
  title: string;
  body: string;
  files: Array<{ path: string; content: string }>;
  labels?: string[];
}

export async function createPR(input: PRInput): Promise<string | null> {
  if (!GITHUB_TOKEN) {
    console.log('[GitHub] GITHUB_TOKEN not set — PR creation skipped');
    return null;
  }

  const baseSha = await getBaseBranchSha();
  if (!baseSha) {
    console.error('[GitHub] Could not get base branch SHA');
    return null;
  }

  const created = await createBranch(input.branchName, baseSha);
  if (!created) return null;

  // Write all files to the new branch
  for (const file of input.files) {
    const ok = await upsertFile(
      file.path,
      file.content,
      `[QA Agent] ${input.title}`,
      input.branchName
    );
    if (!ok) {
      console.error(`[GitHub] Failed to write ${file.path} to branch ${input.branchName}`);
      return null;
    }
  }

  // Create the pull request
  try {
    const pr = await ghFetch(`/repos/${OWNER}/${REPO}/pulls`, 'POST', {
      title: input.title,
      body: input.body,
      head: input.branchName,
      base: BASE_BRANCH,
    });

    // Add labels if provided
    if (input.labels?.length) {
      await ghFetch(`/repos/${OWNER}/${REPO}/issues/${(pr as { number: number }).number}/labels`, 'POST', {
        labels: input.labels,
      }).catch(() => { /* labels may not exist, ignore */ });
    }

    return (pr as { html_url: string }).html_url;
  } catch (err) {
    console.error('[GitHub] createPR error:', err);
    return null;
  }
}

export function isGitHubConfigured(): boolean {
  return !!GITHUB_TOKEN;
}
