export interface AgentMode {
  id: string;
  name: string;
  description: string;
  skillPath: string;
}

export const AGENT_MODES: AgentMode[] = [
  {
    id: 'support',
    name: 'Support Agent',
    description: 'จัดการคำถามและการสนับสนุนลูกค้า',
    skillPath: '/workspace/.kilo/skills/support.md',
  },
  {
    id: 'code',
    name: 'Code Assistant',
    description: 'ช่วยเหลือการเขียนโค้ดและ debug',
    skillPath: '/workspace/.kilo/skills/code.md',
  },
  {
    id: 'planner',
    name: 'Task Planner',
    description: 'วางแผนและจัดการงาน',
    skillPath: '/workspace/.kilo/skills/planner.md',
  },
  {
    id: 'debug',
    name: 'Debug Expert',
    description: 'เชี่ยวชาญการแก้ไขปัญหาและ debug',
    skillPath: '/workspace/.kilo/skills/debug.md',
  },
];

export function getAgentModeById(id: string): AgentMode | undefined {
  return AGENT_MODES.find((mode) => mode.id === id);
}

export function cycleAgentModes(currentId: string, direction: 'next' | 'prev'): string {
  const currentIndex = AGENT_MODES.findIndex((mode) => mode.id === currentId);
  
  if (currentIndex === -1) {
    return AGENT_MODES[0].id;
  }

  let newIndex: number;
  if (direction === 'next') {
    newIndex = (currentIndex + 1) % AGENT_MODES.length;
  } else {
    newIndex = (currentIndex - 1 + AGENT_MODES.length) % AGENT_MODES.length;
  }

  return AGENT_MODES[newIndex].id;
}

export function parseSlashCommand(input: string): { command: string; args?: string } | null {
  if (!input.startsWith('/')) {
    return null;
  }

  const parts = input.slice(1).split(' ');
  return {
    command: parts[0],
    args: parts.slice(1).join(' ') || undefined,
  };
}
