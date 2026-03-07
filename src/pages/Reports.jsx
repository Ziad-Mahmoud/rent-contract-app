import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  BarChart3,
  TrendingUp,
  Building2,
  DollarSign,
  Users,
  FileText,
  Calendar,
  Percent,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import StatCard from '@/components/stats/StatCard';
import IncomeChart from '@/components/reports/IncomeChart';
import OccupancyChart from '@/components/reports/OccupancyChart';
import TrendChart from '@/components/reports/TrendChart';
import UnitTypeChart from '@/components/reports/UnitTypeChart';
import OwnerSummaryTable from '@/components/reports/OwnerSummaryTable';
import ExportButtons, { exportToCSV, generatePDFContent, printPDF } from '@/components/reports/ExportButtons';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [owners, setOwners] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('12');
  const [selectedOwner, setSelectedOwner] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [contractsData, ownersData, tenantsData, unitsData] = await Promise.all([
      base44.entities.Contract.list(),
      base44.entities.Owner.list(),
      base44.entities.Tenant.list(),
      base44.entities.Unit.list(),
    ]);
    setContracts(contractsData);
    setOwners(ownersData);
    setTenants(tenantsData);
    setUnits(unitsData);
    setLoading(false);
  };

  // Filter data based on selected owner
  const filteredContracts = selectedOwner === 'all' 
    ? contracts 
    : contracts.filter(c => c.owner_id === selectedOwner);

  const filteredUnits = selectedOwner === 'all'
    ? units
    : units.filter(u => u.owner_id === selectedOwner);

  // Calculate statistics
  const activeContracts = filteredContracts.filter(c => c.status === 'ساري');
  const totalMonthlyIncome = activeContracts.reduce((sum, c) => sum + (c.monthly_rent || 0), 0);
  const totalAnnualIncome = totalMonthlyIncome * 12;
  const rentedUnits = filteredUnits.filter(u => u.status === 'مؤجرة').length;
  const availableUnits = filteredUnits.filter(u => u.status === 'متاحة').length;
  const occupancyRate = filteredUnits.length > 0 ? (rentedUnits / filteredUnits.length) * 100 : 0;

  // Generate monthly income data
  const generateMonthlyData = () => {
    const months = parseInt(selectedPeriod);
    const data = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthContracts = filteredContracts.filter(c => {
        const startDate = new Date(c.start_date);
        const endDate = new Date(c.end_date);
        return c.status === 'ساري' && isWithinInterval(monthStart, { start: startDate, end: endDate });
      });

      const income = monthContracts.reduce((sum, c) => sum + (c.monthly_rent || 0), 0);

      data.push({
        month: format(monthDate, 'MMM yyyy', { locale: ar }),
        income: income,
        collected: income * 0.9, // Assume 90% collection rate
        contracts: monthContracts.length
      });
    }

    return data;
  };

  // Generate occupancy data
  const generateOccupancyData = () => {
    const rented = filteredUnits.filter(u => u.status === 'مؤجرة').length;
    const available = filteredUnits.filter(u => u.status === 'متاحة').length;
    const maintenance = filteredUnits.filter(u => u.status === 'صيانة').length;

    return [
      { name: 'مؤجرة', value: rented },
      { name: 'متاحة', value: available },
      { name: 'صيانة', value: maintenance },
    ].filter(d => d.value > 0);
  };

  // Generate unit type data
  const generateUnitTypeData = () => {
    const types = ['شقة', 'فيلا', 'وحدة إدارية', 'سيارة'];
    return types.map(type => {
      const typeUnits = filteredUnits.filter(u => u.unit_type === type);
      const rentedTypeUnits = typeUnits.filter(u => u.status === 'مؤجرة');
      const typeContracts = filteredContracts.filter(c => {
        const unit = units.find(u => u.id === c.unit_id);
        return unit?.unit_type === type && c.status === 'ساري';
      });
      const income = typeContracts.reduce((sum, c) => sum + (c.monthly_rent || 0), 0);

      return {
        type,
        count: typeUnits.length,
        rented: rentedTypeUnits.length,
        income
      };
    }).filter(d => d.count > 0);
  };

  // Generate owner summary data
  const generateOwnerSummaryData = () => {
    return owners.map(owner => {
      const ownerUnits = units.filter(u => u.owner_id === owner.id);
      const rentedOwnerUnits = ownerUnits.filter(u => u.status === 'مؤجرة');
      const ownerContracts = contracts.filter(c => c.owner_id === owner.id && c.status === 'ساري');
      const monthlyIncome = ownerContracts.reduce((sum, c) => sum + (c.monthly_rent || 0), 0);

      return {
        id: owner.id,
        name: owner.full_name,
        totalUnits: ownerUnits.length,
        rentedUnits: rentedOwnerUnits.length,
        occupancyRate: ownerUnits.length > 0 ? (rentedOwnerUnits.length / ownerUnits.length) * 100 : 0,
        monthlyIncome,
        annualIncome: monthlyIncome * 12
      };
    }).filter(o => o.totalUnits > 0);
  };

  // Export functions
  const handleExportCSV = () => {
    setExporting(true);
    const ownerData = generateOwnerSummaryData();
    const headers = [
      { key: 'name', label: 'المالك' },
      { key: 'totalUnits', label: 'عدد الوحدات' },
      { key: 'rentedUnits', label: 'المؤجرة' },
      { key: 'occupancyRate', label: 'نسبة الإشغال' },
      { key: 'monthlyIncome', label: 'الدخل الشهري' },
      { key: 'annualIncome', label: 'الدخل السنوي' },
    ];
    exportToCSV(ownerData, `تقرير_الأداء_${format(new Date(), 'yyyy-MM-dd')}`, headers);
    setExporting(false);
  };

  const handleExportPDF = () => {
    setExporting(true);
    const ownerData = generateOwnerSummaryData();
    
    const summaryHTML = `
      <div class="summary">
        <div class="summary-card">
          <h3>إجمالي الوحدات</h3>
          <p>${filteredUnits.length}</p>
        </div>
        <div class="summary-card">
          <h3>نسبة الإشغال</h3>
          <p>${occupancyRate.toFixed(1)}%</p>
        </div>
        <div class="summary-card">
          <h3>الدخل الشهري</h3>
          <p>${totalMonthlyIncome.toLocaleString()} جنيه</p>
        </div>
        <div class="summary-card">
          <h3>الدخل السنوي</h3>
          <p>${totalAnnualIncome.toLocaleString()} جنيه</p>
        </div>
      </div>
    `;

    const tableHTML = `
      <h2>ملخص أداء الملاك</h2>
      <table>
        <thead>
          <tr>
            <th>المالك</th>
            <th>عدد الوحدات</th>
            <th>المؤجرة</th>
            <th>نسبة الإشغال</th>
            <th>الدخل الشهري</th>
            <th>الدخل السنوي</th>
          </tr>
        </thead>
        <tbody>
          ${ownerData.map(o => `
            <tr>
              <td>${o.name}</td>
              <td>${o.totalUnits}</td>
              <td>${o.rentedUnits}</td>
              <td>${o.occupancyRate.toFixed(0)}%</td>
              <td>${o.monthlyIncome.toLocaleString()} جنيه</td>
              <td>${o.annualIncome.toLocaleString()} جنيه</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const content = generatePDFContent('تقرير أداء المحفظة العقارية', tableHTML, summaryHTML);
    printPDF(content);
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const monthlyData = generateMonthlyData();
  const occupancyData = generateOccupancyData();
  const unitTypeData = generateUnitTypeData();
  const ownerSummaryData = generateOwnerSummaryData();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-[#1e3a5f]" />
            التقارير والتحليلات
          </h1>
          <p className="text-slate-500 mt-1">تحليل أداء المحفظة العقارية</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={selectedOwner} onValueChange={setSelectedOwner}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="جميع الملاك" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الملاك</SelectItem>
              {owners.map(owner => (
                <SelectItem key={owner.id} value={owner.id}>
                  {owner.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 أشهر</SelectItem>
              <SelectItem value="6">6 أشهر</SelectItem>
              <SelectItem value="12">12 شهر</SelectItem>
            </SelectContent>
          </Select>
          <ExportButtons
            onExportCSV={handleExportCSV}
            onExportPDF={handleExportPDF}
            loading={exporting}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي الوحدات"
          value={filteredUnits.length}
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="نسبة الإشغال"
          value={`${occupancyRate.toFixed(1)}%`}
          icon={Percent}
          color={occupancyRate >= 70 ? 'green' : occupancyRate >= 50 ? 'amber' : 'red'}
        />
        <StatCard
          title="الدخل الشهري"
          value={`${totalMonthlyIncome.toLocaleString()} جنيه`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="الدخل السنوي المتوقع"
          value={`${totalAnnualIncome.toLocaleString()} جنيه`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Tabs for different report views */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white shadow-lg border p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="income" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
            تحليل الدخل
          </TabsTrigger>
          <TabsTrigger value="occupancy" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
            تحليل الإشغال
          </TabsTrigger>
          <TabsTrigger value="owners" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
            تقارير الملاك
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncomeChart data={monthlyData} />
            <OccupancyChart data={occupancyData} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendChart data={monthlyData} title="اتجاه الدخل والعقود" />
            <UnitTypeChart data={unitTypeData} />
          </div>
        </TabsContent>

        <TabsContent value="income" className="space-y-6">
          <IncomeChart data={monthlyData} title="تحليل الدخل الشهري" />
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">تفاصيل الدخل حسب نوع الوحدة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {unitTypeData.map((type, index) => (
                  <div key={index} className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-medium text-slate-700">{type.type}</h4>
                    <p className="text-2xl font-bold text-[#1e3a5f] mt-2">
                      {type.income.toLocaleString()} جنيه
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {type.rented} من {type.count} وحدة مؤجرة
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <TrendChart data={monthlyData} title="اتجاه الدخل عبر الزمن" />
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OccupancyChart data={occupancyData} title="توزيع حالة الوحدات" />
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">تفاصيل الإشغال</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-emerald-500" />
                      <span className="font-medium">وحدات مؤجرة</span>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-emerald-700">{rentedUnits}</p>
                      <p className="text-sm text-slate-500">
                        {((rentedUnits / filteredUnits.length) * 100 || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-amber-500" />
                      <span className="font-medium">وحدات متاحة</span>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-amber-700">{availableUnits}</p>
                      <p className="text-sm text-slate-500">
                        {((availableUnits / filteredUnits.length) * 100 || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-red-500" />
                      <span className="font-medium">وحدات صيانة</span>
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-red-700">
                        {filteredUnits.filter(u => u.status === 'صيانة').length}
                      </p>
                      <p className="text-sm text-slate-500">
                        {((filteredUnits.filter(u => u.status === 'صيانة').length / filteredUnits.length) * 100 || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-slate-700 mb-3">الدخل الضائع من الوحدات الشاغرة</h4>
                  <p className="text-3xl font-bold text-red-600">
                    {filteredUnits
                      .filter(u => u.status !== 'مؤجرة')
                      .reduce((sum, u) => sum + (u.monthly_rent || 0), 0)
                      .toLocaleString()} جنيه/شهر
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <UnitTypeChart data={unitTypeData} title="الإشغال حسب نوع الوحدة" />
        </TabsContent>

        <TabsContent value="owners" className="space-y-6">
          <OwnerSummaryTable data={ownerSummaryData} />
          
          {/* Individual Owner Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownerSummaryData.map((owner, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8a] flex items-center justify-center text-white font-bold text-lg">
                      {owner.name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{owner.name}</h3>
                      <p className="text-sm text-slate-500">{owner.totalUnits} وحدة</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">نسبة الإشغال</span>
                      <span className={`font-bold ${
                        owner.occupancyRate >= 80 ? 'text-emerald-600' :
                        owner.occupancyRate >= 50 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {owner.occupancyRate.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          owner.occupancyRate >= 80 ? 'bg-emerald-500' :
                          owner.occupancyRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${owner.occupancyRate}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-600">الدخل الشهري</span>
                      <span className="font-bold text-[#1e3a5f]">
                        {owner.monthlyIncome.toLocaleString()} جنيه
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">الدخل السنوي</span>
                      <span className="font-bold text-emerald-600">
                        {owner.annualIncome.toLocaleString()} جنيه
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a] text-white">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white/70 text-sm mb-2">إجمالي العقود السارية</h4>
              <p className="text-4xl font-bold">{activeContracts.length}</p>
            </div>
            <div>
              <h4 className="text-white/70 text-sm mb-2">متوسط الإيجار الشهري</h4>
              <p className="text-4xl font-bold">
                {activeContracts.length > 0 
                  ? Math.round(totalMonthlyIncome / activeContracts.length).toLocaleString()
                  : 0
                } جنيه
              </p>
            </div>
            <div>
              <h4 className="text-white/70 text-sm mb-2">إجمالي الملاك</h4>
              <p className="text-4xl font-bold">{owners.length}</p>
            </div>
            <div>
              <h4 className="text-white/70 text-sm mb-2">إجمالي المستأجرين</h4>
              <p className="text-4xl font-bold">{tenants.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}