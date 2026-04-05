---
type: location
id: {{id}}
canonicalName: {{canonicalName}}
{{#if hasAliases}}
aliases: {{aliases}}
{{/if}}
{{#if hasScenes}}
scenes: {{scenes}}
{{/if}}
---

# {{canonicalName}}

{{#if hasDescription}}
## Description
{{content.description}}
{{/if}}

{{#if hasAtmosphere}}
## Atmosphere
{{content.atmosphere}}
{{/if}}

{{#if hasSignificance}}
## Significance
{{content.significance}}
{{/if}}

{{#if hasSensoryDetails}}
## Sensory Details
{{#if content.sensoryDetails.visual}}
- **Visual:** {{content.sensoryDetails.visual}}
{{/if}}
{{#if content.sensoryDetails.sound}}
- **Sound:** {{content.sensoryDetails.sound}}
{{/if}}
{{#if content.sensoryDetails.smell}}
- **Smell:** {{content.sensoryDetails.smell}}
{{/if}}
{{/if}}

{{#if hasScenes}}
## Scenes Here
{{#each scenes}}
- [[{{this}}]]
{{/each}}
{{/if}}

{{#if hasConnections}}
## Connected Locations
{{#each connections}}
- [[{{this.target}}]] — {{this.type}}
{{/each}}
{{/if}}

## Essence
{{content.essence}}

---

<!-- MACHINE_READABLE_BLOCK
{{{jsonString}}}
-->
