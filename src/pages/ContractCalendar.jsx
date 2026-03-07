import React, { useState, useEffect } from 'react';
import { createEntity } from "../api/entityFactory";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isWithinInterval
} from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Circle,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function ContractCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [contracts, setContracts] = useState([]);
  const [owners, setOwners] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayDetails, setShowDayDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [contractsData, ownersData, tenantsData, unitsData] = await Promise.all([
      createEntity("contracts").list(),
      createEntity("owner").list(),
      createEntity("tenant").list(),
      createEntity("unit").list(),
    ]);
    setContracts(contractsData);
    setOwners(ownersData);
    setTenants(tenantsData);
    setUnits(unitsData);
    setLoading(false);
  };

  const getOwnerName = (id) => owners.find(o => o.id === id)?.full_name || 'غير محدد';
  const getTenantName = (id) => tenants.find(t => t.id === id)?.full_name || 'غير محدد';
  const getUnitTitle = (id) => units.find(u => u.id === id)?.title || 'غير محدد';

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold text-slate-800">
          {format(currentMonth, 'MMMM yyyy', { locale: ar })}
        </h2>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const getContractsForDay = (day) => {
    const startContracts = contracts.filter(c => isSameDay(new Date(c.start_date), day));
    const endContracts = contracts.filter(c => isSameDay(new Date(c.end_date), day));
    const activeContracts = contracts.filter(c => 
      c.status === 'ساري' &&
      isWithinInterval(day, {
        start: new Date(c.start_date),
        end: new Date(c.end_date)
      })
    );
    return { startContracts, endContracts, activeContracts };
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const today = new Date();

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const { startContracts, endContracts, activeContracts } = getContractsForDay(day);
        const isToday = isSameDay(day, today);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            key={day.toString()}
            onClick={() => {
              if (startContracts.length > 0 || endContracts.length > 0) {
                setSelectedDay(cloneDay);
                setShowDayDetails(true);
              }
            }}
            className={cn(
              "min-h-24 p-2 border rounded-lg transition-colors cursor-pointer",
              !isCurrentMonth && "bg-slate-50 text-slate-400",
              isToday && "border-[#1e3a5f] border-2",
              (startContracts.length > 0 || endContracts.length > 0) && "hover:bg-slate-50"
            )}
          >
            <div className={cn(
              "text-sm font-medium mb-1",
              isToday && "text-[#1e3a5f]"
            )}>
              {format(day, 'd')}
            </div>
            <div className="space-y-1">
              {startContracts.slice(0, 2).map((contract) => (
                <div
                  key={`start-${contract.id}`}
                  className="text-xs bg-emerald-100 text-emerald-700 rounded px-1 py-0.5 truncate flex items-center gap-1"
                >
                  <CheckCircle className="h-3 w-3" />
                  <span>بداية عقد</span>
                </div>
              ))}
              {endContracts.slice(0, 2).map((contract) => (
                <div
                  key={`end-${contract.id}`}
                  className="text-xs bg-red-100 text-red-700 rounded px-1 py-0.5 truncate flex items-center gap-1"
                >
                  <AlertTriangle className="h-3 w-3" />
                  <span>نهاية عقد</span>
                </div>
              ))}
              {(startContracts.length + endContracts.length > 2) && (
                <div className="text-xs text-slate-500">
                  +{startContracts.length + endContracts.length - 2} آخرين
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-1">{rows}</div>;
  };

  const getSelectedDayContracts = () => {
    if (!selectedDay) return { start: [], end: [] };
    const start = contracts.filter(c => isSameDay(new Date(c.start_date), selectedDay));
    const end = contracts.filter(c => isSameDay(new Date(c.end_date), selectedDay));
    return { start, end };
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const selectedDayContracts = getSelectedDayContracts();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-[#1e3a5f]" />
            تقويم العقود
          </h1>
          <p className="text-slate-500 mt-1">عرض مواعيد بداية ونهاية العقود</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-100" />
            <span>بداية عقد</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100" />
            <span>نهاية عقد</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </CardContent>
      </Card>

      {/* Upcoming Contract Ends */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            عقود تنتهي قريباً (خلال 30 يوم)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contracts
            .filter(c => {
              const endDate = new Date(c.end_date);
              const today = new Date();
              const thirtyDaysLater = addDays(today, 30);
              return c.status === 'ساري' && endDate >= today && endDate <= thirtyDaysLater;
            })
            .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
            .length === 0 ? (
            <p className="text-slate-500 text-center py-4">لا توجد عقود تنتهي قريباً</p>
          ) : (
            <div className="space-y-3">
              {contracts
                .filter(c => {
                  const endDate = new Date(c.end_date);
                  const today = new Date();
                  const thirtyDaysLater = addDays(today, 30);
                  return c.status === 'ساري' && endDate >= today && endDate <= thirtyDaysLater;
                })
                .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
                .map((contract) => (
                  <Link
                    key={contract.id}
                    to={createPageUrl('Contracts') + `?id=${contract.id}`}
                    className="flex items-center justify-between p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {getUnitTitle(contract.unit_id)}
                      </p>
                      <p className="text-sm text-slate-600">
                        {getTenantName(contract.tenant_id)} - {getOwnerName(contract.owner_id)}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                      ينتهي في {format(new Date(contract.end_date), 'dd MMM', { locale: ar })}
                    </Badge>
                  </Link>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Day Details Dialog */}
      <Dialog open={showDayDetails} onOpenChange={setShowDayDetails}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && format(selectedDay, 'EEEE، dd MMMM yyyy', { locale: ar })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDayContracts.start.length > 0 && (
              <div>
                <h4 className="font-medium text-emerald-700 flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  عقود تبدأ في هذا اليوم
                </h4>
                <div className="space-y-2">
                  {selectedDayContracts.start.map((contract) => (
                    <Link
                      key={contract.id}
                      to={createPageUrl('Contracts') + `?id=${contract.id}`}
                      className="block p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <p className="font-medium">{getUnitTitle(contract.unit_id)}</p>
                      <p className="text-sm text-slate-600">
                        المستأجر: {getTenantName(contract.tenant_id)}
                      </p>
                      <p className="text-sm text-slate-600">
                        الإيجار: {contract.monthly_rent?.toLocaleString()} جنيه/شهر
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {selectedDayContracts.end.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  عقود تنتهي في هذا اليوم
                </h4>
                <div className="space-y-2">
                  {selectedDayContracts.end.map((contract) => (
                    <Link
                      key={contract.id}
                      to={createPageUrl('Contracts') + `?id=${contract.id}`}
                      className="block p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <p className="font-medium">{getUnitTitle(contract.unit_id)}</p>
                      <p className="text-sm text-slate-600">
                        المستأجر: {getTenantName(contract.tenant_id)}
                      </p>
                      <p className="text-sm text-slate-600">
                        الإيجار: {contract.monthly_rent?.toLocaleString()} جنيه/شهر
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}