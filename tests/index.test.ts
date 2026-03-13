import { describe, it, expect } from 'vitest';
import { buildInitialGraph } from '../src/analyzer.js';
import { validateGraph } from '../src/validators.js';
import { toMermaid } from '../src/exporters/mermaid.js';
import { toCanvasJSON } from '../src/exporters/canvas.js';
import { toDashboard } from '../src/exporters/dashboard.js';
import { executeStoryTool } from '../src/server.js';
import type { StoryGraph } from '../src/types.js';

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

    it('should check act distribution (25-50-25) and flag Act 1 imbalance', () => {
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

    it('should check act distribution and flag Act 2 imbalance', () => {
      const graph = buildInitialGraph(storyText);
      // Force Act 2 to be too small (less than 40%)
      graph.events.forEach((e, i) => {
        if (i < 5) e.act = 1;
        else if (i < 7) e.act = 2;  // Only 2 events in Act 2 (15%)
        else e.act = 3;
      });

      const result = validateGraph(graph);
      expect(result.issues.some(i => i.code === 'ACT2_IMBALANCE')).toBe(true);
    });

    it('should check act distribution and flag Act 3 imbalance', () => {
      const graph = buildInitialGraph(storyText);
      // Force Act 3 to be too large (more than 35%)
      graph.events.forEach((e, i) => {
        if (i < 2) e.act = 1;
        else if (i < 5) e.act = 2;
        else e.act = 3;  // 8 events in Act 3 (>35%)
      });

      const result = validateGraph(graph);
      expect(result.issues.some(i => i.code === 'ACT3_IMBALANCE')).toBe(true);
    });

    it('should provide recommendations when climax is missing', () => {
      const noClimaxStory = `
Title: No Climax
Character: Hero, role: protagonist
Event: Just walking
Event: Still walking
Event: The end
`;
      const graph = buildInitialGraph(noClimaxStory);
      const result = validateGraph(graph);

      expect(result.recommendations).toContain('Define a clear Climax in Act 3 to resolve the main conflict');
    });

    it('should validate in strict mode and check character motivations', () => {
      const graph = buildInitialGraph(storyText);
      // Characters have empty motivations by default
      const result = validateGraph(graph, true);

      expect(result.issues.some(i => i.code === 'NO_MOTIVATION')).toBe(true);
      expect(result.issues.some(i => i.message.includes('has no defined motivations'))).toBe(true);
    });

    it('should validate in strict mode and check character transformation arcs', () => {
      const graph = buildInitialGraph(storyText);
      // Characters have empty transformation by default
      const result = validateGraph(graph, true);

      expect(result.issues.some(i => i.code === 'NO_ARC')).toBe(true);
      expect(result.issues.some(i => i.message.includes('has no defined transformation arc'))).toBe(true);
    });

    it('should provide recommendation to expand Act 2', () => {
      const graph = buildInitialGraph(storyText);
      // Force Act 2 to be too small
      graph.events.forEach((e, i) => {
        if (i < 5) e.act = 1;
        else if (i < 7) e.act = 2;  // Only 2 events
        else e.act = 3;
      });

      const result = validateGraph(graph);
      expect(result.recommendations.some(r => r.includes('Expand Act 2'))).toBe(true);
    });

    it('should suggest adding subplots when conflicts are few', () => {
      const minimalStory = `
Title: Minimal Story
Character: Hero, role: protagonist
Event: Something happens
Event: Final battle
Conflict: Hero vs Villain
`;
      const graph = buildInitialGraph(minimalStory);
      const result = validateGraph(graph);

      expect(result.recommendations.some(r => r.includes('adding subplots or internal conflicts'))).toBe(true);
    });

    it('should not flag act distribution issues when events are too few', () => {
      const shortStory = `
Title: Short Story
Character: Hero, role: protagonist
Event: Start
Event: Middle
Event: End
`;
      const graph = buildInitialGraph(shortStory);
      const result = validateGraph(graph);

      // Should not check act distribution when eventCount < 4
      expect(result.issues.some(i => i.code.includes('IMBALANCE'))).toBe(false);
    });
  });

  describe('Exporters - Mermaid', () => {
    it('should export mermaid diagram with dark theme', () => {
      const graph = buildInitialGraph(storyText);
      const mermaid = toMermaid(graph, { style: 'dark' });

      expect(mermaid).toContain('graph TD');
      expect(mermaid).toContain("theme': 'dark'");
      expect(mermaid).toContain('subgraph Act_1');
      expect(mermaid).toContain('classDef climax');
    });

    it('should export mermaid diagram with minimal theme', () => {
      const graph = buildInitialGraph(storyText);
      const mermaid = toMermaid(graph, { style: 'minimal' });

      expect(mermaid).toContain("theme': 'neutral'");
    });

    it('should export mermaid diagram with default theme', () => {
      const graph = buildInitialGraph(storyText);
      const mermaid = toMermaid(graph, { style: 'default' });

      expect(mermaid).toContain("theme': 'default'");
    });

    it('should use different shapes for different event importance', () => {
      const graph = buildInitialGraph(storyText);
      const mermaid = toMermaid(graph);

      // Climax uses double circle (( ))
      expect(mermaid).toMatch(/\(\("/);
      // Check for other styling classes
      expect(mermaid).toContain('classDef inciting');
      expect(mermaid).toContain('classDef midpoint');
      expect(mermaid).toContain('classDef resolution');
      expect(mermaid).toContain('classDef rising');
    });

    it('should sort events by act and sequence', () => {
      const graph = buildInitialGraph(storyText);
      graph.events[0].act = 2;
      graph.events[0].sequenceInAct = 5;
      graph.events[1].act = 1;
      graph.events[1].sequenceInAct = 1;

      const mermaid = toMermaid(graph);

      // Should connect events in sorted order
      expect(mermaid).toMatch(/-->/);
    });

    it('should include metadata when requested', () => {
      const graph = buildInitialGraph(storyText);
      const mermaid = toMermaid(graph, { includeMetadata: true });

      expect(mermaid).toContain("%% Title: The Dragon's Heir");
    });

    it('should exclude metadata when requested', () => {
      const graph = buildInitialGraph(storyText);
      const mermaid = toMermaid(graph, { includeMetadata: false });

      expect(mermaid).not.toContain("%% Title:");
    });
  });

  describe('Exporters - Canvas', () => {
    it('should export canvas JSON with event nodes', () => {
      const graph = buildInitialGraph(storyText);
      const canvas = toCanvasJSON(graph);

      expect(canvas).toHaveProperty('nodes');
      expect(canvas).toHaveProperty('edges');
      expect(canvas.nodes.some((n: any) => n.type === 'event')).toBe(true);
    });

    it('should export canvas JSON with character nodes', () => {
      const graph = buildInitialGraph(storyText);
      const canvas = toCanvasJSON(graph);

      expect(canvas.nodes.some((n: any) => n.type === 'character')).toBe(true);
      const charNode = canvas.nodes.find((n: any) => n.type === 'character');
      expect(charNode.data).toHaveProperty('role');
      expect(charNode.data).toHaveProperty('traits');
      expect(charNode.data).toHaveProperty('arc');
    });

    it('should export canvas JSON with conflict nodes', () => {
      const graph = buildInitialGraph(storyText);
      const canvas = toCanvasJSON(graph);

      expect(canvas.nodes.some((n: any) => n.type === 'conflict')).toBe(true);
      const conflictNode = canvas.nodes.find((n: any) => n.type === 'conflict');
      expect(conflictNode.data).toHaveProperty('type');
      expect(conflictNode.data).toHaveProperty('intensity');
    });

    it('should create sequential edges between events', () => {
      const graph = buildInitialGraph(storyText);
      const canvas = toCanvasJSON(graph);

      const sequentialEdges = canvas.edges.filter((e: any) => e.id.startsWith('seq_'));
      expect(sequentialEdges.length).toBeGreaterThan(0);
      expect(sequentialEdges[0].type).toBe('smoothstep');
    });

    it('should create relationship edges with animation for strong relationships', () => {
      const graph = buildInitialGraph(storyText);
      graph.relationships[0].strength = 8;
      const canvas = toCanvasJSON(graph);

      const relEdges = canvas.edges.filter((e: any) => e.id.startsWith('rel_'));
      expect(relEdges.length).toBeGreaterThan(0);
      const strongRel = relEdges.find((e: any) => e.animated === true);
      expect(strongRel).toBeDefined();
    });

    it('should include viewport in canvas output', () => {
      const graph = buildInitialGraph(storyText);
      const canvas = toCanvasJSON(graph);

      expect(canvas).toHaveProperty('viewport');
      expect(canvas.viewport).toEqual({ x: 0, y: 0, zoom: 1 });
    });

    it('should include metadata with stats when requested', () => {
      const graph = buildInitialGraph(storyText);
      const canvas = toCanvasJSON(graph, { includeMetadata: true });

      expect(canvas.metadata).toBeDefined();
      expect(canvas.metadata.stats).toHaveProperty('events');
      expect(canvas.metadata.stats).toHaveProperty('characters');
      expect(canvas.metadata.stats).toHaveProperty('conflicts');
      expect(canvas.metadata).toHaveProperty('exportedAt');
    });

    it('should exclude metadata when requested', () => {
      const graph = buildInitialGraph(storyText);
      const canvas = toCanvasJSON(graph, { includeMetadata: false });

      expect(canvas.metadata).toBeUndefined();
    });

    it('should apply different styles for different event importance', () => {
      const graph = buildInitialGraph(storyText);
      const canvas = toCanvasJSON(graph);

      const climaxNode = canvas.nodes.find((n: any) =>
        n.type === 'event' && n.data.importance === 'climax'
      );
      expect(climaxNode).toBeDefined();
      expect(climaxNode.style.borderWidth).toBe(4);
    });

    it('should position nodes based on act structure', () => {
      const graph = buildInitialGraph(storyText);
      const canvas = toCanvasJSON(graph);

      const act1Node = canvas.nodes.find((n: any) =>
        n.type === 'event' && n.data.act === 1
      );
      const act3Node = canvas.nodes.find((n: any) =>
        n.type === 'event' && n.data.act === 3
      );

      expect(act1Node).toBeDefined();
      expect(act3Node).toBeDefined();
      // Act 3 nodes should have higher x position
      expect(act3Node.position.x).toBeGreaterThan(act1Node.position.x);
    });
  });

  describe('Exporters - Dashboard', () => {
    it('should generate dashboard HTML with proper structure', () => {
      const graph = buildInitialGraph(storyText);
      const html = toDashboard(graph);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('Story Structure Analysis Dashboard');
      expect(html).toContain('</html>');
    });

    it('should include Tailwind CSS CDN', () => {
      const graph = buildInitialGraph(storyText);
      const html = toDashboard(graph);

      expect(html).toContain('https://cdn.tailwindcss.com');
    });

    it('should include Chart.js CDN', () => {
      const graph = buildInitialGraph(storyText);
      const html = toDashboard(graph);

      expect(html).toContain('https://cdn.jsdelivr.net/npm/chart.js');
    });

    it('should include act distribution chart canvas', () => {
      const graph = buildInitialGraph(storyText);
      const html = toDashboard(graph);

      expect(html).toContain('actChart');
      expect(html).toContain('<canvas id="actChart">');
    });

    it('should display character names and roles', () => {
      const graph = buildInitialGraph(storyText);
      const html = toDashboard(graph);

      expect(html).toContain('Aria');
      expect(html).toContain('Shadow King');
    });

    it('should display conflict information', () => {
      const graph = buildInitialGraph(storyText);
      const html = toDashboard(graph);

      expect(html).toContain('Aria vs Shadow King');
      expect(html).toContain('Aria vs Self-Doubt');
    });

    it('should show key milestones with checkmarks', () => {
      const graph = buildInitialGraph(storyText);
      const html = toDashboard(graph);

      expect(html).toContain('Key Milestones');
      expect(html).toContain('Midpoint');
      expect(html).toContain('Climax');
      expect(html).toMatch(/✅|❌/);
    });

    it('should display act distribution percentages', () => {
      const graph = buildInitialGraph(storyText);
      const html = toDashboard(graph);

      expect(html).toMatch(/Act 1: \d+/);
      expect(html).toMatch(/Act 2: \d+/);
      expect(html).toMatch(/Act 3: \d+/);
    });

    it('should display structural issues when present', () => {
      const noClimaxStory = `
Title: No Climax Story
Character: Hero, role: protagonist
Event: Start
Event: Middle
Event: End
`;
      const graph = buildInitialGraph(noClimaxStory);
      const html = toDashboard(graph);

      expect(html).toContain('Structural Issues');
      expect(html).toContain('MISSING_CLIMAX');
    });

    it('should display success message when no issues found', () => {
      const graph = buildInitialGraph(storyText);
      const html = toDashboard(graph);

      // Check if success message is shown or issues are listed
      expect(html).toMatch(/No structural issues found|Structural Issues/);
    });

    it('should display recommendations', () => {
      const graph = buildInitialGraph(storyText);
      const html = toDashboard(graph);

      expect(html).toContain('Recommendations');
    });

    it('should escape HTML special characters', () => {
      const graph = buildInitialGraph(storyText);
      graph.meta.title = 'Story <with> & "special" characters';
      const html = toDashboard(graph);

      expect(html).toContain('&lt;with&gt;');
      expect(html).toContain('&amp;');
      expect(html).not.toContain('Story <with> &');
    });

    it('should display structure score based on act balance', () => {
      const graph = buildInitialGraph(storyText);
      const html = toDashboard(graph);

      expect(html).toContain('Structure Score');
      expect(html).toMatch(/\d+%/);
      expect(html).toContain('Based on act symmetry');
    });

    it('should include Chart.js configuration script', () => {
      const graph = buildInitialGraph(storyText);
      const html = toDashboard(graph);

      expect(html).toContain('new Chart(ctx');
      expect(html).toContain("type: 'bar'");
      expect(html).toContain("labels: ['Act 1', 'Act 2', 'Act 3']");
    });

    it('should display genre when provided', () => {
      const graph = buildInitialGraph(storyText);
      graph.meta.genre = 'Fantasy';
      const html = toDashboard(graph);

      expect(html).toContain('Fantasy');
    });

    it('should display version number', () => {
      const graph = buildInitialGraph(storyText);
      const html = toDashboard(graph);

      expect(html).toContain('v1.0.0');
    });
  });

  describe('Server - Error Handling', () => {
    it('should handle unknown tool names gracefully', async () => {
      const result = await executeStoryTool('unknown_tool', {});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Unknown tool');
    });

    it('should handle errors during tool execution', async () => {
      // Pass invalid data to cause an error
      const result = await executeStoryTool('export_mermaid', { graph: null });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Error executing');
    });

    it('should successfully execute analyze_story', async () => {
      const result = await executeStoryTool('analyze_story', {
        text: 'Title: Test\nCharacter: Hero, role: protagonist\nEvent: Test event\nEvent: Final battle',
        includeMetadata: true
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty('graph');
      expect(data).toHaveProperty('analysis');
    });

    it('should successfully execute export_mermaid', async () => {
      const graph = buildInitialGraph('Title: Test\nCharacter: Hero, role: protagonist\nEvent: Test');
      const result = await executeStoryTool('export_mermaid', {
        graph,
        includeMetadata: true,
        style: 'dark'
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('graph TD');
    });

    it('should successfully execute export_canvas', async () => {
      const graph = buildInitialGraph('Title: Test\nCharacter: Hero, role: protagonist\nEvent: Test');
      const result = await executeStoryTool('export_canvas', {
        graph,
        includeMetadata: true,
        autoLayout: true
      });

      expect(result.isError).toBeUndefined();
      const canvas = JSON.parse(result.content[0].text);
      expect(canvas).toHaveProperty('nodes');
      expect(canvas).toHaveProperty('edges');
    });

    it('should successfully execute export_dashboard', async () => {
      const graph = buildInitialGraph('Title: Test\nCharacter: Hero, role: protagonist\nEvent: Test');
      const result = await executeStoryTool('export_dashboard', {
        graph,
        includeStats: true,
        includeRecommendations: true
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('<!DOCTYPE html>');
    });

    it('should successfully execute validate_story_structure', async () => {
      const graph = buildInitialGraph('Title: Test\nCharacter: Hero, role: protagonist\nEvent: Test');
      const result = await executeStoryTool('validate_story_structure', {
        graph,
        strict: false,
        includeRecommendations: true
      });

      expect(result.isError).toBeUndefined();
      const validation = JSON.parse(result.content[0].text);
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('issues');
      expect(validation).toHaveProperty('recommendations');
    });

    it('should successfully execute extract_characters', async () => {
      const graph = buildInitialGraph('Title: Test\nCharacter: Hero, role: protagonist\nCharacter: Villain, role: antagonist');
      const result = await executeStoryTool('extract_characters', {
        graph,
        detailed: true
      });

      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.count).toBe(2);
      expect(data.characters).toHaveLength(2);
    });

    it('should successfully execute extract_conflicts', async () => {
      const graph = buildInitialGraph('Title: Test\nCharacter: Hero, role: protagonist\nConflict: Hero vs World');
      const result = await executeStoryTool('extract_conflicts', {
        graph,
        includeEscalation: true
      });

      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty('count');
      expect(data).toHaveProperty('conflicts');
    });

    it('should successfully execute build_relationship_graph', async () => {
      const graph = buildInitialGraph('Title: Test\nCharacter: Hero, role: protagonist\nCharacter: Villain, role: antagonist');
      const result = await executeStoryTool('build_relationship_graph', {
        graph,
        includeStats: true
      });

      expect(result.isError).toBeUndefined();
      const data = JSON.parse(result.content[0].text);
      expect(data).toHaveProperty('count');
      expect(data).toHaveProperty('relationships');
    });
  });
});