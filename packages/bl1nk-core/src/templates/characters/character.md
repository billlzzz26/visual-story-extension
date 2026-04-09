---
type: {{type}}
id: {{id}}
canonicalName: {{canonicalName}}
{{#if hasAliases}}
aliases:
{{#each aliases}}
  - name: {{this.name}}
    usedBy: {{this.usedBy}}
    context: {{this.context}}
{{/each}}
{{/if}}
{{#if tags}}
tags: [{{tags}}]
{{/if}}
status: {{status}}
---

# {{canonicalName}}

{{#if hasAliases}}
## Name Variations
{{#each aliases}}
- **{{this.name}}** — used by {{this.usedBy}} ({{this.context}})
{{/each}}
{{/if}}

## Mentions
{{#if hasMentions}}
{{#each mentions}}
- **{{this.chapter}}**: "{{this.nameUsed}}"
  - Context: {{this.context}}
  {{#if this.speaker}}
  - Speaker: {{this.speaker}}
  {{/if}}
{{/each}}
{{else}}
_No mentions recorded._
{{/if}}

{{#if hasRelationships}}
## Relationships
{{#each relationships}}
- [[{{this.target}}]] — {{this.type}}{{#if this.description}} ({{this.description}}){{/if}}
{{/each}}
{{/if}}

## Summary
{{content.summary}}

{{#if hasPersonality}}
## Personality Traits
{{#each content.personality}}
- {{this}}
{{/each}}
{{/if}}

{{#if hasMotivation}}
## Motivation
{{content.motivation}}
{{/if}}

{{#if hasArc}}
## Character Arc
- **Start:** {{content.arc.start}}
{{#if content.arc.midpoint}}
- **Midpoint:** {{content.arc.midpoint}}
{{/if}}
{{#if content.arc.end}}
- **End:** {{content.arc.end}}
{{/if}}
{{#if content.arc.transformation}}
- **Transformation:** {{content.arc.transformation}}
{{/if}}
{{/if}}

{{#if hasKeyQuotes}}
## Key Quotes
{{#each content.keyQuotes}}
> "{{this.quote}}"
> — {{this.chapter}}{{#if this.context}}, {{this.context}}{{/if}}

{{/each}}
{{/if}}

## Essence
{{content.essence}}

---

<!-- MACHINE_READABLE_BLOCK
{{{jsonString}}}
-->
