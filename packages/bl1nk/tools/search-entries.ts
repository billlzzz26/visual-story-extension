/**
 * @license
 * Copyright 2026 bl1nk-visual-mcp
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Tool: search_entries
 * 
 * Searches story text and extracts ALL entities (characters, scenes, locations, creatures, objects).
 * Performs entity resolution to identify name variations (aliases).
 * Generates markdown files with both metadata (frontmatter) and content (body).
 * 
 * This is a SEARCH tool - it finds and catalogs entities, not analyzes story quality.
 */

import { z } from 'zod';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Handlebars from 'handlebars';
import entitiesConfig from '../../known/entities.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load templates at runtime
const characterTemplate = readFileSync(join(__dirname, '../../templates/characters/character.md'), 'utf8');
const sceneTemplate = readFileSync(join(__dirname, '../../templates/scene/scene.md'), 'utf8');
const locationTemplate = readFileSync(join(__dirname, '../../templates/world/location.md'), 'utf8');

// Compile Handlebars templates
const characterTemplateFn = Handlebars.compile(characterTemplate);
const sceneTemplateFn = Handlebars.compile(sceneTemplate);
const locationTemplateFn = Handlebars.compile(locationTemplate);

// ============================================================================
// Types
// ============================================================================

interface RawEntry {
  type: 'character' | 'scene' | 'location' | 'conflict';
  name: string;
  mentions: Mention[];
  context?: any;
}

interface Mention {
  chapter: string;
  nameUsed: string;
  context: string;
  speaker?: string;
  surroundingText?: string;
}

interface StoredEntry {
  entityType: string;
  metadata: any;
  content: any;
}

// ============================================================================
// Entity Resolution
// ============================================================================

class EntityManager {
  private entities: Map<string, RawEntry> = new Map();
  
  add(entry: RawEntry): void {
    const key = `${entry.type}:${entry.name.toLowerCase()}`;
    const existing = this.entities.get(key);
    
    if (existing) {
      // Merge mentions
      existing.mentions.push(...entry.mentions);
    } else {
      this.entities.set(key, entry);
    }
  }
  
  getAll(): RawEntry[] {
    return Array.from(this.entities.values());
  }
  
  resolve(name: string, type: string): RawEntry | undefined {
    const key = `${type}:${name.toLowerCase()}`;
    return this.entities.get(key);
  }
}

// ============================================================================
// Extraction Functions
// ============================================================================

function extractCharacters(text: string, chapterNum: number): RawEntry[] {
  const characters: RawEntry[] = [];
  const lines = text.split('\n');
  
  // Simple extraction: look for character-like patterns
  // This is a basic implementation - real version would use AI
  const charPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
  const dialoguePattern = /"([^"]+)"\s*(?:said|called|whispered|shouted)\s*(?:by)?\s*([A-Z][a-z]+)/g;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Extract from dialogue
    let match;
    while ((match = dialoguePattern.exec(line)) !== null) {
      const [_, dialogue, speaker] = match;
      characters.push({
        type: 'character',
        name: speaker.trim(),
        mentions: [{
          chapter: `chapter-${chapterNum}`,
          nameUsed: speaker.trim(),
          context: dialogue.trim(),
          speaker: 'narrator',
          surroundingText: line.trim()
        }]
      });
    }
    
    // Extract from narration
    while ((match = charPattern.exec(line)) !== null) {
      const name = match[1].trim();
      // Filter out common words
      if (['The', 'A', 'An', 'Chapter', 'Title'].includes(name)) continue;
      
      characters.push({
        type: 'character',
        name: name,
        mentions: [{
          chapter: `chapter-${chapterNum}`,
          nameUsed: name,
          context: 'narration',
          surroundingText: line.trim()
        }]
      });
    }
  }
  
  // Deduplicate
  const deduped = new Map<string, RawEntry>();
  for (const char of characters) {
    const key = char.name.toLowerCase();
    if (deduped.has(key)) {
      deduped.get(key)!.mentions.push(...char.mentions);
    } else {
      deduped.set(key, char);
    }
  }
  
  return Array.from(deduped.values());
}

