import { describe, it, expect } from 'vitest';
import { validateGraph } from './validators.js';
import type { StoryGraph, Character, EventNode, Conflict, Relationship } from './types.js';

// Helper to create a minimal valid graph
function createBaseGraph(): StoryGraph {
  return {
    meta: {
      title: 'Test Story',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0',
    },
    characters: [
      {
        id: 'char1',
        name: 'Hero',
        role: 'protagonist',
        traits: ['brave'],
        arc: {
          start: 'naive',
          midpoint: 'tested',
          end: 'mature',
          transformation: 'grows',
          emotionalJourney: [],
        },
        relationships: [],
        motivations: ['save the world'],
        fears: [],
        secretsOrLies: [],
        actAppearances: [1, 2, 3],
      },
    ],
    conflicts: [
      {
        id: 'conflict1',
        type: 'external',
        description: 'Hero vs Villain',
        relatedCharacters: ['char1'],
        rootCause: 'evil',
        escalations: [],
        resolution: 'victory',
        actIntroduced: 1,
      },
    ],
    events: [],
    relationships: [],
    tags: [],
  };
}

// Helper to create an event
function createEvent(id: string, label: string, act: number, importance: string = 'normal'): EventNode {
  return {
    id,
    label,
    description: `Event ${label}`,
    act,
    importance,
    sequenceInAct: 1,
    characters: [],
    conflicts: [],
    emotionalTone: 'neutral',
    consequence: 'none',
  };
}

