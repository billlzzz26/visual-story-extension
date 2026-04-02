---
type: scene
id: scene_chapter_8
canonicalName: Chapter 8: การ์ดภารกิจและการตัดสินใจ
act: 1
importance: normal
{{#if characters}}
characters: {{characters}}
{{/if}}
{{#if location}}
location: {{location}}
{{/if}}
{{#if timeline}}
timeline:
  order: {{timeline.order}}
  timestamp: {{timeline.timestamp}}
{{/if}}
---

# {{canonicalName}}

## Act {{act}}

{{#if characters}}
## Characters Present
{{#each characters}}
- [[{{this}}]]
{{/each}}
{{/if}}

{{#if location}}
## Location
[[{{location}}]]
{{/if}}

## Summary
Chapter 8 of the story.

{{#if content.events}}
## Events
{{#each content.events}}
- {{this.description}}
  - Impact: {{this.impact}}
{{/each}}
{{/if}}

{{#if content.emotionalTone}}
## Emotional Tone
{{content.emotionalTone}}
{{/if}}

{{#if content.conflicts}}
## Conflicts
{{#each content.conflicts}}
- [[{{this}}]]
{{/each}}
{{/if}}

{{#if content.turningPoint}}
## Turning Point
{{content.turningPoint}}
{{/if}}

## Essence
A chapter in the fantasy adventure.

---

<!-- MACHINE_READABLE_BLOCK
{
  "type": "scene",
  "id": "scene_chapter_8",
  "canonicalName": "Chapter 8: การ์ดภารกิจและการตัดสินใจ",
  "act": 1,
  "importance": "normal"
}
-->
