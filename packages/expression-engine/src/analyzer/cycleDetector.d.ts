export interface FieldDependencyNode {
    id: string;
    /** JSONata expressions or variable dependencies mapped to other field IDs */
    dependsOn: string[];
}
export interface CycleDetectionResult {
    hasCycle: boolean;
    cyclePath: string[];
}
/**
 * Validates that the field dependency graph contains no circular references.
 * Uses Depth-First Search (DFS) with 3-color node tracking (White, Gray, Black).
 */
export declare function detectCyclicDependencies(fields: FieldDependencyNode[]): CycleDetectionResult;
//# sourceMappingURL=cycleDetector.d.ts.map