describe('validateGraph - Optimized Single-Pass Logic', () => {
  describe('Act Counting Optimization', () => {
    it('should correctly count events across all three acts in single pass', () => {
      const graph = createBaseGraph();
      graph.events = [
        createEvent('e1', 'Act 1 Event 1', 1),
        createEvent('e2', 'Act 1 Event 2', 1),
        createEvent('e3', 'Act 2 Event 1', 2),
        createEvent('e4', 'Act 2 Event 2', 2),
        createEvent('e5', 'Act 2 Event 3', 2),
        createEvent('e6', 'Act 3 Event 1', 3),
        createEvent('e7', 'Act 3 Event 2', 3),
        createEvent('e8', 'Act 3 Event 3', 3, 'climax'),
      ];

      const result = validateGraph(graph);

      expect(result.analysis.actBalance.act1).toBe(2);
      expect(result.analysis.actBalance.act2).toBe(3);
      expect(result.analysis.actBalance.act3).toBe(3);
      expect(result.analysis.eventCount).toBe(8);
    });

    it('should detect missing acts when some acts have zero events', () => {
      const graph = createBaseGraph();
      graph.events = [
        createEvent('e1', 'Act 1 Event', 1),
        createEvent('e2', 'Act 3 Event', 3, 'climax'),
        // No Act 2 events
      ];

      const result = validateGraph(graph);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.code === 'MISSING_ACT2')).toBe(true);
      expect(result.analysis.actBalance.act1).toBe(1);
      expect(result.analysis.actBalance.act2).toBe(0);
      expect(result.analysis.actBalance.act3).toBe(1);
    });

    it('should handle all three acts missing when no events exist', () => {
      const graph = createBaseGraph();
      graph.events = []; // No events at all

      const result = validateGraph(graph);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.code === 'MISSING_ACT1')).toBe(true);
      expect(result.issues.some(i => i.code === 'MISSING_ACT2')).toBe(true);
      expect(result.issues.some(i => i.code === 'MISSING_ACT3')).toBe(true);
      expect(result.issues.some(i => i.code === 'MISSING_CLIMAX')).toBe(true);
    });

    it('should correctly count acts when events appear in non-sequential order', () => {
      const graph = createBaseGraph();
      graph.events = [
        createEvent('e1', 'Act 3 Event', 3, 'climax'),
        createEvent('e2', 'Act 1 Event', 1),
        createEvent('e3', 'Act 2 Event 1', 2),
        createEvent('e4', 'Act 2 Event 2', 2),
        createEvent('e5', 'Act 1 Event 2', 1),
      ];

      const result = validateGraph(graph);

      expect(result.analysis.actBalance.act1).toBe(2);
      expect(result.analysis.actBalance.act2).toBe(2);
      expect(result.analysis.actBalance.act3).toBe(1);
    });
  });

  describe('Climax Detection Optimization', () => {
    it('should detect climax in single pass', () => {
      const graph = createBaseGraph();
      graph.events = [
        createEvent('e1', 'Act 1 Event', 1),
        createEvent('e2', 'Act 2 Event', 2),
        createEvent('e3', 'Act 3 Event', 3, 'climax'),
      ];

      const result = validateGraph(graph);

      expect(result.analysis.hasClimax).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.issues.some(i => i.code === 'MISSING_CLIMAX')).toBe(false);
    });

    it('should detect missing climax in single pass', () => {
      const graph = createBaseGraph();
      graph.events = [
        createEvent('e1', 'Act 1 Event', 1),
        createEvent('e2', 'Act 2 Event', 2),
        createEvent('e3', 'Act 3 Event', 3, 'normal'),
      ];

      const result = validateGraph(graph);

      expect(result.analysis.hasClimax).toBe(false);
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.code === 'MISSING_CLIMAX')).toBe(true);
    });

    it('should detect climax even when it appears early in the loop', () => {
      const graph = createBaseGraph();
      graph.events = [
        createEvent('e1', 'Climax Event', 3, 'climax'), // First in array
        createEvent('e2', 'Act 1 Event', 1),
        createEvent('e3', 'Act 2 Event', 2),
      ];

      const result = validateGraph(graph);

      expect(result.analysis.hasClimax).toBe(true);
      expect(result.isValid).toBe(true);
    });

    it('should detect climax even when it appears last in the loop', () => {
      const graph = createBaseGraph();
      graph.events = [
        createEvent('e1', 'Act 1 Event', 1),
        createEvent('e2', 'Act 2 Event', 2),
        createEvent('e3', 'Climax Event', 3, 'climax'), // Last in array
      ];

      const result = validateGraph(graph);

      expect(result.analysis.hasClimax).toBe(true);
      expect(result.isValid).toBe(true);
    });

    it('should handle multiple climax events (flag should be set on first occurrence)', () => {
      const graph = createBaseGraph();
      graph.events = [
        createEvent('e1', 'Act 1 Event', 1),
        createEvent('e2', 'Climax 1', 2, 'climax'),
        createEvent('e3', 'Climax 2', 3, 'climax'),
      ];

      const result = validateGraph(graph);

      expect(result.analysis.hasClimax).toBe(true);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Midpoint Detection Optimization', () => {
    it('should detect midpoint in single pass', () => {
      const graph = createBaseGraph();
      graph.events = [
        createEvent('e1', 'Act 1 Event', 1),
        createEvent('e2', 'Midpoint Event', 2, 'midpoint'),
        createEvent('e3', 'Act 3 Event', 3, 'climax'),
      ];

      const result = validateGraph(graph);

      expect(result.analysis.hasMidpoint).toBe(true);
      expect(result.issues.some(i => i.code === 'NO_MIDPOINT')).toBe(false);
    });

    it('should detect missing midpoint in single pass', () => {
      const graph = createBaseGraph();
      graph.events = [
        createEvent('e1', 'Act 1 Event', 1),
        createEvent('e2', 'Act 2 Event', 2, 'normal'),
        createEvent('e3', 'Act 3 Event', 3, 'climax'),
      ];

      const result = validateGraph(graph);

      expect(result.analysis.hasMidpoint).toBe(false);
      expect(result.issues.some(i => i.code === 'NO_MIDPOINT')).toBe(true);
      expect(result.issues.find(i => i.code === 'NO_MIDPOINT')?.severity).toBe('warning');
    });

    it('should detect midpoint even when it appears first in array', () => {
      const graph = createBaseGraph();
      graph.events = [
        createEvent('e1', 'Midpoint Event', 2, 'midpoint'), // First
        createEvent('e2', 'Act 1 Event', 1),
        createEvent('e3', 'Act 3 Event', 3, 'climax'),
      ];

      const result = validateGraph(graph);

      expect(result.analysis.hasMidpoint).toBe(true);
    });

    it('should handle multiple midpoint events', () => {
      const graph = createBaseGraph();
      graph.events = [
        createEvent('e1', 'Act 1 Event', 1),
        createEvent('e2', 'Midpoint 1', 2, 'midpoint'),
        createEvent('e3', 'Midpoint 2', 2, 'midpoint'),
        createEvent('e4', 'Act 3 Event', 3, 'climax'),
      ];

      const result = validateGraph(graph);

      expect(result.analysis.hasMidpoint).toBe(true);
    });
  });

  describe('Combined Single-Pass Optimization', () => {
    it('should count acts and detect both climax and midpoint in one pass', () => {
      const graph = createBaseGraph();
      graph.events = [
        createEvent('e1', 'Act 1 Event 1', 1),
        createEvent('e2', 'Act 1 Event 2', 1),
        createEvent('e3', 'Act 2 Event 1', 2),
        createEvent('e4', 'Midpoint', 2, 'midpoint'),
        createEvent('e5', 'Act 2 Event 2', 2),
        createEvent('e6', 'Act 3 Event 1', 3),
        createEvent('e7', 'Climax', 3, 'climax'),
        createEvent('e8', 'Resolution', 3),
      ];

      const result = validateGraph(graph);

      // All gathered in single pass
      expect(result.analysis.actBalance.act1).toBe(2);
      expect(result.analysis.actBalance.act2).toBe(3);
      expect(result.analysis.actBalance.act3).toBe(3);
      expect(result.analysis.hasClimax).toBe(true);
      expect(result.analysis.hasMidpoint).toBe(true);
      expect(result.analysis.eventCount).toBe(8);
    });

    it('should correctly handle edge case with only climax event', () => {
      const graph = createBaseGraph();
      graph.events = [
        createEvent('e1', 'Single Climax', 3, 'climax'),
      ];

      const result = validateGraph(graph);

      expect(result.analysis.actBalance.act1).toBe(0);
      expect(result.analysis.actBalance.act2).toBe(0);
      expect(result.analysis.actBalance.act3).toBe(1);
      expect(result.analysis.hasClimax).toBe(true);
      expect(result.analysis.hasMidpoint).toBe(false);
      expect(result.isValid).toBe(false); // Missing Act 1 and 2
    });

    it('should efficiently process large event arrays', () => {
      const graph = createBaseGraph();
      // Create 100 events distributed across acts
      graph.events = [];
      for (let i = 1; i <= 25; i++) {
        graph.events.push(createEvent(`e${i}`, `Act 1 Event ${i}`, 1));
      }
      for (let i = 26; i <= 75; i++) {
        graph.events.push(createEvent(`e${i}`, `Act 2 Event ${i}`, 2));
      }
      graph.events.push(createEvent('midpoint', 'Midpoint', 2, 'midpoint'));
      for (let i = 76; i <= 100; i++) {
        graph.events.push(createEvent(`e${i}`, `Act 3 Event ${i}`, 3));
      }
      graph.events.push(createEvent('climax', 'Climax', 3, 'climax'));

      const result = validateGraph(graph);

      expect(result.analysis.actBalance.act1).toBe(25);
      expect(result.analysis.actBalance.act2).toBe(51); // 50 + midpoint
      expect(result.analysis.actBalance.act3).toBe(26); // 25 + climax
      expect(result.analysis.eventCount).toBe(102);
      expect(result.analysis.hasClimax).toBe(true);
      expect(result.analysis.hasMidpoint).toBe(true);
    });
  });

  describe('Act Distribution Validation with Optimized Counts', () => {
    it('should use optimized counts to calculate act distribution percentages', () => {
      const graph = createBaseGraph();
      // Create deliberately imbalanced distribution: 80% Act 1, 10% Act 2, 10% Act 3
      graph.events = [
        createEvent('e1', 'Act 1-1', 1),
        createEvent('e2', 'Act 1-2', 1),
        createEvent('e3', 'Act 1-3', 1),
        createEvent('e4', 'Act 1-4', 1),
        createEvent('e5', 'Act 1-5', 1),
        createEvent('e6', 'Act 1-6', 1),
        createEvent('e7', 'Act 1-7', 1),
        createEvent('e8', 'Act 1-8', 1),
        createEvent('e9', 'Act 2-1', 2),
        createEvent('e10', 'Act 3-1', 3, 'climax'),
      ];

      const result = validateGraph(graph);

      // Should detect imbalance using the optimized counts
      expect(result.issues.some(i => i.code === 'ACT1_IMBALANCE')).toBe(true);
      expect(result.issues.some(i => i.code === 'ACT2_IMBALANCE')).toBe(true);
      expect(result.issues.some(i => i.code === 'ACT3_IMBALANCE')).toBe(true);
    });

    it('should skip distribution check when event count is below threshold', () => {
      const graph = createBaseGraph();
      graph.events = [
        createEvent('e1', 'Act 1', 1),
        createEvent('e2', 'Act 2', 2),
        createEvent('e3', 'Act 3', 3, 'climax'),
      ];

      const result = validateGraph(graph);

      // Should not check distribution for < 4 events
      expect(result.issues.some(i => i.code === 'ACT1_IMBALANCE')).toBe(false);
      expect(result.issues.some(i => i.code === 'ACT2_IMBALANCE')).toBe(false);
      expect(result.issues.some(i => i.code === 'ACT3_IMBALANCE')).toBe(false);
    });

    it('should validate proper 25-50-25 distribution using optimized counts', () => {
      const graph = createBaseGraph();
      // 25% Act 1, 50% Act 2, 25% Act 3 (out of 12 events: 3, 6, 3)
      graph.events = [
        createEvent('e1', 'Act 1-1', 1),
        createEvent('e2', 'Act 1-2', 1),
        createEvent('e3', 'Act 1-3', 1),
        createEvent('e4', 'Act 2-1', 2),
        createEvent('e5', 'Act 2-2', 2),
        createEvent('e6', 'Act 2-3', 2),
        createEvent('e7', 'Act 2-4', 2, 'midpoint'),
        createEvent('e8', 'Act 2-5', 2),
        createEvent('e9', 'Act 2-6', 2),
        createEvent('e10', 'Act 3-1', 3),
        createEvent('e11', 'Act 3-2', 3),
        createEvent('e12', 'Act 3-3', 3, 'climax'),
      ];

      const result = validateGraph(graph);

      // Should not trigger imbalance warnings (25%, 50%, 25% is ideal)
      expect(result.issues.some(i => i.code === 'ACT1_IMBALANCE')).toBe(false);
      expect(result.issues.some(i => i.code === 'ACT2_IMBALANCE')).toBe(false);
      expect(result.issues.some(i => i.code === 'ACT3_IMBALANCE')).toBe(false);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle event with undefined or unusual importance values', () => {
      const graph = createBaseGraph();
      graph.events = [
        createEvent('e1', 'Act 1', 1),
        createEvent('e2', 'Act 2', 2),
        { ...createEvent('e3', 'Act 3', 3), importance: 'unusual' },
      ];

      const result = validateGraph(graph);

      // Should still count the acts correctly
      expect(result.analysis.actBalance.act1).toBe(1);
      expect(result.analysis.actBalance.act2).toBe(1);
      expect(result.analysis.actBalance.act3).toBe(1);
      // But no climax detected
      expect(result.analysis.hasClimax).toBe(false);
    });

    it('should handle empty events array efficiently', () => {
      const graph = createBaseGraph();
      graph.events = [];

      const result = validateGraph(graph);

      expect(result.analysis.eventCount).toBe(0);
      expect(result.analysis.actBalance.act1).toBe(0);
      expect(result.analysis.actBalance.act2).toBe(0);
      expect(result.analysis.actBalance.act3).toBe(0);
      expect(result.analysis.hasClimax).toBe(false);
      expect(result.analysis.hasMidpoint).toBe(false);
    });

    it('should handle events with act values outside 1-3 range', () => {
      const graph = createBaseGraph();
      graph.events = [
        createEvent('e1', 'Act 1', 1),
        { ...createEvent('e2', 'Act 0', 2), act: 0 },
        { ...createEvent('e3', 'Act 4', 3), act: 4 },
        createEvent('e4', 'Act 3 Climax', 3, 'climax'),
      ];

      const result = validateGraph(graph);

      // Only act 1 and act 3 should be counted properly
      expect(result.analysis.actBalance.act1).toBe(1);
      expect(result.analysis.actBalance.act2).toBe(0); // act 0 not counted
      expect(result.analysis.actBalance.act3).toBe(1); // act 4 not counted
      expect(result.analysis.eventCount).toBe(4);
    });
  });

  describe('Regression Tests for Optimization', () => {
    it('should produce same results as before optimization for typical story', () => {
      const graph = createBaseGraph();
      graph.events = [
        createEvent('e1', 'Opening', 1),
        createEvent('e2', 'Inciting Incident', 1),
        createEvent('e3', 'First Plot Point', 1),
        createEvent('e4', 'Rising Action 1', 2),
        createEvent('e5', 'Midpoint', 2, 'midpoint'),
        createEvent('e6', 'Rising Action 2', 2),
        createEvent('e7', 'Dark Night', 2),
        createEvent('e8', 'Second Plot Point', 2),
        createEvent('e9', 'Build to Climax', 3),
        createEvent('e10', 'Climax', 3, 'climax'),
        createEvent('e11', 'Resolution', 3),
      ];

      const result = validateGraph(graph);

      // Expected behavior matching the original implementation
      expect(result.isValid).toBe(true);
      expect(result.analysis.actBalance.act1).toBe(3);
      expect(result.analysis.actBalance.act2).toBe(5);
      expect(result.analysis.actBalance.act3).toBe(3);
      expect(result.analysis.hasClimax).toBe(true);
      expect(result.analysis.hasMidpoint).toBe(true);
      expect(result.analysis.eventCount).toBe(11);
      expect(result.analysis.pacing).toBe('balanced');
    });

    it('should maintain exact error detection behavior after optimization', () => {
      const graph = createBaseGraph();
      graph.events = [
        createEvent('e1', 'Only Act 2 Event', 2),
      ];

      const result = validateGraph(graph);

      // Should detect missing Act 1, Act 3, and climax
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.code === 'MISSING_ACT1')).toBe(true);
      expect(result.issues.some(i => i.code === 'MISSING_ACT3')).toBe(true);
      expect(result.issues.some(i => i.code === 'MISSING_CLIMAX')).toBe(true);
      expect(result.issues.some(i => i.code === 'NO_MIDPOINT')).toBe(true);
    });
  });
});