function extractScenes(text: string, chapterNum: number): RawEntry[] {
  const scenes: RawEntry[] = [];
  
  // Extract chapter/scene headers
  const scenePattern = /(?:Chapter|Scene)\s*\d*:?\s*(.+)/gi;
  let match;
  
  while ((match = scenePattern.exec(text)) !== null) {
    scenes.push({
      type: 'scene',
      name: match[1].trim() || `Chapter ${chapterNum}`,
      mentions: [{
        chapter: `chapter-${chapterNum}`,
        nameUsed: match[0],
        context: 'scene header',
        speaker: 'narrator'
      }],
      context: { act: 1, importance: 'normal' }
    });
  }
  
  if (scenes.length === 0) {
    // Default scene for chapter
    scenes.push({
      type: 'scene',
      name: `Chapter ${chapterNum}`,
      mentions: [{
        chapter: `chapter-${chapterNum}`,
        nameUsed: `Chapter ${chapterNum}`,
        context: 'default scene',
        speaker: 'narrator'
      }],
      context: { act: 1, importance: 'normal' }
    });
  }
  
  return scenes;
}

function extractLocations(text: string, chapterNum: number): RawEntry[] {
  const locations: RawEntry[] = [];
  
  // Common location keywords
  const locationKeywords = ['forge', 'palace', 'castle', 'temple', 'forest', 'mountain', 'village', 'city', 'room', 'hall'];
  
  for (const keyword of locationKeywords) {
    const regex = new RegExp(`\\b(?:the\\s+)?${keyword}\\b`, 'gi');
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      const context = text.substring(Math.max(0, match.index - 50), match.index + 50);
      locations.push({
        type: 'location',
        name: match[0].trim(),
        mentions: [{
          chapter: `chapter-${chapterNum}`,
          nameUsed: match[0].trim(),
          context: 'location mention',
          speaker: 'narrator',
          surroundingText: context
        }]
      });
    }
  }
  
  // Deduplicate
  const deduped = new Map<string, RawEntry>();
  for (const loc of locations) {
    const key = loc.name.toLowerCase();
    if (deduped.has(key)) {
      deduped.get(key)!.mentions.push(...loc.mentions);
    } else {
      deduped.set(key, loc);
    }
  }
  
  return Array.from(deduped.values());
}

// ============================================================================
// Entity Resolution & Alias Detection
// ============================================================================

function resolveAliases(entries: RawEntry[]): StoredEntry[] {
  const stored: StoredEntry[] = [];
  
  // Group by type
  const byType = new Map<string, RawEntry[]>();
  for (const entry of entries) {
    if (!byType.has(entry.type)) {
      byType.set(entry.type, []);
    }
    byType.get(entry.type)!.push(entry);
  }
  
  // Process each type
  for (const [type, typeEntries] of byType.entries()) {
    // Simple alias detection: same mention context
    const canonicalMap = new Map<string, RawEntry>();
    
    for (const entry of typeEntries) {
      const canonicalName = entry.name; // In real version, use AI to resolve
      const existing = canonicalMap.get(canonicalName.toLowerCase());
      
      if (existing) {
        // Merge as alias
        existing.mentions.push(...entry.mentions);
      } else {
        canonicalMap.set(canonicalName.toLowerCase(), entry);
      }
    }
    
    // Convert to stored entries
    for (const [_, entry] of canonicalMap.entries()) {
      stored.push(createStoredEntry(entry, type));
    }
  }
  
  return stored;
}

function createStoredEntry(entry: RawEntry, type: string): StoredEntry {
  const id = generateId(type, entry.name);
  
  // Extract aliases from mentions
  const aliases = extractAliasesFromMentions(entry.mentions);
  
  // Generate content (summary, essence, etc.)
  const content = generateContent(entry, type);
  
  return {
    entityType: type,
    metadata: {
      type,
      id,
      canonicalName: entry.name,
      aliases,
      mentions: entry.mentions,
      relationships: [],
      tags: generateTags(entry),
      status: type === 'character' ? 'alive' : undefined
    },
    content
  };
}

