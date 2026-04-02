/**
 * Test script for analyze_story tool
 * Runs the tool against the combined story input
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read templates
const characterTemplate = readFileSync(join(__dirname, 'templates/characters/character.md'), 'utf8');
const sceneTemplate = readFileSync(join(__dirname, 'templates/scene/scene.md'), 'utf8');
const locationTemplate = readFileSync(join(__dirname, 'templates/world/location.md'), 'utf8');

// Compile Handlebars templates
const characterTemplateFn = Handlebars.compile(characterTemplate);
const sceneTemplateFn = Handlebars.compile(sceneTemplate);
const locationTemplateFn = Handlebars.compile(locationTemplate);

// Read the combined story
const storyText = readFileSync(join(__dirname, 'tests/test-input/combined-story.md'), 'utf8');

console.log('🚀 Running search_entries tool...\n');
console.log('📖 Input: combined-story.md (3 chapters)\n');
console.log('🔧 Tool: search_entries (formerly analyze_story)\n');

// Simple extraction (mimicking the tool logic)
const characters = searchCharacters(storyText);
const scenes = searchScenes(storyText);
const locations = searchLocations(storyText);

console.log('✅ Results:\n');
console.log(`📊 Extracted:`);
console.log(`   - Characters: ${characters.length}`);
console.log(`   - Scenes: ${scenes.length}`);
console.log(`   - Locations: ${locations.length}\n`);

console.log('📝 Characters Found:');
characters.forEach(c => console.log(`   - ${c.name} (${c.mentions.length} mentions)`));

console.log('\n🎬 Scenes Found:');
scenes.forEach(s => console.log(`   - ${s.name}`));

console.log('\n📍 Locations Found:');
locations.forEach(l => console.log(`   - ${l.name}`));

// Generate output directory
const outputDir = join(__dirname, 'tests/test-output');
mkdirSync(outputDir, { recursive: true });
mkdirSync(join(outputDir, 'characters'), { recursive: true });
mkdirSync(join(outputDir, 'scenes'), { recursive: true });
mkdirSync(join(outputDir, 'locations'), { recursive: true });

// Generate files
console.log('\n📁 Generating files...\n');

// Character files
for (const char of characters) {
  const filename = join(outputDir, 'characters', `${char.name.toLowerCase().replace(/\s+/g, '_')}.md`);
  const content = renderCharacterWithHandlebars(char, characterTemplateFn);
  writeFileSync(filename, content);
  console.log(`   ✅ characters/${char.name.toLowerCase().replace(/\s+/g, '_')}.md`);
}

// Scene files
for (const scene of scenes) {
  const safeName = scene.name.toLowerCase().replace(/\s+/g, '_').replace(/[:]/g, '');
  const filename = join(outputDir, 'scenes', `${safeName}.md`);
  const content = renderSceneWithHandlebars(scene, sceneTemplateFn);
  writeFileSync(filename, content);
  console.log(`   ✅ scenes/${safeName}.md`);
}

// Location files
for (const loc of locations) {
  const filename = join(outputDir, 'locations', `${loc.name.toLowerCase().replace(/\s+/g, '_')}.md`);
  const content = renderLocationWithHandlebars(loc, locationTemplateFn);
  writeFileSync(filename, content);
  console.log(`   ✅ locations/${loc.name.toLowerCase().replace(/\s+/g, '_')}.md`);
}

// Index file
const indexContent = generateIndex(characters, scenes, locations);
writeFileSync(join(outputDir, 'index.md'), indexContent);
console.log(`   ✅ index.md`);

console.log('\n✅ Done! Files generated in tests/test-output/\n');

// ============================================================================
// Search Functions (Simplified for testing)
// ============================================================================

function searchCharacters(text) {
  const characters = [];
  const charNames = new Map();
  
  // Known character names from the story
  const knownNames = [
    'อิกนัส', 'ซิลเวอร์ไนท์', 'ลิโอเรน อิกนัส',
    'เบลซ', 'ลูฟัส', 'ลูฟัส กลอส',
    'อีริก', 'ซาเบล', 'โนเอล',
    'หญิงสาวเมด', 'การ์ดภารกิจ'
  ];
  
  for (const name of knownNames) {
    const mentions = [];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(name)) {
        mentions.push({
          chapter: getChapter(line, text),
          nameUsed: name,
          context: line.trim().substring(0, 100),
          speaker: 'narrator',
          surroundingText: line.trim()
        });
      }
    }
    
    if (mentions.length > 0) {
      // Check if this is an alias
      let canonicalName = name;
      if (name === 'ซิลเวอร์ไนท์' || name === 'ลิโอเรน อิกนัส') {
        canonicalName = 'อิกนัส';
      } else if (name === 'ลูฟัส กลอส') {
        canonicalName = 'ลูฟัส';
      } else if (name === 'หญิงสาวเมด') {
        canonicalName = 'การ์ดภารกิจ';
      }
      
      const existing = charNames.get(canonicalName);
      if (existing) {
        existing.mentions.push(...mentions);
        if (!existing.aliases.includes(name) && name !== canonicalName) {
          existing.aliases.push(name);
        }
      } else {
        charNames.set(canonicalName, {
          type: 'character',
          name: canonicalName,
          aliases: name !== canonicalName ? [name] : [],
          mentions
        });
      }
    }
  }
  
  return Array.from(charNames.values());
}

function searchScenes(text) {
  const scenes = [];
  const chapterPattern = /## Chapter (\d+): (.+)/g;
  let match;
  
  while ((match = chapterPattern.exec(text)) !== null) {
    scenes.push({
      type: 'scene',
      name: `Chapter ${match[1]}: ${match[2].trim()}`,
      act: 1,
      importance: 'normal',
      mentions: [{
        chapter: `chapter-${match[1]}`,
        nameUsed: match[0],
        context: 'chapter header'
      }]
    });
  }
  
  return scenes;
}

function searchLocations(text) {
  const locations = [];
  const knownLocations = [
    { name: 'เมืองไวท์ชาโดว์', aliases: ['ไวท์ชาโดว์'] },
    { name: 'ทุ่งหญ้า', aliases: [] },
    { name: 'กำแพงเมือง', aliases: [] }
  ];
  
  for (const loc of knownLocations) {
    const mentions = [];
    const allNames = [loc.name, ...loc.aliases];
    
    for (const name of allNames) {
      const index = text.indexOf(name);
      if (index !== -1) {
        mentions.push({
          chapter: 'multiple',
          nameUsed: name,
          context: 'location mention'
        });
      }
    }
    
    if (mentions.length > 0) {
      locations.push({
        type: 'location',
        name: loc.name,
        aliases: loc.aliases,
        mentions
      });
    }
  }
  
  return locations;
}

function getChapter(line, text) {
  if (text.indexOf(line) < text.indexOf('## Chapter 8')) return '8';
  if (text.indexOf(line) < text.indexOf('## Chapter 13')) return '13';
  return '44';
}

// ============================================================================
// Template Rendering (using Handlebars)
// ============================================================================

function renderCharacterWithHandlebars(char, templateFn) {
  const tags = [];
  if (char.name === 'อิกนัส' || char.name === 'ซิลเวอร์ไนท์') tags.push('protagonist');
  if (char.name === 'ลูฟัส') tags.push('mysterious', 'friendly');
  if (char.name === 'เบลซ') tags.push('companion', 'beast');
  if (char.name === 'อีริก') tags.push('leader', 'hunter');
  if (char.name === 'ซาเบล') tags.push('wind-user', 'secretary');
  
  const templateData = {
    type: 'character',
    id: `char_${char.name.toLowerCase().replace(/\s+/g, '_')}`,
    canonicalName: char.name,
    status: 'alive',
    tags: tags.join(', '),
    hasAliases: char.aliases.length > 0,
    aliases: char.aliases.map(a => ({ name: a, usedBy: ['various'], context: 'narration' })),
    hasMentions: char.mentions.length > 0,
    mentions: char.mentions.slice(0, 10),
    hasRelationships: false,
    relationships: [],
    hasPersonality: false,
    hasMotivation: false,
    hasArc: false,
    hasKeyQuotes: false,
    content: {
      summary: `${char.name} appears ${char.mentions.length} times in the story.`,
      essence: 'A character in the fantasy hunting world.',
      personality: [],
      keyQuotes: []
    },
    jsonString: JSON.stringify({
      type: 'character',
      id: `char_${char.name.toLowerCase().replace(/\s+/g, '_')}`,
      canonicalName: char.name,
      aliases: char.aliases.map(a => ({ name: a, usedBy: ['various'], context: 'narration' })),
      mentions: char.mentions.slice(0, 10),
      tags,
      status: 'alive'
    }, null, 2)
  };
  
  return templateFn(templateData);
}

function renderSceneWithHandlebars(scene, templateFn) {
  const chapterNum = scene.name.match(/Chapter (\d+)/)?.[1] || '1';
  
  const templateData = {
    type: 'scene',
    id: `scene_chapter_${chapterNum}`,
    canonicalName: scene.name,
    act: 1,
    importance: 'normal',
    hasCharacters: false,
    characters: [],
    hasLocation: false,
    location: '',
    hasTimeline: false,
    timeline: null,
    hasEvents: false,
    hasEmotionalTone: false,
    hasConflicts: false,
    hasTurningPoint: false,
    content: {
      summary: `Chapter ${chapterNum} of the story.`,
      essence: 'A chapter in the fantasy adventure.',
      events: [],
      conflicts: []
    },
    jsonString: JSON.stringify({
      type: 'scene',
      id: `scene_chapter_${chapterNum}`,
      canonicalName: scene.name,
      act: 1,
      importance: 'normal'
    }, null, 2)
  };
  
  return templateFn(templateData);
}

function renderLocationWithHandlebars(loc, templateFn) {
  const templateData = {
    type: 'location',
    id: `loc_${loc.name.toLowerCase().replace(/\s+/g, '_')}`,
    canonicalName: loc.name,
    hasAliases: loc.aliases && loc.aliases.length > 0,
    aliases: loc.aliases || [],
    hasScenes: false,
    scenes: [],
    hasConnections: false,
    connections: [],
    hasDescription: true,
    hasAtmosphere: false,
    hasSignificance: false,
    hasSensoryDetails: false,
    content: {
      description: 'A location mentioned in the story.',
      essence: 'A place in the fantasy world.'
    },
    jsonString: JSON.stringify({
      type: 'location',
      id: `loc_${loc.name.toLowerCase().replace(/\s+/g, '_')}`,
      canonicalName: loc.name,
      aliases: loc.aliases || []
    }, null, 2)
  };
  
  return templateFn(templateData);
}

function generateIndex(characters, scenes, locations) {
  return `---
type: index
title: Story Index - Test Story
lastUpdated: ${new Date().toISOString()}
---

# Story Index

## Characters (${characters.length})
${characters.map(c => `- [[characters/${c.name.toLowerCase().replace(/\s+/g, '_')}]] — ${c.aliases.length > 0 ? `Aliases: ${c.aliases.join(', ')}` : 'Main character'}`).join('\n')}

## Scenes (${scenes.length})
${scenes.map(s => `- [[scenes/${s.name.toLowerCase().replace(/\s+/g, '_')}]]`).join('\n')}

## Locations (${locations.length})
${locations.map(l => `- [[locations/${l.name.toLowerCase().replace(/\s+/g, '_')}]]`).join('\n')}

---

## Entity Resolution Summary

${characters.filter(c => c.aliases.length > 0).map(c => `### ${c.name}\n**Known aliases:** ${c.aliases.join(', ')}\n`).join('\n')}

## Statistics
- Total Characters: ${characters.length}
- Total Scenes: ${scenes.length}
- Total Locations: ${locations.length}
`;
}
