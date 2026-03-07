import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  Users,
  Building2,
  UserCheck,
  FileText,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import StatCard from '@/components/stats/StatCard';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    owners: 0,
    units: 0,
    tenants: 0,
    contracts: 0,
    activeContracts: 0,
    availableUnits: 0,
  });
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [recentContracts, setRecentContracts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const [owners, units, tenants, contracts] = await Promise.all([
      base44.entities.Owner.list(),
      base44.entities.Unit.list(),
      base44.entities.Tenant.list(),
      base44.entities.Contract.list('-created_date', 50),
    ]);

    const activeContracts = contracts.filter(c => c.status === 'ساري');
    const availableUnits = units.filter(u => u.status === 'متاحة');

    // Find expiring contracts (within 30 days)
    const today = new Date();
    const thirtyDaysLater = addDays(today, 30);
    const expiring = activeContracts.filter(c => {
      const endDate = new Date(c.end_date);
      return isAfter(endDate, today) && isBefore(endDate, thirtyDaysLater);
    });

    setStats({
      owners: owners.length,
      units: units.length,
      tenants: tenants.length,
      contracts: contracts.length,
      activeContracts: activeContracts.length,
      availableUnits: availableUnits.length,
    });

    setExpiringContracts(expiring.slice(0, 5));
    setRecentContracts(contracts.slice(0, 5));
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">لوحة التحكم</h1>
          <p className="text-slate-500 mt-1">مرحباً بك في نظام إدارة العقارات</p>
        </div>
        <div className="flex gap-3">
          <Link to={createPageUrl('Contracts') + '?new=true'}>
            <Button className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a] hover:opacity-90">
              <FileText className="h-4 w-4 ml-2" />
              إنشاء عقد جديد
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي الملاك"
          value={stats.owners}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="إجمالي الوحدات"
          value={stats.units}
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="العقود السارية"
          value={stats.activeContracts}
          icon={FileText}
          color="green"
        />
        <StatCard
          title="الوحدات المتاحة"
          value={stats.availableUnits}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Contracts */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                عقود تنتهي قريباً
              </CardTitle>
              <Link to={createPageUrl('Contracts')}>
                <Button variant="ghost" size="sm" className="text-[#1e3a5f]">
                  عرض الكل
                  <ArrowLeft className="h-4 w-4 mr-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {expiringContracts.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>لا توجد عقود تنتهي قريباً</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {expiringContracts.map((contract) => (
                  <Link
                    key={contract.id}
                    to={createPageUrl('Contracts') + `?id=${contract.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        عقد رقم {contract.contract_number || contract.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-slate-500">
                        ينتهي في {format(new Date(contract.end_date), 'dd MMMM yyyy', { locale: ar })}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      {Math.ceil((new Date(contract.end_date) - new Date()) / (1000 * 60 * 60 * 24))} يوم
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Contracts */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-[#1e3a5f]" />
                أحدث العقود
              </CardTitle>
              <Link to={createPageUrl('Contracts')}>
                <Button variant="ghost" size="sm" className="text-[#1e3a5f]">
                  عرض الكل
                  <ArrowLeft className="h-4 w-4 mr-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentContracts.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>لا توجد عقود بعد</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentContracts.map((contract) => (
                  <Link
                    key={contract.id}
                    to={createPageUrl('Contracts') + `?id=${contract.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        عقد رقم {contract.contract_number || contract.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {contract.monthly_rent?.toLocaleString()} جنيه/شهر
                      </p>
                    </div>
                    <Badge
                      className={
                        contract.status === 'ساري'
                          ? 'bg-emerald-100 text-emerald-700'
                          : contract.status === 'منتهي'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-red-100 text-red-700'
                      }
                    >
                      {contract.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to={createPageUrl('Owners') + '?new=true'}>
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2 hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5">
                <Users className="h-8 w-8 text-[#1e3a5f]" />
                <span>إضافة مالك</span>
              </Button>
            </Link>
            <Link to={createPageUrl('Units') + '?new=true'}>
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2 hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5">
                <Building2 className="h-8 w-8 text-[#1e3a5f]" />
                <span>إضافة وحدة</span>
              </Button>
            </Link>
            <Link to={createPageUrl('Tenants') + '?new=true'}>
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2 hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5">
                <UserCheck className="h-8 w-8 text-[#1e3a5f]" />
                <span>إضافة مستأجر</span>
              </Button>
            </Link>
            <Link to={createPageUrl('ContractTemplates')}>
              <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2 hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5">
                <FileText className="h-8 w-8 text-[#1e3a5f]" />
                <span>نماذج العقود</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}