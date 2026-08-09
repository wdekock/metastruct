// src/analyzer/cycleDetector.ts
/**
 * Validates that the field dependency graph contains no circular references.
 * Uses Depth-First Search (DFS) with 3-color node tracking (White, Gray, Black).
 */
export function detectCyclicDependencies(fields) {
    const graph = new Map();
    // Build adjacency list
    for (const field of fields) {
        graph.set(field.id, field.dependsOn || []);
    }
    // Node states during DFS:
    // 0 = UNVISITED (White)
    // 1 = VISITING (Gray - currently in recursion stack)
    // 2 = VISITED (Black - fully processed)
    const state = new Map();
    const pathStack = [];
    for (const fieldId of graph.keys()) {
        state.set(fieldId, 0);
    }
    function dfs(nodeId) {
        state.set(nodeId, 1);
        pathStack.push(nodeId);
        const neighbors = graph.get(nodeId) || [];
        for (const neighbor of neighbors) {
            // If neighbor is not in the graph (e.g. static variable/external state), skip
            if (!graph.has(neighbor))
                continue;
            const neighborState = state.get(neighbor);
            if (neighborState === 1) {
                // Cycle detected: extract path from first occurrence of neighbor
                const cycleStartIndex = pathStack.indexOf(neighbor);
                return [...pathStack.slice(cycleStartIndex), neighbor];
            }
            if (neighborState === 0) {
                const cycle = dfs(neighbor);
                if (cycle)
                    return cycle;
            }
        }
        pathStack.pop();
        state.set(nodeId, 2);
        return null;
    }
    for (const nodeId of graph.keys()) {
        if (state.get(nodeId) === 0) {
            const cyclePath = dfs(nodeId);
            if (cyclePath) {
                return {
                    hasCycle: true,
                    cyclePath,
                };
            }
        }
    }
    return {
        hasCycle: false,
        cyclePath: [],
    };
}
