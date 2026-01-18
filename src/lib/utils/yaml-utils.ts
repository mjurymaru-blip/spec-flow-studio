/**
 * YAML Utilities
 *
 * Spec-Kit YAML のパース・シリアライズ用ユーティリティ
 */
import yaml from 'js-yaml';
import type { AgentSpec } from '$lib/types';

// スキーマバリデーションのre-export
export {
  validateSpecKit,
  validateSpecKitFully,
  validateAgent,
  detectForbiddenFields,
  type ValidationResult,
  type ValidationWarning
} from './spec-kit-schema';

/**
 * YAML文字列をAgentSpecの配列にパース
 */
export function parseSpecYaml(content: string): AgentSpec[] {
  try {
    const docs = yaml.loadAll(content) as Record<string, unknown>[];
    return docs
      .filter((doc) => doc && doc.kind === 'Agent')
      .map((doc) => convertToAgentSpec(doc));
  } catch (error) {
    console.error('YAML parse error:', error);
    throw new YamlParseError(error instanceof Error ? error.message : 'Unknown parse error');
  }
}

// キャッシュ用の構造
interface ParseCache {
  contentHash: string;
  specs: AgentSpec[];
}

let parseCache: ParseCache | null = null;

/**
 * 文字列のハッシュを生成（簡易版）
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

/**
 * キャッシュ付きYAMLパース（効率化版）
 * 同じ内容の場合はキャッシュを返す
 */
export function parseSpecYamlCached(content: string): AgentSpec[] {
  const contentHash = simpleHash(content);

  // キャッシュがあり、ハッシュが一致すればキャッシュを返す
  if (parseCache && parseCache.contentHash === contentHash) {
    return parseCache.specs;
  }

  // 新しくパース
  const specs = parseSpecYaml(content);

  // キャッシュを更新
  parseCache = {
    contentHash,
    specs
  };

  return specs;
}

/**
 * キャッシュをクリア
 */
export function clearParseCache(): void {
  parseCache = null;
}

/**
 * 単一のYAMLドキュメントをパース
 */
export function parseYaml<T>(content: string): T {
  try {
    return yaml.load(content) as T;
  } catch (error) {
    console.error('YAML parse error:', error);
    throw new YamlParseError(error instanceof Error ? error.message : 'Unknown parse error');
  }
}

/**
 * オブジェクトをYAML文字列にシリアライズ
 */
export function stringifyYaml(obj: unknown): string {
  return yaml.dump(obj, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false
  });
}

/**
 * AgentSpec配列をYAML文字列にシリアライズ（複数ドキュメント）
 */
export function stringifySpecs(specs: AgentSpec[]): string {
  return specs.map((spec) => stringifyYaml(convertFromAgentSpec(spec))).join('---\n');
}

/**
 * YAMLドキュメントをAgentSpecに変換
 */
function convertToAgentSpec(doc: Record<string, unknown>): AgentSpec {
  const metadata = doc.metadata as Record<string, unknown> || {};
  const spec = doc.spec as Record<string, unknown> || {};
  const communication = spec.communication as Record<string, string[]> || {};

  return {
    name: String(metadata.name || ''),
    displayName: String(metadata.displayName || metadata.name || ''),
    role: String(spec.role || ''),
    capabilities: Array.isArray(spec.capabilities) ? spec.capabilities : [],
    constraints: Array.isArray(spec.constraints) ? spec.constraints : [],
    communication: {
      canSendTo: Array.isArray(communication.canSendTo) ? communication.canSendTo : [],
      canReceiveFrom: Array.isArray(communication.canReceiveFrom) ? communication.canReceiveFrom : []
    }
  };
}

/**
 * AgentSpecをYAMLドキュメント形式に変換
 */
function convertFromAgentSpec(spec: AgentSpec): Record<string, unknown> {
  return {
    kind: 'Agent',
    version: 'v1',
    metadata: {
      name: spec.name,
      displayName: spec.displayName
    },
    spec: {
      role: spec.role,
      capabilities: spec.capabilities,
      constraints: spec.constraints,
      communication: spec.communication
    }
  };
}

/**
 * YAMLパースエラー
 */
export class YamlParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'YamlParseError';
  }
}

/**
 * YAMLの構文エラー情報を取得
 */
export function getYamlErrors(content: string): YamlError[] {
  const errors: YamlError[] = [];

  try {
    yaml.loadAll(content);
  } catch (error) {
    if (error instanceof yaml.YAMLException) {
      errors.push({
        line: error.mark?.line ?? 0,
        column: error.mark?.column ?? 0,
        message: error.reason || error.message
      });
    }
  }

  return errors;
}

export interface YamlError {
  line: number;
  column: number;
  message: string;
}

/**
 * デフォルトのエージェントテンプレート
 */
export const AGENT_TEMPLATE = `kind: Agent
version: v1
metadata:
  name: new-agent
  displayName: "New Agent"
  description: "エージェントの説明"
  icon: "🤖"

spec:
  role: |
    このエージェントの役割を記述します。

  capabilities:
    - capability-1
    - capability-2

  constraints:
    - "制約1: やってはいけないこと"
    - "制約2: 遵守すべきルール"

  inputs:
    - type: text
      description: "入力データの説明"

  outputs:
    - type: result
      schema:
        summary: string
        confidence: number

  communication:
    canSendTo:
      - other-agent
    canReceiveFrom:
      - other-agent
`;

/**
 * Analyzerエージェントのテンプレート
 */
export const ANALYZER_TEMPLATE = `kind: Agent
version: v1
metadata:
  name: analyzer
  displayName: "Analyzer"
  description: "情報解析エージェント"
  icon: "🔍"

spec:
  role: |
    入力データを分析し、構造化された情報を抽出する。
    パターンや異常を検出し、他のエージェントに報告する。

  capabilities:
    - data-analysis
    - pattern-recognition
    - anomaly-detection

  constraints:
    - "推測で情報を補完しない"
    - "確信度が低い場合は明示する"
    - "外部データを推測で補完しない"

  communication:
    canSendTo:
      - predictor
      - planner
      - monitor
    canReceiveFrom:
      - planner
      - monitor
`;
