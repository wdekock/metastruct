import { describe, it, expect } from "vitest";
import { detectCyclicDependencies } from "../packages/expression-engine/src/analyzer/cycleDetector";
import { ExpressionEngine } from "../packages/expression-engine/src/ExpressionEngine";
describe("Expression Engine - Logical Viewpoint Suite", () => {
    describe("Cycle Detector (Graph Static Analysis)", () => {
        it("should return hasCycle: false for a valid Directed Acyclic Graph (DAG)", () => {
            const nodes = [
                { id: "investmentAmount", dependsOn: [] },
                { id: "tier", dependsOn: ["investmentAmount"] },
                { id: "managementFee", dependsOn: ["tier", "investmentAmount"] },
                { id: "netReturn", dependsOn: ["managementFee"] },
            ];
            const result = detectCyclicDependencies(nodes);
            expect(result.hasCycle).toBe(false);
            expect(result.cyclePath).toHaveLength(0);
        });
        it("should detect a direct 2-node circular dependency (A <-> B)", () => {
            const nodes = [
                { id: "fieldA", dependsOn: ["fieldB"] },
                { id: "fieldB", dependsOn: ["fieldA"] },
            ];
            const result = detectCyclicDependencies(nodes);
            expect(result.hasCycle).toBe(true);
            expect(result.cyclePath).toEqual(["fieldA", "fieldB", "fieldA"]);
        });
        it("should detect an indirect multi-node circular dependency (A -> B -> C -> A)", () => {
            const nodes = [
                { id: "fieldA", dependsOn: ["fieldB"] },
                { id: "fieldB", dependsOn: ["fieldC"] },
                { id: "fieldC", dependsOn: ["fieldA"] },
                { id: "standalone", dependsOn: [] },
            ];
            const result = detectCyclicDependencies(nodes);
            expect(result.hasCycle).toBe(true);
            expect(result.cyclePath).toEqual(["fieldA", "fieldB", "fieldC", "fieldA"]);
        });
        it("should gracefully handle references to non-existent or external variables", () => {
            const nodes = [
                { id: "calculatedValue", dependsOn: ["externalContextVar", "userPrompt"] },
            ];
            const result = detectCyclicDependencies(nodes);
            expect(result.hasCycle).toBe(false);
        });
    });
    describe("Engine Evaluation State Transitions", () => {
        it("should evaluate conditional visibility predicates deterministically", async () => {
            const engine = new ExpressionEngine();
            const schemaRules = {
                $schemaVersion: "1.0.0",
                id: "test_schema",
                title: "Test Schema",
                fields: {
                    entityType: {
                        id: "entityType",
                        type: "string",
                        label: "Entity Type",
                        component: "TextInput",
                    },
                    directors: {
                        id: "directors",
                        type: "string",
                        label: "Directors",
                        component: "TextInput",
                        visibilityRule: '$state.entityType = "COMPANY"',
                    },
                },
                steps: [],
            };
            const result = await engine.evaluate(schemaRules, { entityType: "INDIVIDUAL" });
            expect(result.visibility.directors).toBe(false);
            const updatedResult = await engine.evaluate(schemaRules, { entityType: "COMPANY" });
            expect(updatedResult.visibility.directors).toBe(true);
        });
        it("should compute dependent JSONata calculations in correct topological order", async () => {
            const engine = new ExpressionEngine();
            const state = {
                investmentAmount: 2_000_000,
            };
            const rules = {
                $schemaVersion: "1.0.0",
                id: "test_schema_calc",
                title: "Calculation Schema",
                fields: {
                    feeRate: {
                        id: "feeRate",
                        type: "number",
                        label: "Fee Rate",
                        component: "NumberInput",
                        calculationRule: "$state.investmentAmount >= 1000000 ? 0.015 : 0.025",
                    },
                    feeAmount: {
                        id: "feeAmount",
                        type: "number",
                        label: "Fee Amount",
                        component: "NumberInput",
                        calculationRule: "$state.investmentAmount * $state.feeRate",
                    },
                },
                steps: [],
            };
            const evalResult = await engine.evaluate(rules, state);
            expect(evalResult.values.feeRate).toBe(0.015);
            expect(evalResult.values.feeAmount).toBe(30_000);
        });
        it("should handle runtime division by zero or null gracefully without throwing", async () => {
            const engine = new ExpressionEngine();
            const state = {
                amount: 1000,
                count: 0,
            };
            const rules = {
                $schemaVersion: "1.0.0",
                id: "test_schema_div0",
                title: "Div Zero Schema",
                fields: {
                    unitCost: {
                        id: "unitCost",
                        type: "number",
                        label: "Unit Cost",
                        component: "NumberInput",
                        calculationRule: "$state.count > 0 ? $state.amount / $state.count : 0",
                    },
                },
                steps: [],
            };
            const evalResult = await engine.evaluate(rules, state);
            expect(evalResult.values.unitCost).toBe(0);
            expect(Object.keys(evalResult.errors)).toHaveLength(0);
        });
    });
});
