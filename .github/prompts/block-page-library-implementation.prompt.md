# Block and Page Library Feature Implementation Plan

## Overview

Add a library system that allows users to save and reuse individual content blocks and entire stage nodes (pages) across their pathways. The library  
 will be user-scoped (each user has their own library), with a management UI for browsing, searching, organizing, and adding library items to  
 pathways.

## Key Architectural Decisions

1. **Deep Copy Approach**: Library items are stored as independent copies with regenerated UUIDs to prevent conflicts
2. **User Scoping**: Libraries are private per user with access control at the collection level
3. **Tag-Based Organization**: Flexible tagging system instead of rigid categories
4. **Tab-Based UI**: Add library tabs to existing sidebar for seamless access
5. **Event-Based Communication**: Use custom DOM events for cross-component coordination
6. **No Versioning**: Library items are templates/snippets (versioning can be added later if needed)  


---

## Implementation Steps

### Phase 1: Data Layer (New Payload Collections)

#### 1.1 Create BlockLibrary Collection

**File**: `src/collections/BlockLibrary.ts` (NEW)

- Collection slug: `"block-library"`
- Fields:
- `name` (text, required): Memorable name for the block
- `description` (textarea, optional): Description to help identify
- `user` (relationship to users, required): Owner
- `blockData` (json, required): Serialized ContentBlock data
- `blockType` (select, required): One of 13 ContentBlockType values for filtering
- `tags` (array of text, optional): Tags for organization
- `thumbnail` (upload relationship to media, optional): Visual preview
- Access control: Users see only their own blocks (filter by `user.id` for non-admins)
- Default sort: `-createdAt` (newest first)
- Timestamps: true  


#### 1.2 Create PageLibrary Collection

**File**: `src/collections/PageLibrary.ts` (NEW)

- Collection slug: `"page-library"`
- Fields:
- `name` (text, required): Memorable name
- `description` (textarea, optional): Description
- `user` (relationship to users, required): Owner
- `stageData` (json, required): Serialized StageNodeData (blocks, title, state)
- `blockCount` (number, readonly): Number of blocks in page (for display)
- `blockTypes` (array of text, readonly): Types of blocks contained (for filtering)
- `tags` (array of text, optional): Tags for organization
- `thumbnail` (upload relationship to media, optional): Preview
- Access control: Same user scoping as BlockLibrary
- Default sort: `-createdAt`
- Timestamps: true  


#### 1.3 Register Collections

**File**: `src/payload.config.ts` (MODIFY)

- Import both new collections: `import { BlockLibrary } from "./collections/BlockLibrary"`
- Add to collections array: `collections: [Users, Media, Pathways, BlockLibrary, PageLibrary]`  


#### 1.4 Create Type Definitions

**File**: `src/types/library.ts` (NEW)

- Define `BlockLibraryItem` interface matching BlockLibrary collection
- Define `PageLibraryItem` interface matching PageLibrary collection
- Define `LibraryFilters` interface with search, blockType, tags, sortBy, sortOrder fields  


---

### Phase 2: Server Actions (CRUD Operations)

#### 2.1 Block Library Actions

**File**: `src/actions/block-library-actions.ts` (NEW)

Implement the following server actions:

1. **`saveBlockToLibrary(user, name, block, description?, tags?)`**

- Deep clone block data with `JSON.parse(JSON.stringify())`
- Generate new UUID for the cloned block
- Create entry in block-library collection
- Return success/error result  


2. **`getBlockLibrary(user, filters?)`**

- Build where clause based on filters (blockType, search, tags)
- Query block-library with user scoping
- Return docs array and totalDocs  


3. **`deleteBlockFromLibrary(user, itemId)`**

- Delete item from collection with access control
- Return success/error  


4. **`getBlockFromLibrary(user, itemId)`**

- Fetch single item by ID
- Used for preview functionality  


#### 2.2 Page Library Actions

**File**: `src/actions/page-library-actions.ts` (NEW)

Implement parallel actions for pages:

1. **`savePageToLibrary(user, name, stageData, description?, tags?)`**

- Deep clone stageData including all blocks
- Regenerate UUIDs for all blocks
- Clear form state (`state: {}`) to avoid saving user input
- Calculate metadata: `blockCount` and `blockTypes` array
- Create entry in page-library collection  


2. **`getPageLibrary(user, filters?)`**

- Similar to block library with support for filtering by blockTypes  


3. **`deletePageFromLibrary(user, itemId)`**  

4. **`getPageFromLibrary(user, itemId)`**  


---

