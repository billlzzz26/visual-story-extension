'use client';

import React from 'react';
import { Book, Zap, ShieldCheck, Terminal, Clock, Activity } from "lucide-react";

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  relatedIds?: number[];
  status: 'completed' | 'in-progress' | 'pending';
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({ timelineData }: RadialOrbitalTimelineProps) {
  const centerX = 400;
  const centerY = 300;
  const radius = 150;

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-slate-800">
      <svg viewBox="0 0 800 600" className="w-full h-full max-w-4xl max-h-2xl">
        {/* Orbital rings */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="rgba(59, 130, 246, 0.2)"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.6}
          fill="none"
          stroke="rgba(59, 130, 246, 0.15)"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={radius * 0.3}
          fill="none"
          stroke="rgba(59, 130, 246, 0.1)"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        {/* Center hub */}
        <circle
          cx={centerX}
          cy={centerY}
          r="40"
          fill="url(#centerGradient)"
          stroke="rgba(59, 130, 246, 0.5)"
          strokeWidth="2"
        />
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white text-sm font-bold"
          style={{ fontSize: '12px' }}
        >
          Agent
        </text>

        {/* Connection lines */}
        {timelineData.map((item, index) => {
          const angle = (index / timelineData.length) * 2 * Math.PI - Math.PI / 2;
          const x = centerX + radius * 0.8 * Math.cos(angle);
          const y = centerY + radius * 0.8 * Math.sin(angle);

          return (
            <line
              key={`line-${item.id}`}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth="1"
            />
          );
        })}

        {/* Timeline nodes */}
        {timelineData.map((item, index) => {
          const angle = (index / timelineData.length) * 2 * Math.PI - Math.PI / 2;
          const x = centerX + radius * 0.8 * Math.cos(angle);
          const y = centerY + radius * 0.8 * Math.sin(angle);
          
          const IconComponent = item.icon;
          const color = item.status === 'completed' ? '#22c55e' : 
                       item.status === 'in-progress' ? '#3b82f6' : '#6b7280';

          return (
            <g key={item.id}>
              {/* Node circle */}
              <circle
                cx={x}
                cy={y}
                r="25"
                fill={`${color}20`}
                stroke={color}
                strokeWidth="2"
              />
              
              {/* Icon */}
              <foreignObject x={x - 12} y={y - 12} width="24" height="24">
                <IconComponent size={20} className="mx-auto" style={{ color }} />
              </foreignObject>

              {/* Label background */}
              <rect
                x={x - 60}
                y={y + 35}
                width="120"
                height="24"
                rx="4"
                fill="rgba(15, 23, 42, 0.8)"
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="1"
              />

              {/* Title */}
              <text
                x={x}
                y={y + 51}
                textAnchor="middle"
                className="fill-white text-xs font-medium"
                style={{ fontSize: '10px' }}
              >
                {item.title}
              </text>

              {/* Energy indicator */}
              <rect
                x={x - 20}
                y={y - 40}
                width="40"
                height="4"
                rx="2"
                fill="rgba(255, 255, 255, 0.2)"
              />
              <rect
                x={x - 20}
                y={y - 40}
                width={(item.energy / 100) * 40}
                height="4"
                rx="2"
                fill={color}
              />
            </g>
          );
        })}

        {/* Gradient definitions */}
        <defs>
          <radialGradient id="centerGradient" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(15, 23, 42, 0.8)" />
          </radialGradient>
        </defs>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 space-y-2 text-xs text-white/60">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500/20 border border-gray-500"></div>
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
}
