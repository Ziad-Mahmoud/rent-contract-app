import React, { useState, useEffect } from 'react';
import { createEntity } from "../api/entityFactory";
import { Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Home,
  Car,
  Briefcase,
  Edit,
  Trash2,
  MoreVertical,
  Maximize,
  DoorOpen,
  Bath
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import UnitForm from '@/components/forms/UnitForm';

export default function Units() {
  const [units, setUnits] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);

  useEffect(() => {
    loadData();
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('new') === 'true') {
      setShowForm(true);
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [unitsData, ownersData] = await Promise.all([
      createEntity("unit").list('-created_date'),
      createEntity("owner").list(),
    ]);
    setUnits(unitsData);
    setOwners(ownersData);
    setLoading(false);
  };

  const handleSave = async (data) => {
    setSaving(true);
    if (selectedUnit) {
      await createEntity("unit").update(selectedUnit.id, data);
    } else {
      await createEntity("unit").create(data);
    }
    setSaving(false);
    setShowForm(false);
    setSelectedUnit(null);
    loadData();
  };

  const handleDelete = async () => {
    if (unitToDelete) {
      await createEntity("unit").delete(unitToDelete.id);
      setDeleteDialogOpen(false);
      setUnitToDelete(null);
      loadData();
    }
  };

  const getOwnerName = (ownerId) => {
    const owner = owners.find(o => o.id === ownerId);
    return owner?.full_name || 'غير محدد';
  };

  const getUnitIcon = (type) => {
    switch (type) {
      case 'شقة': return Home;
      case 'فيلا': return Building2;
      case 'وحدة إدارية': return Briefcase;
      case 'سيارة': return Car;
      default: return Building2;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'متاحة': return 'bg-emerald-100 text-emerald-700';
      case 'مؤجرة': return 'bg-blue-100 text-blue-700';
      case 'صيانة': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || unit.unit_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || unit.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-[#1e3a5f]" />
            الوحدات
          </h1>
          <p className="text-slate-500 mt-1">إدارة العقارات والسيارات</p>
        </div>
        <Button
          onClick={() => {
            setSelectedUnit(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a]"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة وحدة جديدة
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="بحث بالاسم أو العنوان..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="نوع الوحدة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="شقة">شقة</SelectItem>
                <SelectItem value="فيلا">فيلا</SelectItem>
                <SelectItem value="وحدة إدارية">وحدة إدارية</SelectItem>
                <SelectItem value="سيارة">سيارة</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="متاحة">متاحة</SelectItem>
                <SelectItem value="مؤجرة">مؤجرة</SelectItem>
                <SelectItem value="صيانة">صيانة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Units Grid */}
      {filteredUnits.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' ? 'لا توجد نتائج' : 'لا توجد وحدات بعد'}
            </h3>
            <p className="text-slate-500 mb-4">
              {searchTerm ? 'جرب البحث بكلمات أخرى' : 'ابدأ بإضافة وحدة جديدة'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit) => {
            const Icon = getUnitIcon(unit.unit_type);
            return (
              <Card key={unit.id} className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
                  {unit.images?.[0] ? (
                    <img
                      src={unit.images[0]}
                      alt={unit.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon className="h-16 w-16 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge className={getStatusColor(unit.status)}>
                      {unit.status}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => {
                        setSelectedUnit(unit);
                        setShowForm(true);
                      }}>
                        <Edit className="h-4 w-4 ml-2" />
                        تعديل
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setUnitToDelete(unit);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 ml-2" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg">{unit.title}</h3>
                      <p className="text-sm text-slate-500">{getOwnerName(unit.owner_id)}</p>
                    </div>
                    <Badge variant="outline" className="text-[#1e3a5f] border-[#1e3a5f]/20">
                      {unit.unit_type}
                    </Badge>
                  </div>

                  {unit.unit_type !== 'سيارة' ? (
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                      {unit.area && (
                        <div className="flex items-center gap-1">
                          <Maximize className="h-4 w-4" />
                          <span>{unit.area} م²</span>
                        </div>
                      )}
                      {unit.rooms && (
                        <div className="flex items-center gap-1">
                          <DoorOpen className="h-4 w-4" />
                          <span>{unit.rooms} غرف</span>
                        </div>
                      )}
                      {unit.bathrooms && (
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          <span>{unit.bathrooms}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 mb-3">
                      {unit.car_model} - {unit.car_year}
                    </p>
                  )}

                  {unit.address && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{unit.address}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <p className="text-lg font-bold text-[#1e3a5f]">
                      {unit.monthly_rent?.toLocaleString() || '---'} جنيه
                      <span className="text-sm font-normal text-slate-500">/شهر</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedUnit ? 'تعديل بيانات الوحدة' : 'إضافة وحدة جديدة'}
            </DialogTitle>
          </DialogHeader>
          <UnitForm
            unit={selectedUnit}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setSelectedUnit(null);
            }}
            loading={saving}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الوحدة "{unitToDelete?.title}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}