### Phase 3: UI Components (Library Management)

#### 3.1 Create Library Sidebar with Tabs

**File**: `src/components/layout/library-sidebar.tsx` (NEW)

- Wrap existing AppSidebar in a Tabs component
- Three tabs: "Pathways", "Blocks", "Pages"
- Tab panels contain: AppSidebar, BlockLibraryPanel, PageLibraryPanel respectively
- Include SidebarHeader with logo at top  


**File**: `src/app/(app)/(home)/layout.tsx` (MODIFY)

- Replace `<AppSidebar />` with `<LibrarySidebar />`
- Import the new component  


#### 3.2 Create Block Library Panel

**File**: `src/components/library/block-library-panel.tsx` (NEW)

- Header with "Block Library" title
- Filter component for search, block type, and tags
- Loading state with spinner
- Empty state message
- ScrollArea with grid/list of LibraryItemCard components
- Fetch library on mount and when filters change
- Handle delete action
- Emit custom event `"add-block-from-library"` when adding to canvas  


#### 3.3 Create Page Library Panel

**File**: `src/components/library/page-library-panel.tsx` (NEW)

- Similar structure to BlockLibraryPanel
- Emit custom event `"add-page-from-library"` when adding to canvas
- Show block count and types in item cards  


#### 3.4 Create Shared Components

**File**: `src/components/library/library-item-card.tsx` (NEW)

- Card component displaying library item
- Shows: name, description, block type icon, tags, thumbnail
- Actions: Preview button, Add to Canvas button, Delete button
- Click card to preview
- Responsive layout  


**File**: `src/components/library/library-filters.tsx` (NEW)

- Search input with debouncing (300ms)
- Block type Select dropdown
- Tag management with badges and remove buttons
- Updates filters via callback  


**File**: `src/components/library/save-block-dialog.tsx` (NEW)

- Dialog with form fields: name (required), description, tags (comma-separated)
- Save button calls `saveBlockToLibrary` server action
- Shows loading state during save
- Clears form and closes on success  


**File**: `src/components/library/save-page-dialog.tsx` (NEW)

- Similar to save-block-dialog but for pages
- Calls `savePageToLibrary` server action  


**File**: `src/components/library/library-preview-dialog.tsx` (NEW)

- Large dialog (max-w-4xl) with ScrollArea
- Shows library item name and description in header
- Renders block or page content using existing BlockPreview components
- Read-only preview (no editing)
- Optional: Add "Add to Canvas" button in footer  


---

### Phase 4: Integration Points

#### 4.1 Inspector Sidebar Integration

**File**: `src/components/layout/inspector-sidebar.tsx` (MODIFY)

Add the following features:

1. **"Save to Library" button for each block** (around line 155 in block cards):

```tsx
<Button
	variant="ghost"
	size="icon"
	onClick={() => handleSaveBlock(block)}
	title="Save to library"
>
	<BookmarkPlus className="h-4 w-4" />
</Button>
```

2. **"Add from Library" option** (add before "Add Block" dropdown around line 180):

- Add dropdown menu item that opens block library in sidebar or dialog
- Or add direct link/button to switch to Block Library tab  


3. **Event listener for adding blocks from library**:

```tsx
useEffect(() => {
	const handleAddBlock = (event: CustomEvent) => {
		const { block } = event.detail;
		const newBlock = new ContentBlock({
			...block,
			id: crypto.randomUUID(), // Fresh ID
		});
		setBlocks([...blocks, newBlock]);
	};

	window.addEventListener("add-block-from-library", handleAddBlock);
	return () =>
		window.removeEventListener("add-block-from-library", handleAddBlock);
}, [blocks]);
```

4. **Implement `handleSaveBlock` function**:

- Set state to open SaveBlockDialog
- Pass block data to dialog  


#### 4.2 Stage Node Context Menu

**File**: `src/nodes/stage-node.tsx` (MODIFY)

- Add "Save to Page Library" option to node's context menu or toolbar
- Open SavePageDialog when clicked
- Pass entire `node.data` to the dialog  


#### 4.3 Canvas Integration for Page Addition

**File**: `src/hooks/use-flow-state.ts` or `src/providers/flow/flow-provider.tsx` (MODIFY)

Add event listener for adding pages from library:

