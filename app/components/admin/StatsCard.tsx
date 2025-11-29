'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  onClick?: () => void;
  delay?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  color, 
  trend, 
  subtitle,
  onClick,
  delay = ''
}: StatsCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden
        bg-gradient-to-br ${color}
        rounded-2xl p-6 
        shadow-xl hover:shadow-2xl
        transition-all duration-300
        hover:scale-105 hover:-translate-y-1
        animate-fade-in-up ${delay}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      {/* Glass overlay effect */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-xl shadow-lg">
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-md ${
              trend.isPositive 
                ? 'bg-white/20 text-white' 
                : 'bg-black/20 text-white'
            }`}>
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-white/80 text-sm font-medium">{title}</h3>
          <p className="text-white text-2xl font-bold">
            {typeof value === 'string' ? value : value.toLocaleString()}
          </p>
          {subtitle && (
            <p className="text-white/70 text-xs flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}