import { describe, it, expect } from 'vitest';
import { buildInitialGraph } from './analyzer.js';
import { validateGraph } from './validators.js';
import { toMermaid } from './exporters/mermaid.js';

describe('Visual Story Planner', () => {
  const storyText = `
Title: The Dragon's Heir

Character: Aria, role: protagonist
Aria is brave and determined.

Character: Shadow King, role: antagonist
The Shadow King is corrupted and powerful.

Character: Kael, role: supporting
Kael is a cunning rogue.

Character: Mysterious Stranger, role: mentor
The Stranger is wise and secretive.

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

  it('should analyze story correctly', () => {
    const graph = buildInitialGraph(storyText);
    
    expect(graph.meta.title).toBe("The Dragon's Heir");
    expect(graph.characters.length).toBe(4);
    expect(graph.events.length).toBe(13);
    expect(graph.conflicts.length).toBe(2);
    
    // Check characters
    expect(graph.characters[0].name).toBe('Aria');
    expect(graph.characters[0].role).toBe('protagonist');
    expect(graph.characters[1].name).toBe('Shadow King');
    expect(graph.characters[1].role).toBe('antagonist');
    
    // Check events distribution
    const act1Events = graph.events.filter(e => e.act === 1);
    const act2Events = graph.events.filter(e => e.act === 2);
    const act3Events = graph.events.filter(e => e.act === 3);
    expect(act1Events.length).toBe(4);
    expect(act2Events.length).toBe(5);
    expect(act3Events.length).toBe(4);
    
    // Check importance
    const climax = graph.events.find(e => e.label.toLowerCase().includes('final'));
    const resolution = graph.events.find(e => e.label.toLowerCase().includes('embraces'));
    expect(climax).toBeDefined();
    expect(resolution).toBeDefined();
  });

  it('should validate story correctly', () => {
    const graph = buildInitialGraph(storyText);
    const result = validateGraph(graph);
    
    expect(result.isValid).toBe(true);
    expect(result.issues.filter(i => i.severity === 'error').length).toBe(0);
    expect(result.analysis.eventCount).toBe(13);
    expect(result.analysis.characterCount).toBe(4);
    expect(result.analysis.hasMidpoint).toBe(false); // No "midpoint" keyword in events
    expect(result.analysis.hasClimax).toBe(true);
  });

  it('should export mermaid diagram', () => {
    const graph = buildInitialGraph(storyText);
    const mermaid = toMermaid(graph);
    
    expect(mermaid).toContain('graph TD');
    expect(mermaid).toContain('subgraph Act_1');
    expect(mermaid).toContain('subgraph Act_2');
    expect(mermaid).toContain('subgraph Act_3');
    expect(mermaid).toContain("The Dragon's Heir");
  });

  it('should handle empty story', () => {
    const graph = buildInitialGraph('');
    expect(graph.meta.title).toBe('Untitled Story');
    expect(graph.characters.length).toBe(0);
    expect(graph.events.length).toBe(0);
  });

  it('should extract themes', () => {
    const storyWithThemes = `
Title: Test
Character: Hero, role: protagonist
Event: Hero fights for love and destiny
Event: Hero seeks power and survival
`;
    const graph = buildInitialGraph(storyWithThemes);
    expect(graph.tags).toContain('love');
    expect(graph.tags).toContain('destiny');
  });
});
