/**
 * Prompt Utils
 * 
 * Spec-Kitから各種アーティファクトを生成するためのプロンプトテンプレート
 */
import type { AgentSpec } from '$lib/types';
import { stringifyYaml } from '$lib/utils/yaml-utils';

/**
 * UI Mock生成用プロンプト
 */
export function buildUiPrompt(spec: AgentSpec): string {
    return `Generate a high-quality, modern UI mockup in a single HTML file using Tailwind CSS based on the following agent specification.

# Agent Specification
Role: ${spec.role}
Constraints:
${spec.constraints.map(c => `- ${c}`).join('\n')}

# Requirements for the Output
1. **Single HTML File**: Return ONLY the HTML code. Do not wrap it in markdown block.
2. **Tailwind CSS**: Use CDN <script src="https://cdn.tailwindcss.com"></script>.
3. **Design**: Modern, clean, and responsive design. Use Lucide Icons or similar via CDN if needed.
4. **Content**: The UI should reflect the agent's role and capabilities. Include form inputs if inputs are specified (or inferred from role).
5. **No Explanations**: Output pure HTML code only.

# Capability Context
${spec.capabilities.join(', ')}
`;
}

/**
 * API Spec (OpenAPI) 生成用プロンプト
 */
export function buildApiPrompt(spec: AgentSpec): string {
    return `Generate an OpenAPI 3.0 (YAML) specification based on the following agent specification.

# Agent Specification
Name: ${spec.name}
Role: ${spec.role}
Inputs: (Inferred from role)
Outputs: (Inferred from role)

# Requirements for the Output
1. **YAML Only**: Return ONLY the YAML code. Do not wrap it in markdown block.
2. **OpenAPI 3.0**: Use standard OpenAPI 3.0 format.
3. **Paths**: Define endpoints that correspond to the agent's capabilities.
4. **Schemas**: Define request/response schemas based on the inputs/outputs.
5. **No Explanations**: Output pure YAML code only.

# Input YAML
${stringifyYaml(spec)}
`;
}

// 他のアーティファクト用プロンプトもここに追加
