"use client";

import { useChat } from 'ai/react';
import { useState, useEffect } from 'react';
import { Book, Zap, ShieldCheck, Terminal, Send, User, Bot, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AGENT_MODES, cycleAgentModes } from "@/lib/agents/cli-bridge";

interface TimelineEvent {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: any;
  relatedIds: number[];
  status: 'completed' | 'running' | 'pending';
  energy: number;
}

export default function AgentSuite() {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<string>('support');
  const [sessionId, setSessionId] = useState<string>(() => `session_${Date.now()}`);
  const [timelineData, setTimelineData] = useState<TimelineEvent[]>([
    { 
      id: 1, 
      title: "Agent Active", 
      date: "Now", 
      content: "System Prompt Loaded", 
      category: "System", 
      icon: ShieldCheck, 
      relatedIds: [2], 
      status: "completed" as const, 
      energy: 100 
    },
    { 
      id: 2, 
      title: "Skill Discovery", 
      date: "Now", 
      content: "Order Lookup skill available in /.claude/skills", 
      category: "Runtime", 
      icon: Book, 
      relatedIds: [1], 
      status: "completed" as const, 
      energy: 90 
    }
  ]);

  const { messages, input, setInput, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      sessionId,
      mode: currentMode,
    },
    onFinish: (message) => {
      // Update timeline when message completes
      setTimelineData(prev => [
        ...prev,
        {
          id: Date.now(),
          title: "Response Generated",
          date: new Date().toLocaleTimeString(),
          content: message.content.substring(0, 50) + '...',
          category: "AI",
          icon: Bot,
          relatedIds: [],
          status: "completed" as const,
          energy: 85
        }
      ]);
    }
  });

  const handleModeChange = (direction: 'next' | 'prev') => {
    const newMode = cycleAgentModes(currentMode, direction);
    setCurrentMode(newMode);
    
    // Add timeline event
    setTimelineData(prev => [
      ...prev,
      {
        id: Date.now(),
        title: "Mode Switched",
        date: new Date().toLocaleTimeString(),
        content: `Changed to ${newMode} mode`,
        category: "System",
        icon: Settings,
        relatedIds: [],
        status: "completed" as const,
        energy: 95
      }
    ]);
  };

  const handleNewTask = () => {
    setSessionId(`session_${Date.now()}`);
    setTimelineData([{ 
      id: 1, 
      title: "New Task", 
      date: "Now", 
      content: "Fresh context started", 
      category: "System", 
      icon: RefreshCw, 
      relatedIds: [], 
      status: "completed" as const, 
      energy: 100 
    }]);
  };

  const currentAgentMode = AGENT_MODES.find(m => m.id === currentMode);

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Left: Chat & Skills Info */}
      <div className="w-96 border-r border-white/10 p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Terminal className="text-blue-500" /> Support Agent
          </h2>
          <Button variant="ghost" size="icon" onClick={handleNewTask}>
            <RefreshCw size={18} />
          </Button>
        </div>
        
        {/* Mode Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white/30 uppercase">Agent Mode</h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => handleModeChange('prev')}>←</Button>
              <Button variant="ghost" size="sm" onClick={() => handleModeChange('next')}>→</Button>
            </div>
          </div>
          
          <div className={`p-3 border rounded-md ${currentMode === 'support' ? 'border-blue-500/30 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Zap size={14} className="text-blue-400" />
              {currentAgentMode?.name || 'Support Agent'}
            </div>
            <p className="text-[10px] text-white/50 mt-1">{currentAgentMode?.description}</p>
          </div>
        </div>

        {/* Active Skills */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-white/30 uppercase">Active Skills</h3>
          <div className="p-3 border border-blue-500/30 bg-blue-500/10 rounded-md">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Book size={14} className="text-blue-400" /> Order Lookup
            </div>
            <p className="text-[10px] text-white/50 mt-1">Found in: /.claude/skills/order-lookup/</p>
          </div>
          <div className="p-3 border border-green-500/30 bg-green-500/10 rounded-md">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck size={14} className="text-green-400" /> Billing Support
            </div>
            <p className="text-[10px] text-white/50 mt-1">Found in: /.claude/skills/billing/</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-blue-500' : 'bg-green-500'}`}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[80%] p-3 rounded-lg ${m.role === 'user' ? 'bg-blue-500/20' : 'bg-white/10'}`}>
                <p className="text-sm">{m.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="p-3 rounded-lg bg-white/10">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            className="flex-1 p-2 bg-white/10 rounded border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message or use /agents..."
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send size={18} />
          </Button>
        </form>
      </div>

      {/* Right: Runtime Visualization */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Terminal className="text-purple-500" /> Runtime Activity
        </h3>
        
        <div className="space-y-4">
          {timelineData.map((event) => {
            const Icon = event.icon;
            return (
              <div key={event.id} className="border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Icon size={20} className="text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{event.title}</h4>
                      <span className="text-xs text-white/30">{event.date}</span>
                    </div>
                    <p className="text-sm text-white/60 mt-1">{event.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 rounded bg-white/10">{event.category}</span>
                      <span className="text-xs text-white/30">Energy: {event.energy}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Session Info */}
        <div className="mt-8 p-4 border border-white/10 rounded-lg bg-white/5">
          <h4 className="font-semibold mb-2">Session Information</h4>
          <div className="space-y-1 text-sm text-white/60">
            <p>Session ID: <span className="text-white/80">{sessionId}</span></p>
            <p>Mode: <span className="text-white/80">{currentMode}</span></p>
            <p>Sandbox: <span className="text-green-400">● Active</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
