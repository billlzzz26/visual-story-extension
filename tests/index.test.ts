import { describe, it, expect } from 'vitest';
import { buildInitialGraph } from './analyzer.js';
import { validateGraph } from './validators.js';
import { toMermaid } from './exporters/mermaid.js';
import { toCanvasJSON } from './exporters/canvas.js';
import { toDashboard } from './exporters/dashboard.js';

describe('bl1nk-visual-mcp Core Logic', () => {
  const storyText = `
Title: The Dragon's Heir

Character: Aria, role: protagonist
Aria is brave and determined.

Character: Shadow King, role: antagonist
The Shadow King is corrupted and powerful.

Event: Aria works in father's forge
Event: Mysterious Stranger arrives
Event: The amulet appears
Event: Learning the truth
Event: Journey to Whispering Woods
Event: Meeting Kael
Event: Discovering the first key
Event: Shadow King's forces attack
Event: Aria loses control
Event: Arrival at Dragon Temple
Event: Shadow King awaits
Event: Final battle
Event: Aria embraces heritage

Conflict: Aria vs Shadow King
Conflict: Aria vs Self-Doubt
`;

  describe('Analyzer', () => {
    it('should analyze story correctly', () => {
      const graph = buildInitialGraph(storyText);
      
      expect(graph.meta.title).toBe("The Dragon's Heir");
      expect(graph.characters.length).toBe(2);
      expect(graph.events.length).toBe(13);
      expect(graph.conflicts.length).toBe(2);
      
      expect(graph.characters[0].name).toBe('Aria');
      expect(graph.characters[0].role).toBe('protagonist');
      
      const act1Events = graph.events.filter(e => e.act === 1);
      const act2Events = graph.events.filter(e => e.act === 2);
      const act3Events = graph.events.filter(e => e.act === 3);
      expect(act1Events.length).toBe(4);
      expect(act2Events.length).toBe(5);
      expect(act3Events.length).toBe(4);
    });
  });

  describe('Validators', () => {
    it('should validate story structure and detect climax', () => {
      const graph = buildInitialGraph(storyText);
      const result = validateGraph(graph);
      
      expect(result.isValid).toBe(true);
      expect(result.analysis.hasClimax).toBe(true);
      expect(result.analysis.eventCount).toBe(13);
    });

    it('should detect missing climax', () => {
      const noClimaxStory = `
Title: No Climax
Character: Hero, role: protagonist
Event: Just walking
Event: Still walking
Event: The end
`;
      const graph = buildInitialGraph(noClimaxStory);
      const result = validateGraph(graph);
      
      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.code === 'MISSING_CLIMAX')).toBe(true);
    });

    it('should check act distribution (25-50-25)', () => {
      const imbalancedStory = `
Title: Imbalanced
Character: Hero, role: protagonist
Event: Act 1 event 1
Event: Act 1 event 2
Event: Act 1 event 3
Event: Act 1 event 4
Event: Act 1 event 5
Event: Act 1 event 6
Event: Act 1 event 7
Event: Act 1 event 8
Event: Act 2 event 1
Event: Act 3 event 1
`;
      const graph = buildInitialGraph(imbalancedStory);
      // Manually adjust acts to force imbalance for testing
      graph.events[0].act = 1;
      graph.events[1].act = 1;
      graph.events[2].act = 1;
      graph.events[3].act = 1;
      graph.events[4].act = 1;
      graph.events[5].act = 1;
      graph.events[6].act = 1;
      graph.events[7].act = 1;
      graph.events[8].act = 2;
      graph.events[9].act = 3;
      
      const result = validateGraph(graph);
      expect(result.issues.some(i => i.code === 'ACT1_IMBALANCE')).toBe(true);
    });
  });

  describe('Exporters', () => {
    it('should export mermaid diagram with styles', () => {
      const graph = buildInitialGraph(storyText);
      const mermaid = toMermaid(graph, { style: 'dark' });
      
      expect(mermaid).toContain('graph TD');
      expect(mermaid).toContain("theme': 'dark'");
      expect(mermaid).toContain('subgraph Act_1');
      expect(mermaid).toContain('classDef climax');
    });

    it('should export canvas JSON structure', () => {
      const graph = buildInitialGraph(storyText);
      const canvas = toCanvasJSON(graph);
      
      expect(canvas).toHaveProperty('nodes');
      expect(canvas).toHaveProperty('edges');
      expect(canvas.nodes.some((n: any) => n.type === 'event')).toBe(true);
      expect(canvas.nodes.some((n: any) => n.type === 'character')).toBe(true);
    });

    it('should generate dashboard HTML', () => {
      const graph = buildInitialGraph(storyText);
      const html = toDashboard(graph);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Story Structure Analysis Dashboard');
      expect(html).toContain('actChart');
      expect(html).toContain('Aria');
    });
  });
});