import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, icon: Icon, color = 'blue', trend }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className={cn(
        "absolute inset-0 opacity-10 bg-gradient-to-br",
        colors[color]
      )} />
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
            {trend && (
              <p className={cn(
                "text-sm mt-2",
                trend > 0 ? "text-emerald-600" : "text-red-500"
              )}>
                {trend > 0 ? '+' : ''}{trend}% من الشهر الماضي
              </p>
            )}
          </div>
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br",
            colors[color]
          )}>
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>
    </Card>
  );
}