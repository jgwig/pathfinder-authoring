You are an expert developer working on the **Pathfinder Authoring Tool**. This is a visual workflow system using **Next.js 15**, **Payload CMS 3**, and **React Flow**.

Follow these project-specific instructions and constraints for all code generation.

## 1. Tech Stack & Constraints

- **Framework:** Next.js 15.5.9 (App Router). Prefer Server Components by default; use `"use client"` only for interactive UI.
- **Language:** TypeScript (Strict mode).
- **CMS:** Payload CMS 3.63.0 with SQLite adapter.
- **Visual Lib:** React Flow (`@xyflow/react`) 12.8.5.
- **Styling:** Tailwind CSS 4 + Radix UI.
- **State:** React Context API only (No Redux/Zustand).
- **React:** v19.1.0.

## 2. Project Directory Structure & Aliases

- **Imports:** Always use `@/*` alias for `src/`.
- **Key Paths:**
- `src/app/(app)/`: Main authenticated UI routes.
- `src/app/(payload)/`: CMS admin and API routes.
- `src/components/flow/`: React Flow canvas components.
- `src/nodes/` & `src/edges/`: Custom React Flow elements.
- `src/actions/`: Next.js Server Actions (database mutations).

## 3. Coding Patterns & Rules

### A. React Flow & State Management

- **Ref-Based Tracking:** When modifying flow state, always check `isLocalChangeRef` (in `use-flow-state.ts`).
- Set `isLocalChangeRef.current = true` when the **user** triggers a change (drag, edit, connect).
- Do not set it for external/server updates to prevent save loops.

- **Sanitization:** Before saving to DB, use `sanitizeFlowData()` to strip internal React Flow fields.
- **Versioning:** Check `isPreviewingVersion` before allowing writes. If true, disable editing UI.

### B. Content Blocks (Polymorphic Data)

- **Typing:** Use the `ContentBlockType` discriminated union from `src/types/content.ts` (types: `intro` | `video` | `assessment`, etc.).
- **Architecture:** Every block type must have:

1. A definition in the Union Type.
2. A component in `src/components/content-blocks/editor/` (for editing).
3. A component in `src/components/content-blocks/preview/` (for display).

- **Form Data:** Assessment inputs are stored in `node.data.state` (local to the node), not global state.

### C. Criteria & Edge Logic

- **Recursion:** Logic is stored in `CriteriaEdge` using recursive groups.
- Structure: `{ type: "and" | "or", conditions: [...] }`.

- **Evaluation:** Use `src/utils/criteria/evaluate.ts`. Inputs are fetched from the source node's form state.

### D. Payload CMS & Server Actions

- **Mutations:** Use Server Actions in `src/actions/` for all DB writes.
- **Context:** After a Server Action completes, manually update the local React Context (`PathwayProvider`) to reflect changes.
- **Versions:** `updatePathway` automatically creates versions in Payload. Do not manually create version docs.

## 4. Critical File Context

When asked about specific logic, prioritize reading these files:

- **Canvas Logic:** `src/hooks/use-flow-state.ts`
- **Conditional Edges:** `src/edges/criteria-edge.tsx`
- **Evaluator:** `src/utils/criteria/evaluate.ts`
- **Data Models:** `src/types/flow/flow.ts` and `src/types/content.ts`

## 5. Tailwind & UI Style

- **Config:** Tailwind 4 (CSS variables).
- **Class Sorting:** Organize classes logically (Layout -> Box Model -> Typography -> Visuals).
- **Components:** Use Radix UI primitives for complex interactions (Dialogs, Popovers).

## 6. Common Tasks Reference

**Adding a new Content Block:**

1. Update `ContentBlockType` in `src/types/content.ts`.
2. Create `Editor` component in `components/content-blocks/editor`.
3. Create `Preview` component in `components/content-blocks/preview`.
4. Register in the block registry.

**Modifying Edge Logic:**

- Edges support nested groups. Ensure `CriteriaEdge` updates handle deep object updates for nested `conditions`.

**Database Schema:**

- `Pathways` collection contains a `data` JSON field. This is where the React Flow object lives (`nodes`, `edges`, `viewport`).
