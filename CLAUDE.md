# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pathfinder Authoring Tool - A visual pathway/workflow authoring system built on Next.js 15, Payload CMS, and React Flow. Users create interactive pathways as directed acyclic graphs (DAGs) with conditional branching logic and form-based assessments.

## Development Commands

```bash
# Development
npm run dev          # Start Next.js dev server on http://localhost:3000

# Build
npm run build        # Production build

# Production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15.5.9 (App Router) + React 19.1.0
- **CMS/Backend**: Payload CMS 3.63.0 with SQLite adapter
- **Visual Editor**: @xyflow/react 12.8.5 (React Flow)
- **UI**: Radix UI + Tailwind CSS 4
- **State**: React Context API (no Redux/Zustand)

### Application Structure

```
src/
├── app/
│   ├── (app)/              # Main authenticated routes
│   │   └── (home)/         # Pathway editor UI
│   └── (payload)/          # Payload CMS admin + API routes
├── collections/            # Payload collections: Users, Media, Pathways
├── providers/              # React Context providers (layered)
├── components/
│   ├── flow/              # Flow canvas UI components
│   ├── content-blocks/    # Block renderers (editor/preview)
│   └── layout/            # App layout (sidebar, inspector)
├── nodes/                 # Custom React Flow node types
├── edges/                 # Custom React Flow edge types
├── hooks/                 # Flow state & persistence hooks
├── types/                 # TypeScript definitions
├── utils/                 # Criteria evaluation, validation
└── actions/               # Next.js Server Actions
```

### Provider Hierarchy

Providers are nested in this order (from `src/app/(app)/layout.tsx`):

```
AuthProvider            # User authentication
└── PathwayProvider     # Pathway CRUD, versioning
    └── FlowProvider    # React Flow canvas state
        └── ServicesProvider  # External service catalog
```

Each provider exposes a `useXxx()` hook for accessing its context.

### Core Data Flow

1. **PathwayFlowData** (`src/types/flow/flow.ts`):
   - Contains: `nodes[]`, `edges[]`, `viewport`
   - Stored as JSON in Payload's `pathways.data` field

2. **Node Types**:
   - **StageNode**: Main content container with multiple content blocks (title, paragraph, video, image, assessment, recommendation, etc.)
   - **CriteriaNode**: Placeholder (minimal implementation currently)

3. **Edge System**:
   - **CriteriaEdge** (`src/edges/criteria-edge.tsx`): Contains conditional logic
   - Displays inline on canvas with validation status (green/red)
   - Supports nested AND/OR condition groups
   - Evaluates against source node's form state

### State Management

**useFlowState** (`src/hooks/use-flow-state.ts`):
- Centralizes React Flow canvas state
- Uses `isLocalChangeRef` to track user edits vs. external updates
- Handles node duplication, deletion, and edge creation
- Key pattern: Sets `isLocalChangeRef.current = true` on user interaction

**useFlowPersistence** (`src/hooks/use-flow-persistence.ts`):
- Encapsulates save/restore/reset operations
- Supports debounced auto-save (currently disabled)
- Prevents writes during version preview mode

**PathwayProvider** (`src/providers/pathway/pathway-provider.tsx`):
- Main pathway CRUD operations
- Version history management
- Server action integration
- Maintains isDirty/isLoading/isAutoSaving flags

### Content Blocks System

**Block Types** (`src/types/content.ts`):
- `ContentBlockType` union: "intro" | "title" | "paragraph" | "video" | "image" | "assessment" | "recommendation" | "externalRecommendation" | "component" | "dropdown" | "html" | "column" | "assessmentResult"
- Each block has: `type`, `id` (UUID), `data`, optional `config.tailwindClasses`
- **Assessment blocks** collect form input stored in `node.data.state`
- **Recommendation blocks** reference external services by slug + council

**Rendering**:
- `src/components/content-blocks/preview/` - Display mode
- `src/components/content-blocks/editor/` - Edit mode
- Parallel renderer registries for each block type

### Criteria & Conditional Logic

**Evaluation Engine** (`src/utils/criteria/evaluate.ts`):

```typescript
interface ConditionGroup {
  type: "and" | "or";
  conditions: (Condition | ConditionGroup)[];  // Recursive nesting
}

