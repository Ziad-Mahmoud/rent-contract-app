import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UnitTypeChart({ data, title = "توزيع الوحدات حسب النوع" }) {
  const COLORS = ['#1e3a5f', '#2d5a8a', '#3b82f6', '#60a5fa'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium text-slate-800">{label}</p>
          <p className="text-sm text-slate-600">
            العدد: {payload[0].value} وحدة
          </p>
          <p className="text-sm text-slate-600">
            الدخل: {payload[0].payload.income?.toLocaleString()} جنيه
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="vertical"
              margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis 
                type="category" 
                dataKey="type" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}