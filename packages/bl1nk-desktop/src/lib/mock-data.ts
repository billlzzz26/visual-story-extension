import type { StoryGraph, ValidationResult } from "../types/index";

export const mockStoryGraph: StoryGraph = {
	meta: {
		title: "A New Hope - Hero's Journey",
		createdAt: "2024-01-15T10:00:00Z",
		updatedAt: "2024-01-20T14:30:00Z",
		version: "1.0.0",
		genre: "Science Fiction",
	},
	characters: [
		{
			id: "char-1",
			name: "Luke Skywalker",
			role: "protagonist",
			traits: ["naive", "hopeful", "courageous", "loyal"],
			arc: {
				start: "Farm boy dreaming of adventure",
				midpoint: "Finds purpose in the Force",
				end: "Becomes a Jedi Knight",
				transformation: "From reluctant hero to confident Jedi",
				emotionalJourney: [
					"curiosity",
					"doubt",
					"determination",
					"faith",
					"triumph",
				],
			},
			relationships: ["char-2", "char-3"],
			motivations: ["escape Tatooine", "become a Jedi", "save the galaxy"],
			fears: ["failing his friends", "the dark side"],
			secretsOrLies: [],
			actAppearances: [1, 2, 3],
		},
		{
			id: "char-2",
			name: "Darth Vader",
			role: "antagonist",
			traits: ["powerful", "sinister", "tragic", "commanding"],
			arc: {
				start: "Fallen Jedi Knight",
				midpoint: "Confronts his past",
				end: "Redeemed through his son",
				transformation: "From dark side to redemption",
				emotionalJourney: [
					"anger",
					"conflict",
					"remorse",
					"sacrifice",
					"peace",
				],
			},
			relationships: ["char-1", "char-3"],
			motivations: ["destroy the Rebellion", "find his son"],
			fears: ["losing his son", "the Emperor"],
			secretsOrLies: ["He is Luke's father"],
			actAppearances: [1, 2, 3],
		},
		{
			id: "char-3",
			name: "Obi-Wan Kenobi",
			role: "mentor",
			traits: ["wise", "patient", "protective", "mysterious"],
			arc: {
				start: "Exiled guardian",
				midpoint: "Trains Luke in the Force",
				end: "Becomes one with the Force",
				transformation: "From warrior to spiritual guide",
				emotionalJourney: ["sorrow", "hope", "sacrifice", "peace", "eternity"],
			},
			relationships: ["char-1", "char-2"],
			motivations: ["protect Luke", "defeat the Emperor"],
			fears: ["failing his padawan"],
			secretsOrLies: [],
			actAppearances: [1, 2, 3],
		},
	],
	conflicts: [
		{
			id: "conflict-1",
			type: "external",
			description:
				"The Empire seeks to crush the Rebellion and maintain control of the galaxy through fear and military power.",
			relatedCharacters: ["char-1", "char-2"],
			rootCause: "Imperial oppression and tyranny",
			escalations: [
				{
					stage: 1,
					description: "Death Star construction",
					intensity: 7,
					affectedCharacters: ["char-1", "char-2"],
				},
				{
					stage: 2,
					description: "Princess Leia captured",
					intensity: 8,
					affectedCharacters: ["char-1"],
				},
				{
					stage: 3,
					description: "Battle of Yavin",
					intensity: 10,
					affectedCharacters: ["char-1", "char-2"],
				},
			],
			resolution: "The Rebels destroy the Death Star",
			actIntroduced: 1,
		},
		{
			id: "conflict-2",
			type: "internal",
			description:
				"Luke must choose between his desire for adventure and his responsibility to the greater good.",
			relatedCharacters: ["char-1"],
			rootCause: "Luke's naivety and longing for purpose",
			escalations: [
				{
					stage: 1,
					description: "Uncle Owen's refusal",
					intensity: 4,
					affectedCharacters: ["char-1"],
				},
				{
					stage: 2,
					description: "R2-D2's message",
					intensity: 6,
					affectedCharacters: ["char-1"],
				},
				{
					stage: 3,
					description: "Final choice to face Vader",
					intensity: 9,
					affectedCharacters: ["char-1"],
				},
			],
			resolution: "Luke chooses to embrace his destiny",
			actIntroduced: 1,
		},
	],
	events: [
		{
			id: "event-1",
			label: "The Call to Adventure",
			description:
				"Luke discovers the droids carrying a message from Princess Leia.",
			act: 1,
			importance: "inciting",
			sequenceInAct: 1,
			location: "Tatooine - Moisture Farm",
			characters: ["char-1", "char-3"],
			conflicts: ["conflict-2"],
			emotionalTone: "Curiosity mixed with unease",
			consequence: "Luke is drawn into the galactic conflict",
		},
		{
			id: "event-2",
			label: "Meeting the Mentor",
			description:
				"Obi-Wan reveals the truth about Luke's father and gives him his father's lightsaber.",
			act: 1,
			importance: "rising",
			sequenceInAct: 2,
			location: "Tatooine - Jundland Wastes",
			characters: ["char-1", "char-3"],
			conflicts: ["conflict-2"],
			emotionalTone: "Wonder and revelation",
			consequence: "Luke learns about the Force and his heritage",
		},
		{
			id: "event-3",
			label: "Crossing the Threshold",
			description:
				"Luke decides to join the Rebellion after his aunt and uncle are killed.",
			act: 1,
			importance: "rising",
			sequenceInAct: 3,
			location: "Tatooine - Moisture Farm",
			characters: ["char-1"],
			conflicts: ["conflict-2"],
			emotionalTone: "Grief and determination",
			consequence: "Luke commits to his destiny",
		},
		{
			id: "event-4",
			label: "The Midpoint",
			description:
				"Luke faces Vader in the Death Star trench and experiences the Force for the first time.",
			act: 2,
			importance: "midpoint",
			sequenceInAct: 1,
			location: "Death Star - Battle Station",
			characters: ["char-1", "char-2"],
			conflicts: ["conflict-1"],
			emotionalTone: "Fear and connection",
			consequence: "Luke taps into the Force to succeed",
		},
		{
			id: "event-5",
			label: "The Climax",
			description:
				"The final battle - Luke must trust the Force to destroy the Death Star.",
			act: 3,
			importance: "climax",
			sequenceInAct: 1,
			location: "Yavin IV - Rebel Base",
			characters: ["char-1", "char-2"],
			conflicts: ["conflict-1"],
			emotionalTone: "Hope and fear",
			consequence: "Luke destroys the Death Star",
		},
	],
	relationships: [
		{
			from: "char-1",
			to: "char-3",
			type: "mentor",
			strength: 9,
			description: "Obi-Wan trains and guides Luke",
		},
		{
			from: "char-1",
			to: "char-2",
			type: "enemy",
			strength: 8,
			description: "Vader hunts Luke across the galaxy",
		},
		{
			from: "char-3",
			to: "char-2",
			type: "former friend",
			strength: 5,
			description: "Once friends, now enemies",
		},
	],
	tags: ["hero's journey", "space opera", "redemption", "coming-of-age"],
};

export const mockValidationResult: ValidationResult = {
	isValid: true,
	issues: [],
	analysis: {
		actBalance: { act1: 3, act2: 1, act3: 1, balance: 0.8 },
		characterCount: 3,
		conflictCount: 2,
		eventCount: 5,
		hasMidpoint: true,
		hasClimax: true,
		pacing: "fast",
	},
	recommendations: [
		"Consider adding more supporting characters to enrich the world",
		"The pacing is fast but effective for this story",
		"Great use of midpoint and climax structure",
	],
};

export const mockMermaidDiagram = `graph LR
    subgraph "Act 1"
        E1[The Call to Adventure] --> E2[Meeting the Mentor]
        E2 --> E3[Crossing the Threshold]
    end
    
    subgraph "Act 2"
        E3 --> E4[The Midpoint]
    end
    
    subgraph "Act 3"
        E4 --> E5[The Climax]
    end
    
    C1[Luke] --> E1
    C2[Vader] --> E4
    C3[Obi-Wan] --> E2
    
    style E1 fill:#9333ea,stroke:#333,stroke-width:2px
    style E4 fill:#eab308,stroke:#333,stroke-width:2px
    style E5 fill:#ef4444,stroke:#333,stroke-width:2px`;