interface Condition {
  key: string;                // e.g., "formId.fieldName"
  operator: Operator;         // equals, not_equals, greater_than, less_than, in, not_in, matches_regex, etc.
  value: CriteriaPrimitive | CriteriaPrimitive[] | RegExp;
}

interface Calculation {
  outputKey: string;
  operation: "countWhere" | "sum";
  inputKeys: string[];
  filter?: { operator, value };
}
```

**Evaluation Flow**:
1. Extract form data from source node's assessment blocks
2. Run calculations (aggregations, counts)
3. Recursively evaluate condition groups
4. Return boolean for edge validity

**CriteriaEdge** renders:
- Inline label showing conditions
- Color indicator based on evaluation
- Edit UI for building conditions dynamically

### Persistence

**Payload Collections**:
- **Pathways** (`src/collections/Pathways.ts`):
  - Fields: `name`, `user` (relationship), `data` (JSON)
  - Versioning enabled (maxPerDoc: 50)
  - Versions created automatically on each update

**Server Actions** (`src/actions/flow-actions.ts`):
- `createPathwayAction(user, name, initialFlow)`
- `getPathways(user)`
- `updatePathway(user, pathwayId, flowData)` - Creates version automatically
- `getPathwayVersions(user, pathwayId)`
- `restorePathwayVersion(user, versionId)`
- `deletePathwayAction(user, pathwayId)`

### Services Integration

**Service Domain Model** (`src/types/service/service.ts`):
- External community services fetched from Daysix API
- Cached per council in ServicesProvider
- Referenced by recommendation blocks via slug
- Supports both "connection" and "signpost" types

## Key Architectural Patterns

1. **Ref-Based Change Tracking**: `isLocalChangeRef` distinguishes user edits from external updates, preventing unnecessary save loops

2. **Recursive Condition Evaluation**: Condition groups support arbitrary nesting with AND/OR logic

3. **Snapshot Serialization**: `getFlowSnapshot()` + `sanitizeFlowData()` handles React Flow's internal state cleanly

4. **Form Data Locality**: Assessment responses stored in `node.data.state` - each stage is isolated

5. **Type-Safe Block Rendering**: Discriminated unions via `block.type` with parallel editor/preview registries

6. **Provider Composition**: Layered contexts for auth → pathway → flow → services

## Configuration

**Environment Variables** (`.env`):
- `PAYLOAD_SECRET` - Payload CMS secret key
- `DATABASE_URI` - SQLite database path

**TypeScript Paths** (`tsconfig.json`):
- `@/*` → `./src/*`
- `@payload-config` → `./src/payload.config.ts`

**Next.js Config** (`next.config.ts`):
- Uses `withPayload()` wrapper
- Remote image patterns: All HTTPS hostnames allowed

## Important Notes

- **Payload Admin**: Access at `/admin` when dev server running
- **Database**: SQLite file-based (path in DATABASE_URI)
- **Version Control**: Payload's built-in versioning - 50 versions per pathway
- **Form State**: Stored per-node in `node.data.state`, not globally
- **Auto-Save**: Currently disabled in useFlowPersistence
- **CriteriaNode**: Placeholder implementation, not actively used
- **No Tests**: No test suite configured currently

## Critical Files

| File | Purpose |
|------|---------|
| `src/hooks/use-flow-state.ts` | Canvas state + event handling (298 lines) |
| `src/edges/criteria-edge.tsx` | Conditional logic editor + evaluator (812 lines) |
| `src/providers/pathway/pathway-provider.tsx` | Pathway CRUD + versioning (451 lines) |
| `src/utils/criteria/evaluate.ts` | Recursive criteria evaluation (301 lines) |
| `src/types/content.ts` | Content block type definitions (235 lines) |
| `src/collections/Pathways.ts` | Payload collection schema |
| `src/actions/flow-actions.ts` | Server actions for persistence |

## Code Modification Guidelines

- **Read First**: Always read existing files before modifying
- **Type Safety**: Leverage TypeScript discriminated unions for block types
- **Provider Updates**: When modifying state, ensure provider context updates local state after server actions
- **Flow Sanitization**: Use `sanitizeFlowData()` before saving to remove React Flow internals
- **Version Safety**: Check `isPreviewingVersion` flag before allowing writes
- **Change Detection**: Set `isLocalChangeRef.current = true` for user-initiated changes
- **Block Extensibility**: Follow existing block pattern (data type + preview/editor renderers)
