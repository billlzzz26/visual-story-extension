"use client";

import { useChat } from 'ai/react';
import { useState, useEffect } from 'react';
import { Book, Zap, ShieldCheck, Terminal, Send } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AgentSuite() {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [sandboxId, setSandboxId] = useState<string | undefined>(undefined);
  const [authStatus, setAuthStatus] = useState<'authenticated' | 'unauthenticated' | 'checking'>('checking');
  
  const { messages, input, setInput, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { sandboxId },
    onResponse: (response) => {
      if (response.ok) {
        setAuthStatus('authenticated');
      } else if (response.status === 401) {
        setAuthStatus('unauthenticated');
      }
    },
  });

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/oauth/status?resource=' + encodeURIComponent(process.env.NEXT_PUBLIC_DOCS_URL || ''));
        const data = await res.json();
        setAuthStatus(data.isAuthenticated ? 'authenticated' : 'unauthenticated');
      } catch {
        setAuthStatus('unauthenticated');
      }
    };
    checkAuth();
  }, []);

  // Handle OAuth initiation
  const handleOAuth = async () => {
    try {
      const res = await fetch('/api/oauth/authorize?resource=' + encodeURIComponent(process.env.NEXT_PUBLIC_DOCS_URL || ''));
      const data = await res.json();
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      }
    } catch (error) {
      console.error('OAuth initiation failed:', error);
    }
  };

  const timelineData = [
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
      content: "Order Lookup skill available", 
      category: "Runtime", 
      icon: Book, 
      relatedIds: [1], 
      status: "completed" as const, 
      energy: 90 
    },
    { 
      id: 3, 
      title: "Sandbox Ready", 
      date: "Now", 
      content: sandboxId ? `ID: ${sandboxId.slice(0, 8)}...` : "Initializing...", 
      category: "Infrastructure", 
      icon: Terminal, 
      relatedIds: [1, 2], 
      status: sandboxId ? "completed" as const : "in-progress" as const, 
      energy: sandboxId ? 95 : 50 
    }
  ];

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Left: Chat & Skills Info */}
      <div className="w-96 border-r border-white/10 p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Terminal className="text-blue-500" /> Support Agent
          </h2>
          <Badge variant={authStatus === 'authenticated' ? 'default' : 'destructive'}>
            {authStatus === 'authenticated' ? '✓ Auth' : authStatus === 'checking' ? '...' : '✕ Auth'}
          </Badge>
        </div>
        
        {/* Auth Button */}
        {authStatus === 'unauthenticated' && (
          <Button onClick={handleOAuth} className="w-full" variant="outline">
            Authenticate with OAuth
          </Button>
        )}

        {/* Active Skills */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-white/30 uppercase">Active Skills</h3>
          <Card className="border-blue-500/30 bg-blue-500/10">
            <CardContent className="p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Zap size={14} className="text-blue-400" /> Order Lookup
              </div>
              <p className="text-[10px] text-white/50">Found in: /.claude/skills/order-lookup/</p>
            </CardContent>
          </Card>
          <Card className="border-purple-500/30 bg-purple-500/10">
            <CardContent className="p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Book size={14} className="text-purple-400" /> Billing Support
              </div>
              <p className="text-[10px] text-white/50">Found in: /.claude/skills/billing-support/</p>
            </CardContent>
          </Card>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-white/30 py-8">
              <p className="text-sm">Start a conversation...</p>
              <p className="text-xs mt-2">Try: "What's my order status?"</p>
            </div>
          ) : (
            messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  m.role === 'user' 
                    ? 'bg-blue-500/20 border border-blue-500/30' 
                    : 'bg-white/5 border border-white/10'
                }`}>
                  <p className="text-sm">{m.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            className="flex-1 p-2 bg-white/10 rounded border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-blue-500/50"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send size={16} />
          </Button>
        </form>
      </div>

      {/* Right: Runtime Visualization */}
      <div className="flex-1 relative">
        <RadialOrbitalTimeline timelineData={timelineData} />
        
        {/* Sandbox ID Display */}
        {sandboxId && (
          <div className="absolute top-4 right-4">
            <Card className="bg-black/50 border-white/10">
              <CardContent className="p-3 text-xs">
                <span className="text-white/50">Sandbox:</span>{' '}
                <code className="text-blue-400">{sandboxId}</code>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
