import type { AnyBlockData, ContentBlock, Stage } from "@/types/content";

import type { Edge, Node } from "@xyflow/react";

export function nodesToStage(
  id: string,
  nodes: Node<{ block: ContentBlock<AnyBlockData> }>[],
  edges: Edge[]
): Stage {
  const blocks = nodes
    .slice()
    .sort((a, b) => (a.position.y - b.position.y) || (a.position.x - b.position.x))
    .map((n) => n.data.block);

  return {
    id,
    blocks,
    edges: edges.map((e) => ({ id: e.id!, source: e.source, target: e.target })),
  };
}

export function stageToNodesAndEdges(stage: Stage): {
  nodes: Node<{ block: ContentBlock<AnyBlockData> }>[];
  edges: Edge[];
} {
  const nodes: Node<{ block: ContentBlock<AnyBlockData> }>[] = stage.blocks.map((block, i) => ({
    id: block.id!,
    type: "contentBlock",
    position: { x: 100 * (i % 3), y: 120 * i },
    data: { block },
  }));

  const edges: Edge[] = stage.edges.map((e) => ({ id: e.id, source: e.source, target: e.target }));

  return { nodes, edges };
}