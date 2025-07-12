import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'green' | 'yellow' | 'red' | 'blue' | 'purple';
  trend?: 'up' | 'down' | 'stable';
}

const colorClasses = {
  green: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-200',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-600 dark:text-yellow-200',
  red: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-600 dark:text-red-200', 
  blue: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-200',
  purple: 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/30 dark:border-purple-600 dark:text-purple-200',
};

const iconColorClasses = {
  green: 'text-green-600 dark:text-green-400',
  yellow: 'text-yellow-600 dark:text-yellow-400',
  red: 'text-red-600 dark:text-red-400',
  blue: 'text-blue-600 dark:text-blue-400',
  purple: 'text-purple-600 dark:text-purple-400',
};

export default function MetricCard({ title, value, subtitle, icon: Icon, color, trend }: MetricCardProps) {
  return (
    <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} transition-all hover:shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm opacity-80 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-white/50 dark:bg-black/20 ${iconColorClasses[color]}`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}