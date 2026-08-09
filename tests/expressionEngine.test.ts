// tests/expressionEngine.test.ts
import { describe, it, expect } from 'vitest';
import { detectCyclicDependencies, FieldDependencyNode } from '../src/analyzer/cycleDetector';
import { ExpressionEngine } from '../src/engine/ExpressionEngine';

describe('Expression Engine - Logical Viewpoint Suite', () => {

  describe('Cycle Detector (Graph Static Analysis)', () => {
    it('should return hasCycle: false for a valid Directed Acyclic Graph (DAG)', () => {
      const nodes: FieldDependencyNode[] = [
        { id: 'investmentAmount', dependsOn: [] },
        { id: 'tier', dependsOn: ['investmentAmount'] },
        { id: 'managementFee', dependsOn: ['tier', 'investmentAmount'] },
        { id: 'netReturn', dependsOn: ['managementFee'] },
      ];

      const result = detectCyclicDependencies(nodes);
      expect(result.hasCycle).toBe(false);
      expect(result.cyclePath).toHaveLength(0);
    });

    it('should detect a direct 2-node circular dependency (A <-> B)', () => {
      const nodes: FieldDependencyNode[] = [
        { id: 'fieldA', dependsOn: ['fieldB'] },
        { id: 'fieldB', dependsOn: ['fieldA'] },
      ];

      const result = detectCyclicDependencies(nodes);
      expect(result.hasCycle).toBe(true);
      expect(result.cyclePath).toEqual(['fieldA', 'fieldB', 'fieldA']);
    });

    it('should detect an indirect multi-node circular dependency (A -> B -> C -> A)', () => {
      const nodes: FieldDependencyNode[] = [
        { id: 'fieldA', dependsOn: ['fieldB'] },
        { id: 'fieldB', dependsOn: ['fieldC'] },
        { id: 'fieldC', dependsOn: ['fieldA'] },
        { id: 'standalone', dependsOn: [] },
      ];

      const result = detectCyclicDependencies(nodes);
      expect(result.hasCycle).toBe(true);
      expect(result.cyclePath).toEqual(['fieldA', 'fieldB', 'fieldC', 'fieldA']);
    });

    it('should gracefully handle references to non-existent or external variables', () => {
      const nodes: FieldDependencyNode[] = [
        { id: 'calculatedValue', dependsOn: ['externalContextVar', 'userPrompt'] },
      ];

      const result = detectCyclicDependencies(nodes);
      expect(result.hasCycle).toBe(false);
    });
  });

  describe('Engine Evaluation State Transitions', () => {
    it('should evaluate conditional visibility predicates deterministically', async () => {
      const engine = new ExpressionEngine();
      
      const schemaRules = {
        fields: [
          {
            id: 'entityType',
            value: 'INDIVIDUAL',
          },
          {
            id: 'directors',
            visibleRule: '$state.entityType = "COMPANY"',
          },
        ],
      };

      const result = await engine.evaluate(schemaRules, { entityType: 'INDIVIDUAL' });
      
      expect(result.visibility.directors).toBe(false);

      const updatedResult = await engine.evaluate(schemaRules, { entityType: 'COMPANY' });
      expect(updatedResult.visibility.directors).toBe(true);
    });

    it('should compute dependent JSONata calculations in correct topological order', async () => {
      const engine = new ExpressionEngine();

      const state = {
        investmentAmount: 2_000_000,
      };

      const rules = {
        fields: [
          {
            id: 'feeRate',
            // Tiered fee rule
            calcRule: '$state.investmentAmount >= 1000000 ? 0.015 : 0.025',
          },
          {
            id: 'feeAmount',
            // Calculated off feeRate
            calcRule: '$state.investmentAmount * $state.feeRate',
          },
        ],
      };

      const evalResult = await engine.evaluate(rules, state);

      expect(evalResult.values.feeRate).toBe(0.015);
      expect(evalResult.values.feeAmount).toBe(30_000);
    });

    it('should handle runtime division by zero or null gracefully without throwing', async () => {
      const engine = new ExpressionEngine();

      const state = {
        amount: 1000,
        count: 0, // divide by zero risk
      };

      const rules = {
        fields: [
          {
            id: 'unitCost',
            calcRule: '$state.count > 0 ? $state.amount / $state.count : 0',
          },
        ],
      };

      const evalResult = await engine.evaluate(rules, state);
      expect(evalResult.values.unitCost).toBe(0);
      expect(evalResult.errors).toHaveLength(0);
    });
  });
});
