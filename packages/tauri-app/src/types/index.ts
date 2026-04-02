// Shared TypeScript types for Visual Story Planner Tauri app

// Base types mirrored from repo root src/types.ts
export interface StoryGraph {
  meta: {
    title: string;
    createdAt: string;
    updatedAt: string;
    version: string;
    genre?: string;
  };
  characters: Character[];
  conflicts: Conflict[];
  events: EventNode[];
  relationships: Relationship[];
  tags: string[];
}

export interface Character {
  id: string;
  name: string;
  role: string;
  traits: string[];
  arc: { start: string; midpoint: string; end: string; transformation: string; emotionalJourney: string[] };
  relationships: string[];
  motivations: string[];
  fears: string[];
  secretsOrLies: string[];
  actAppearances: number[];
}

export interface Conflict {
  id: string;
  type: string;
  description: string;
  relatedCharacters: string[];
  rootCause: string;
  escalations: Array<{ stage: number; description: string; intensity: number; affectedCharacters: string[] }>;
  resolution: string;
  actIntroduced: number;
}

export interface EventNode {
  id: string;
  label: string;
  description: string;
  act: number;
  importance: string;
  sequenceInAct: number;
  location?: string;
  characters: string[];
  conflicts: string[];
  emotionalTone: string;
  consequence: string;
}

export interface Relationship {
  from: string;
  to: string;
  type: string;
  strength: number;
  description?: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: Array<{ severity: string; code: string; message: string; suggestion?: string }>;
  analysis: {
    actBalance: { act1: number; act2: number; act3: number; balance: number };
    characterCount: number;
    conflictCount: number;
    eventCount: number;
    hasMidpoint: boolean;
    hasClimax: boolean;
    pacing: string;
  };
  recommendations: string[];
}

// New types for the Tauri app

// Insight Entry and History
export interface InsightEntry {
  id: string;
  timestamp: string;        // ISO 8601
  storyTitle: string;
  validationResult: ValidationResult;
  analysisSnapshot: {
    characterCount: number;
    eventCount: number;
    conflictCount: number;
    pacing: string;
    actBalance: { act1: number; act2: number; act3: number; balance: number };
  };
  tags: string[];
  notes?: string;
}

export type InsightHistory = InsightEntry[];

// Graph Node and Edge types for visual graph
export type NodeType = 'character' | 'event' | 'conflict' | 'relationship';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  x?: number;
  y?: number;
  data: Character | EventNode | Conflict | Relationship;
}

export interface GraphEdge {
  id: string;
  source: string;  // node id
  target: string;  // node id
  label?: string;
  strength?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Timeline Event for visual timeline
export interface TimelineEvent {
  id: string;
  label: string;
  description: string;
  act: 1 | 2 | 3;
  importance: 'inciting' | 'rising' | 'midpoint' | 'climax' | 'resolution';
  sequenceInAct: number;
  characters: string[];     // character ids
  emotionalTone: string;
  consequence: string;
  location?: string;
}

// App state for the Tauri app
export interface AppState {
  currentStory: StoryGraph | null;
  insightHistory: InsightHistory;
  selectedNodeId: string | null;
  activeView: 'editor' | 'graph' | 'timeline' | 'insights';
}