---
type: scene
id: {{id}}
canonicalName: {{canonicalName}}
act: {{act}}
importance: {{importance}}
{{#if hasCharacters}}
characters: {{characters}}
{{/if}}
{{#if hasLocation}}
location: {{location}}
{{/if}}
{{#if hasTimeline}}
timeline:
  order: {{timeline.order}}
  timestamp: {{timeline.timestamp}}
{{/if}}
---

# {{canonicalName}}

## Act {{act}}

{{#if hasCharacters}}
## Characters Present
{{#each characters}}
- [[{{this}}]]
{{/each}}
{{/if}}

{{#if hasLocation}}
## Location
[[{{location}}]]
{{/if}}

## Summary
{{content.summary}}

{{#if hasEvents}}
## Events
{{#each content.events}}
- {{this.description}}
  - Impact: {{this.impact}}
{{/each}}
{{/if}}

{{#if hasEmotionalTone}}
## Emotional Tone
{{content.emotionalTone}}
{{/if}}

{{#if hasConflicts}}
## Conflicts
{{#each content.conflicts}}
- [[{{this}}]]
{{/each}}
{{/if}}

{{#if hasTurningPoint}}
## Turning Point
{{content.turningPoint}}
{{/if}}

## Essence
{{content.essence}}

---

<!-- MACHINE_READABLE_BLOCK
{{{jsonString}}}
-->
