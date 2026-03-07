import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function OwnerSummaryTable({ data, title = "ملخص أداء الملاك" }) {
  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-right">المالك</TableHead>
                <TableHead className="text-center">عدد الوحدات</TableHead>
                <TableHead className="text-center">المؤجرة</TableHead>
                <TableHead className="text-center">نسبة الإشغال</TableHead>
                <TableHead className="text-center">الدخل الشهري</TableHead>
                <TableHead className="text-center">الدخل السنوي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((owner, index) => (
                <TableRow key={index} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{owner.name}</TableCell>
                  <TableCell className="text-center">{owner.totalUnits}</TableCell>
                  <TableCell className="text-center">{owner.rentedUnits}</TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      className={
                        owner.occupancyRate >= 80 
                          ? 'bg-emerald-100 text-emerald-700'
                          : owner.occupancyRate >= 50
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }
                    >
                      {owner.occupancyRate.toFixed(0)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {owner.monthlyIncome.toLocaleString()} جنيه
                  </TableCell>
                  <TableCell className="text-center font-medium text-[#1e3a5f]">
                    {owner.annualIncome.toLocaleString()} جنيه
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}