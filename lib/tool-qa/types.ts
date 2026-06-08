/**
 * Shared types for the Tool QA Agent system
 */

export type TestStatus = 'pass' | 'fail' | 'skip' | 'error';
export type BugSeverity = 'critical' | 'high' | 'medium' | 'low';
export type BugStatus = 'open' | 'pr_created' | 'fixed' | 'wont_fix';
export type FeaturePriority = 'critical' | 'high' | 'medium' | 'low';
export type FeatureComplexity = 'easy' | 'medium' | 'hard';
export type FeatureStatus = 'identified' | 'pr_created' | 'implemented';

export interface TestCase {
  name: string;
  description: string;
  method: 'GET' | 'POST';
  path: string;
  body?: Record<string, unknown>;
  formData?: Record<string, string | Blob>;
  headers?: Record<string, string>;
  expectedStatus: number | number[];
  validate: (res: TestResponse) => ValidationResult;
}

export interface TestResponse {
  status: number;
  ok: boolean;
  body: unknown;
  text: string;
  headers: Record<string, string>;
  durationMs: number;
}

export interface ValidationResult {
  pass: boolean;
  reason?: string;
  details?: Record<string, unknown>;
}

export interface TestResult {
  testName: string;
  description: string;
  status: TestStatus;
  durationMs: number;
  response?: TestResponse;
  validationResult?: ValidationResult;
  error?: string;
}

export interface ToolDefinition {
  slug: string;
  name: string;
  category: string;
  apiPath: string;           // primary API route path (relative, e.g. /api/tools/grammar)
  sourceFile: string;        // path in repo, e.g. app/api/tools/grammar/route.ts
  testCases: TestCase[];
  features: string[];        // current formly feature list for this tool
  competitors: CompetitorRef[];
}

export interface CompetitorRef {
  name: string;
  url: string;
  category: string;
}

export interface BugReport {
  toolSlug: string;
  testName: string;
  errorType: 'validation_error' | 'wrong_response' | 'server_error' | 'timeout' | 'wrong_format' | 'missing_field';
  description: string;
  testInput: unknown;
  expected: unknown;
  actual: unknown;
  severity: BugSeverity;
}

export interface FeatureGap {
  toolSlug: string;
  competitorName: string;
  competitorUrl: string;
  featureName: string;
  featureDescription: string;
  priority: FeaturePriority;
  complexity: FeatureComplexity;
}

export interface CompetitorFeatures {
  name: string;
  url: string;
  features: string[];
  pricing?: string;
  strengths?: string[];
}

export interface QARunResult {
  toolsTested: string[];
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  bugsFiled: number;
  prUrls: string[];
  featuresIdentified: number;
  featurePrUrls: string[];
  summary: string;
}