```tsx
useEffect(() => {
	const handleAddPage = (event: CustomEvent) => {
		const { stageData } = event.detail;

		// Create new stage node
		const newNode: Node<StageNodeData> = {
			id: `s${Date.now()}`, // or crypto.randomUUID()
			type: "stageNode",
			position: { x: 100, y: 100 }, // Position near viewport center
			data: {
				title: stageData.title,
				blocks: stageData.blocks.map((block) => ({
					...block,
					id: crypto.randomUUID(), // Regenerate IDs
				})),
				state: {},
			},
			selected: true,
		};

		setNodes((nds) => [...nds, newNode]);
	};

	window.addEventListener("add-page-from-library", handleAddPage);
	return () =>
		window.removeEventListener("add-page-from-library", handleAddPage);
}, [setNodes]);
```

---

### Phase 5: Polish & Testing

1. **Add loading states** to all async operations
2. **Add error handling** with user-friendly messages (toasts or inline errors)
3. **Test workflows**:

- Save block → browse library → add to different pathway
- Save page → preview → add to canvas → verify all blocks present
- Delete library items
- Search and filter
- Tag management

4. **Test edge cases**:

- Nested blocks (Column, Dropdown)
- Assessment blocks with form state
- Recommendation blocks with service metadata
- Multiple additions from same library item (verify unique IDs)

5. **Test access control**: Create multiple test users, verify isolation
6. **UI polish**: Loading spinners, empty states, responsive design  


---

## Critical Files to Create

1. `src/collections/BlockLibrary.ts` - Block library collection config
2. `src/collections/PageLibrary.ts` - Page library collection config
3. `src/types/library.ts` - TypeScript type definitions
4. `src/actions/block-library-actions.ts` - Block CRUD server actions
5. `src/actions/page-library-actions.ts` - Page CRUD server actions
6. `src/components/layout/library-sidebar.tsx` - Tabbed sidebar wrapper
7. `src/components/library/block-library-panel.tsx` - Block library UI
8. `src/components/library/page-library-panel.tsx` - Page library UI
9. `src/components/library/library-item-card.tsx` - Shared item card
10. `src/components/library/library-filters.tsx` - Search and filters
11. `src/components/library/save-block-dialog.tsx` - Save block form
12. `src/components/library/save-page-dialog.tsx` - Save page form
13. `src/components/library/library-preview-dialog.tsx` - Preview modal  


## Critical Files to Modify

1. `src/payload.config.ts` - Register new collections
2. `src/app/(app)/(home)/layout.tsx` - Use LibrarySidebar instead of AppSidebar
3. `src/components/layout/inspector-sidebar.tsx` - Add save/add library buttons and event handling
4. `src/nodes/stage-node.tsx` - Add "Save to Library" option
5. `src/hooks/use-flow-state.ts` or `src/providers/flow/flow-provider.tsx` - Add page-from-library event handler  


---

## Verification Steps

### 1. Database Setup

- Run dev server to trigger Payload migrations
- Verify new collections appear in Payload admin at `/admin`
- Check that BlockLibrary and PageLibrary collections are visible
- Verify access control (users can't see other users' items)  


### 2. Save Functionality

- Create a block in the inspector
- Click "Save to Library" button
- Fill out save dialog (name, description, tags)
- Verify block appears in Block Library tab
- Repeat for entire page (stage node)  


### 3. Library Management

- Test search functionality (by name, description)
- Test block type filter
- Test tag filtering
- Test delete functionality with confirmation
- Verify UI shows correct block counts and metadata  


### 4. Add from Library

- Switch to Block Library tab
- Click "Add to Canvas" on a block
- Verify block appears in inspector when stage node selected
- Switch to Page Library tab
- Click "Add to Canvas" on a page
- Verify new stage node appears on canvas with all blocks  


### 5. Edge Cases

- Save and add a Column block with nested blocks
- Save and add a Dropdown block with nested content
- Save and add an Assessment block, verify form structure preserved
- Add same library item multiple times, verify unique IDs
- Test with multiple users (create test accounts)  


### 6. Integration Testing

- Create pathway A with assessment block
- Save block to library
- Create pathway B
- Add block from library
- Verify block works correctly in new pathway
- Test recommendation blocks with service metadata  


---

## Estimated Implementation Time

- Phase 1 (Data Layer): 2-3 hours
- Phase 2 (Server Actions): 2-3 hours
- Phase 3 (UI Components): 4-5 hours
- Phase 4 (Integration): 3-4 hours
- Phase 5 (Polish & Testing): 2-3 hours  


**Total**: 13-18 hours

---

## Future Enhancements (Out of Scope)

- Shared library (admin-curated blocks for all users)
- Auto-generated thumbnails (screenshot on save)
- Library import/export
- Version control for library items
- Usage analytics
- Smart suggestions based on context
- Collaborative libraries (sharing with specific users)
