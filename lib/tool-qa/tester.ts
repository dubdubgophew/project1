/**
 * HTTP test runner for Formly Tools API endpoints
 * Makes real HTTP calls and validates responses against test case specifications
 */

import type { ToolDefinition, TestCase, TestResult, TestResponse } from './types';

const REQUEST_TIMEOUT_MS = 30000;
const DELAY_BETWEEN_TESTS_MS = 800;

async function fetchWithTimeout(url: string, opts: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function runSingleTest(tc: TestCase): Promise<TestResult> {
  const start = Date.now();

  try {
    let body: BodyInit | undefined;
    const headers: Record<string, string> = { ...(tc.headers ?? {}) };

    if (tc.formData) {
      const fd = new FormData();
      for (const [k, v] of Object.entries(tc.formData)) fd.append(k, v);
      body = fd;
    } else if (tc.body !== undefined) {
      body = JSON.stringify(tc.body);
      headers['Content-Type'] = 'application/json';
    }

    const raw = await fetchWithTimeout(tc.path, { method: tc.method, headers, body }, REQUEST_TIMEOUT_MS);
    const durationMs = Date.now() - start;

    // Parse body
    const contentType = raw.headers.get('content-type') ?? '';
    const text = await raw.text();
    let parsedBody: unknown = text;
    if (contentType.includes('application/json')) {
      try { parsedBody = JSON.parse(text); } catch { /* keep as text */ }
    }

    const res: TestResponse = {
      status: raw.status,
      ok: raw.ok,
      body: parsedBody,
      text,
      headers: Object.fromEntries(raw.headers.entries()),
      durationMs,
    };

    // Check expected status
    const expectedStatuses = Array.isArray(tc.expectedStatus) ? tc.expectedStatus : [tc.expectedStatus];
    if (!expectedStatuses.includes(raw.status)) {
      return {
        testName: tc.name,
        description: tc.description,
        status: 'fail',
        durationMs,
        response: res,
        validationResult: {
          pass: false,
          reason: `Expected status ${expectedStatuses.join(' or ')}, got ${raw.status}`,
          details: { responseText: text.slice(0, 300) },
        },
      };
    }

    // Run validator
    const validationResult = tc.validate(res);
    return {
      testName: tc.name,
      description: tc.description,
      status: validationResult.pass ? 'pass' : 'fail',
      durationMs,
      response: res,
      validationResult,
    };

  } catch (err: unknown) {
    const durationMs = Date.now() - start;
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    return {
      testName: tc.name,
      description: tc.description,
      status: isTimeout ? 'error' : 'error',
      durationMs,
      error: isTimeout ? `Timeout after ${REQUEST_TIMEOUT_MS}ms` : String(err),
    };
  }
}

export async function runToolTests(tool: ToolDefinition): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const tc of tool.testCases) {
    const result = await runSingleTest(tc);

    const icon = result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '!';
    const reason = result.status !== 'pass'
      ? ` — ${result.validationResult?.reason ?? result.error ?? 'unknown'}`
      : '';
    console.log(`  [${icon}] ${tc.name} (${result.durationMs}ms)${reason}`);

    results.push(result);

    // Delay to avoid overwhelming the API and rate limiter
    if (tool.testCases.indexOf(tc) < tool.testCases.length - 1) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_TESTS_MS));
    }
  }

  return results;
}

export function summarizeResults(results: TestResult[]): {
  total: number;
  passed: number;
  failed: number;
  errors: number;
  passRate: number;
} {
  const total = results.length;
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const errors = results.filter(r => r.status === 'error').length;
  return { total, passed, failed, errors, passRate: total > 0 ? Math.round((passed / total) * 100) : 100 };
}

export function classifyBugSeverity(result: TestResult, toolSlug: string): 'critical' | 'high' | 'medium' | 'low' {
  if (result.status === 'error') return 'high';
  const { validationResult, testName } = result;
  if (!validationResult) return 'medium';

  // Critical: happy path failures or complete response format failures
  if (testName.startsWith('happy_path') && !validationResult.pass) return 'critical';
  if (validationResult.reason?.includes('Response is not') || validationResult.reason?.includes('Missing fields')) return 'high';

  // High: server errors or timeouts
  if (result.response?.status !== undefined && result.response.status >= 500) return 'high';
  if (result.error?.includes('Timeout')) return 'high';

  // Low: validation tests that should return 400 but don't
  if (testName.startsWith('validation_')) return 'low';

  return 'medium';
}
