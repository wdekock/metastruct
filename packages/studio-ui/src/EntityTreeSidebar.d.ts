import React from "react";
export interface EntityTreeNode {
    id: string;
    label: string;
    type: "entity" | "sub-entity" | "workflow" | "rules";
    children?: EntityTreeNode[];
}
export declare const EntityTreeSidebar: React.FC<{
    nodes: EntityTreeNode[];
    selectedNodeId: string;
    onSelectNode: (nodeId: string, type: EntityTreeNode["type"]) => void;
    onAddEntity: () => void;
}>;
//# sourceMappingURL=EntityTreeSidebar.d.ts.map