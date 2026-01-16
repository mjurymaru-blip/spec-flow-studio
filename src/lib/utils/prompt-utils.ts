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

/**
 * テストケース生成用プロンプト
 */
export function buildTestCasePrompt(spec: AgentSpec): string {
    return `Generate comprehensive test cases for the following AI agent specification.

# Agent Specification
Name: ${spec.name}
Display Name: ${spec.displayName}
Role: ${spec.role}
Capabilities: ${spec.capabilities.join(', ')}
Constraints: ${spec.constraints.join(', ')}

# Requirements for the Output
1. **Markdown Format**: Return test cases in Markdown format with tables.
2. **Categories**: Include positive tests, negative tests, edge cases, and constraint validation tests.
3. **Structure**: Each test case should have: ID, Category, Description, Input, Expected Output, Priority.
4. **Constraint Tests**: Specifically test that each constraint is enforced.
5. **No Explanations**: Start directly with the test case table.

# Example Format
| ID | Category | Description | Input | Expected Output | Priority |
|----|----------|-------------|-------|-----------------|----------|
| TC-001 | Positive | ... | ... | ... | High |
`;
}

/**
 * ユースケース図(Mermaid)生成用プロンプト
 */
export function buildUseCasePrompt(specs: AgentSpec[]): string {
    const agentList = specs.map(s => `- ${s.displayName}: ${s.role}`).join('\n');

    return `Generate a Mermaid use case diagram based on the following multi-agent system specification.

# Agents
${agentList}

# Communication
${specs.map(s => `${s.name} can send to: ${s.communication.canSendTo.join(', ') || 'none'}`).join('\n')}

# Requirements for the Output
1. **Mermaid Only**: Return ONLY the Mermaid diagram code. Do not wrap it in markdown code block.
2. **Use Case Diagram**: Use Mermaid's flowchart syntax to represent actors and use cases.
3. **Show Relationships**: Show which agents interact with which use cases.
4. **Clean Layout**: Use subgraphs to group related elements.
5. **No Explanations**: Output pure Mermaid code only.

Start with: graph TB
`;
}

/**
 * エージェント間通信図(Mermaid)生成
 * ※ これはAI生成ではなく、Specから直接生成
 */
export function buildCommunicationDiagram(specs: AgentSpec[]): string {
    if (specs.length === 0) return 'graph LR\n  NoAgents[No agents defined]';

    const lines: string[] = ['graph LR'];

    // ノード定義
    specs.forEach(spec => {
        const icon = spec.role.includes('解析') || spec.displayName.includes('Analyzer') ? '🔍' : '🤖';
        lines.push(`  ${spec.name}["${icon} ${spec.displayName}"]`);
    });

    // 通信関係
    const validNames = new Set(specs.map(s => s.name));
    specs.forEach(spec => {
        spec.communication.canSendTo.forEach(target => {
            if (validNames.has(target)) {
                lines.push(`  ${spec.name} --> ${target}`);
            }
        });
    });

    return lines.join('\n');
}