function generateId(type: string, name: string): string {
  const prefix = type === 'character' ? 'char' : type === 'scene' ? 'scene' : 'loc';
  return `${prefix}_${name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;
}

function extractAliasesFromMentions(mentions: Mention[]): any[] {
  const aliases: any[] = [];
  const namesUsed = new Set<string>();
  
  for (const mention of mentions) {
    if (!namesUsed.has(mention.nameUsed)) {
      namesUsed.add(mention.nameUsed);
      aliases.push({
        name: mention.nameUsed,
        usedBy: [mention.speaker || 'narrator'],
        context: mention.context
      });
    }
  }
  
  return aliases;
}

function generateContent(entry: RawEntry, type: string): any {
  const summary = generateSummary(entry);
  const essence = generateEssence(entry, type);
  
  return {
    summary,
    essence,
    ...(type === 'character' && {
      personality: extractPersonalityTraits(entry),
      motivation: 'To be determined from more context',
      arc: {
        start: 'TBD',
        midpoint: 'TBD',
        end: 'TBD',
        transformation: 'TBD'
      },
      keyQuotes: extractKeyQuotes(entry.mentions)
    }),
    ...(type === 'scene' && {
      events: extractEvents(entry),
      emotionalTone: 'TBD',
      conflicts: [],
      turningPoint: 'TBD'
    }),
    ...(type === 'location' && {
      description: 'TBD',
      atmosphere: 'TBD',
      significance: 'TBD',
      sensoryDetails: {}
    })
  };
}

function generateSummary(entry: RawEntry): string {
  const mentionCount = entry.mentions.length;
  const chapters = [...new Set(entry.mentions.map(m => m.chapter))];
  
  return `${entry.name} appears ${mentionCount} time(s) in ${chapters.join(', ')}.`;
}

function generateEssence(entry: RawEntry, type: string): string {
  if (type === 'character') {
    return `A character whose full story emerges through ${entry.mentions.length} mentions.`;
  } else if (type === 'scene') {
    return `A scene that advances the narrative.`;
  } else {
    return `A location where story events unfold.`;
  }
}

function extractPersonalityTraits(entry: RawEntry): string[] {
  // Simple extraction from context
  const traits: string[] = [];
  
  for (const mention of entry.mentions) {
    if (mention.context.includes('said') || mention.context.includes('called')) {
      traits.push('dialogue-speaker');
    }
  }
  
  return [...new Set(traits)];
}

function extractKeyQuotes(mentions: Mention[]): any[] {
  const quotes: any[] = [];
  
  for (const mention of mentions) {
    if (mention.context && mention.context.length > 0) {
      quotes.push({
        quote: mention.context,
        chapter: mention.chapter,
        context: mention.speaker || 'narration'
      });
    }
  }
  
  return quotes.slice(0, 5); // Limit to 5
}

function extractEvents(entry: RawEntry): any[] {
  return entry.mentions.map(m => ({
    description: m.context,
    impact: 'TBD'
  }));
}

function generateTags(entry: RawEntry): string[] {
  const tags: string[] = [];
  
  if (entry.type === 'character') {
    tags.push(entry.type);
    if (entry.mentions.some(m => m.context.includes('brother') || m.context.includes('sister'))) {
      tags.push('family');
    }
    if (entry.mentions.some(m => m.context.includes('king') || m.context.includes('queen') || m.context.includes('princess'))) {
      tags.push('royal');
    }
  }
  
  return tags;
}

// ============================================================================
// Template Rendering (using Handlebars)
// ============================================================================

function renderCharacter(data: any): string {
  // Prepare data for template
  const templateData = {
    ...data,
    hasAliases: data.aliases && data.aliases.length > 0,
    hasMentions: data.mentions && data.mentions.length > 0,
    hasRelationships: data.relationships && data.relationships.length > 0,
    hasPersonality: data.content?.personality && data.content.personality.length > 0,
    hasMotivation: data.content?.motivation,
    hasArc: data.content?.arc,
    hasKeyQuotes: data.content?.keyQuotes && data.content.keyQuotes.length > 0,
    jsonString: JSON.stringify(data, null, 2)
  };
  
  return characterTemplateFn(templateData);
}

function renderScene(data: any): string {
  const templateData = {
    ...data,
    hasCharacters: data.characters && data.characters.length > 0,
    hasLocation: data.location,
    hasTimeline: data.timeline,
    hasEvents: data.content?.events && data.content.events.length > 0,
    hasEmotionalTone: data.content?.emotionalTone,
    hasConflicts: data.content?.conflicts && data.content.conflicts.length > 0,
    hasTurningPoint: data.content?.turningPoint,
    jsonString: JSON.stringify(data, null, 2)
  };
  
  return sceneTemplateFn(templateData);
}

function renderLocation(data: any): string {
  const templateData = {
    ...data,
    hasAliases: data.aliases && data.aliases.length > 0,
    hasScenes: data.scenes && data.scenes.length > 0,
    hasConnections: data.connections && data.connections.length > 0,
    hasDescription: data.content?.description,
    hasAtmosphere: data.content?.atmosphere,
    hasSignificance: data.content?.significance,
    hasSensoryDetails: data.content?.sensoryDetails,
    jsonString: JSON.stringify(data, null, 2)
  };
  
  return locationTemplateFn(templateData);
}

function getTemplateForType(type: string): Function {
  switch (type) {
    case 'character': return characterTemplateFn;
    case 'scene': return sceneTemplateFn;
    case 'location': return locationTemplateFn;
    default: return characterTemplateFn;
  }
}

// ============================================================================
// File Generation
// ============================================================================

function generateFiles(entries: StoredEntry[]): Record<string, string> {
  const files: Record<string, string> = {};

  for (const entry of entries) {
    const folder = getFolderForType(entry.entityType);
    const filename = `${entry.metadata.canonicalName.toLowerCase().replace(/\s+/g, '_')}.md`;
    
    let content: string;
    
    if (entry.entityType === 'character') {
      content = renderCharacter(entry);
    } else if (entry.entityType === 'scene') {
      content = renderScene(entry);
    } else if (entry.entityType === 'location') {
      content = renderLocation(entry);
    } else {
      content = renderCharacter(entry); // Default
    }

    files[`${folder}/${filename}`] = content;
  }

  // Generate index file
  files['index.md'] = generateIndexFile(entries);

  return files;
}

function getFolderForType(type: string): string {
  switch (type) {
    case 'character': return 'characters';
    case 'scene': return 'scenes';
    case 'location': return 'locations';
    default: return type + 's';
  }
}

function generateIndexFile(entries: StoredEntry[]): string {
  const byType = new Map<string, StoredEntry[]>();
  
  for (const entry of entries) {
    if (!byType.has(entry.entityType)) {
      byType.set(entry.entityType, []);
    }
    byType.get(entry.entityType)!.push(entry);
  }
  
  let content = `---
type: index
title: Story Index
lastUpdated: ${new Date().toISOString()}
---

# Story Index

`;
  
  for (const [type, typeEntries] of byType.entries()) {
    const folder = getFolderForType(type);
    const title = type.charAt(0).toUpperCase() + type.slice(1) + 's';
    
    content += `## ${title} (${typeEntries.length})\n`;
    
    for (const entry of typeEntries) {
      const filename = entry.metadata.canonicalName.toLowerCase().replace(/\s+/g, '_');
      content += `- [[${folder}/${filename}]]`;
      
      if (entry.entityType === 'character' && entry.metadata.tags) {
        const tags = entry.metadata.tags.join(', ');
        if (tags) content += ` — ${tags}`;
      }
      
      content += '\n';
    }
    
    content += '\n';
  }
  
  // Entity resolution summary
  content += `---\n\n## Entity Resolution Summary\n\n`;
  
  for (const [type, typeEntries] of byType.entries()) {
    if (type === 'character') {
      for (const entry of typeEntries) {
        if (entry.metadata.aliases && entry.metadata.aliases.length > 1) {
          content += `### ${entry.metadata.canonicalName}\n`;
          content += `**Known aliases:** ${entry.metadata.aliases.map((a: any) => a.name).join(', ')}\n\n`;
        }
      }
    }
  }
  
  // Statistics
  content += `## Statistics\n`;
  content += `- Total Characters: ${byType.get('character')?.length || 0}\n`;
  content += `- Total Scenes: ${byType.get('scene')?.length || 0}\n`;
  content += `- Total Locations: ${byType.get('location')?.length || 0}\n`;
  
  return content;
}

