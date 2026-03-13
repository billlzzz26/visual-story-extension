import { StoryGraph, Character, Conflict, EventNode, Relationship } from './types.js';

export function buildInitialGraph(text: string): StoryGraph {
  const graph: StoryGraph = {
    meta: { title: 'Untitled Story', createdAt: '', updatedAt: '', version: '1.0.0' },
    characters: [],
    conflicts: [],
    events: [],
    relationships: [],
    tags: [],
  };

  // Extract title
  const titleMatch = text.match(/^Title:\s*(.+?)$/im) || text.match(/^#+\s+(.+?)$/m);
  if (titleMatch) graph.meta.title = titleMatch[1].trim();

  // Extract characters: "Character: Name, role: protagonist"
  const charPattern = /^Character:\s*([A-Za-z][A-Za-z\s]+?)(?:,\s*role:\s*(\w+))?$/gim;
  let match;
  let charIndex = 0;
  while ((match = charPattern.exec(text)) !== null) {
    const name = match[1].trim();
    const roleText = match[2]?.toLowerCase() || '';
    const role = roleText.includes('protagonist') ? 'protagonist' 
      : roleText.includes('antagonist') ? 'antagonist' 
      : roleText.includes('mentor') ? 'mentor' : 'supporting';
    
    graph.characters.push({
      id: `char_${charIndex++}`,
      name, role, traits: [], 
      arc: { start: '', midpoint: '', end: '', transformation: '', emotionalJourney: [] },
      relationships: [], motivations: [], fears: [], secretsOrLies: [], actAppearances: [1, 2, 3],
    });
  }

  // Extract events: "Event: Event name"
  const eventPattern = /^Event:\s*(.+?)$/gim;
  let eventIndex = 0;
  while ((match = eventPattern.exec(text)) !== null) {
    const label = match[1].trim();
    const act = eventIndex < 4 ? 1 : eventIndex < 9 ? 2 : 3;
    const importance = label.toLowerCase().includes('inciting') ? 'inciting'
      : label.toLowerCase().includes('midpoint') ? 'midpoint'
      : label.toLowerCase().includes('climax') || label.toLowerCase().includes('final') ? 'climax'
      : label.toLowerCase().includes('resolution') || label.toLowerCase().includes('embraces') ? 'resolution'
      : 'rising';
    
    graph.events.push({
      id: `event_${eventIndex++}`,
      label, description: label, act, importance, sequenceInAct: 1,
      characters: [], conflicts: [], emotionalTone: 'neutral', consequence: '',
    });
  }

  // Extract conflicts: "Conflict: Description"
  const conflictPattern = /^Conflict:\s*(.+?)$/gim;
  let conflictIndex = 0;
  while ((match = conflictPattern.exec(text)) !== null) {
    const description = match[1].trim();
    const type = description.toLowerCase().includes('vs') || description.toLowerCase().includes('against') ? 'external'
      : description.toLowerCase().includes('self') || description.toLowerCase().includes('doubt') ? 'internal' : 'external';
    
    graph.conflicts.push({
      id: `conflict_${conflictIndex++}`,
      type, description, relatedCharacters: [], rootCause: '',
      escalations: [{ stage: 1, description, intensity: 5, affectedCharacters: [] }],
      resolution: '', actIntroduced: 1,
    });
  }

  // Build relationships
  for (let i = 0; i < graph.characters.length; i++) {
    for (let j = i + 1; j < graph.characters.length; j++) {
      graph.relationships.push({
        from: graph.characters[i].id, to: graph.characters[j].id,
        type: 'interacts-with', strength: 5,
      });
    }
  }

  // Assign characters to events
  graph.events.forEach(event => {
    graph.characters.forEach(char => {
      if (event.label.toLowerCase().includes(char.name.toLowerCase())) {
        event.characters.push(char.id);
      }
    });
  });

  // Extract themes
  const lower = text.toLowerCase();
  if (lower.includes('love') || lower.includes('romance')) graph.tags.push('love');
  if (lower.includes('power') || lower.includes('control')) graph.tags.push('power');
  if (lower.includes('survive') || lower.includes('endure')) graph.tags.push('survival');
  if (lower.includes('destiny') || lower.includes('heritage')) graph.tags.push('destiny');

  return graph;
}