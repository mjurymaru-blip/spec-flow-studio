# Spec-Flow Studio

AI Agent Specification Editor with Diff Management — Companion tool for [Aether Console](https://github.com/mjurymaru-blip/aether-console).

## Overview

Spec-Flow Studio is a **YAML-based specification editor** for defining AI agent behaviors. It enables:

- 📝 **Spec-Kit Editor** — Edit agent specifications with syntax highlighting
- 🔍 **Constraint Visualization** — Highlight constraints that govern AI behavior
- ✨ **AI Artifact Generation** — Generate UI mocks, API specs, test cases via Gemini API
- 📊 **Communication Diagrams** — Visualize agent interactions with Mermaid
- 🔄 **Diff Management** — Track specification changes with version history
- 🔌 **WebSocket Integration** — Real-time sync with Aether Console

## Tech Stack

- **Framework**: SvelteKit + Svelte 5 (Runes)
- **Editor**: CodeMirror 6
- **Diagrams**: Mermaid
- **AI**: Google Gemini API
- **Real-time**: WebSocket (ws)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Integration with Aether Console

Spec-Flow Studio connects to Aether Console via WebSocket:

```
Aether Console (localhost:5173) ⟷ Spec-Flow Studio (localhost:3001)
                                   WebSocket: ws://localhost:3001/api/ws
```

## License

MIT