// ============================================================================
// Tool Definition
// ============================================================================

export const searchEntriesTool = {
  name: 'search_entries',
  description: `Search and extract ALL entities from story text.

WHAT THIS TOOL DOES:
1. FIND entries - Extract characters (with aliases), scenes, locations, creatures, objects
2. STORE entries - Build metadata (for machine) and content (for human)  
3. BUILD profiles - Generate markdown files with wiki links [[name]]

WHAT THIS TOOL DOES NOT DO:
- Analyze story quality or structure
- Make recommendations
- Judge writing quality

OUTPUT:
- Markdown files with frontmatter (metadata) + body (content)
- JSON blocks for machine reading
- Wiki links [[name]] for connections between files
- Entity resolution (identifies name variations like "พี่นาง" = "เจ้าหญิง" = same person)

BEST FOR:
- Cataloging all characters in a chapter
- Finding all locations mentioned
- Tracking name variations for same character
- Creating searchable story database`,

  inputSchema: z.object({
    text: z.string().describe('Story text to search for entities'),
    chapterNumber: z.number().optional().describe('Chapter number for organization (1, 2, 3...)'),
    extractOptions: z.object({
      characters: z.boolean().default(true).describe('Extract characters (including name variations)'),
      scenes: z.boolean().default(true).describe('Extract scenes/chapters'),
      locations: z.boolean().default(true).describe('Extract locations/places'),
      creatures: z.boolean().default(false).describe('Extract monsters/creatures'),
      objects: z.boolean().default(false).describe('Extract important objects/items')
    }).optional()
  }),

  async execute(args: z.infer<typeof searchEntriesTool['inputSchema']>) {
    const entityManager = new EntityManager();
    
    // 1. FIND - Extract entries
    if (args.extractOptions?.characters !== false) {
      const characters = extractCharacters(args.text, args.chapterNumber || 1);
      characters.forEach(c => entityManager.add(c));
    }
    
    if (args.extractOptions?.scenes !== false) {
      const scenes = extractScenes(args.text, args.chapterNumber || 1);
      scenes.forEach(s => entityManager.add(s));
    }
    
    if (args.extractOptions?.locations !== false) {
      const locations = extractLocations(args.text, args.chapterNumber || 1);
      locations.forEach(l => entityManager.add(l));
    }
    
    // 2. STORE - Build metadata + content with entity resolution
    const storedEntries = resolveAliases(entityManager.getAll());
    
    // 3. BUILD - Generate files
    const files = generateFiles(storedEntries);
    
    // Count by type
    const charCount = storedEntries.filter(e => e.entityType === 'character').length;
    const sceneCount = storedEntries.filter(e => e.entityType === 'scene').length;
    const locCount = storedEntries.filter(e => e.entityType === 'location').length;
    
    // Return summary
    return {
      content: [{
        type: 'text' as const,
        text: `✅ Searched: Chapter ${args.chapterNumber || 'new'}\n\n` +
              `📊 Found:\n` +
              `- Characters: ${charCount}\n` +
              `- Scenes: ${sceneCount}\n` +
              `- Locations: ${locCount}\n\n` +
              `📁 Generated ${Object.keys(files).length} files:\n` +
              Object.keys(files).map(f => `- ${f}`).join('\n') +
              `\n\n🔗 Next steps:\n` +
              `- Run "search_entries" again for next chapter\n` +
              `- Run "export_files" to upload to GitHub\n` +
              `- Open index.md to see all entries`
      }]
    };
  }
};
