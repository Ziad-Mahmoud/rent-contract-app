import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import TenantForm from '@/components/forms/TenantForm';

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState(null);

  useEffect(() => {
    loadData();
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('new') === 'true') {
      setShowForm(true);
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [tenantsData, contractsData] = await Promise.all([
      base44.entities.Tenant.list('-created_date'),
      base44.entities.Contract.list(),
    ]);
    setTenants(tenantsData);
    setContracts(contractsData);
    setLoading(false);
  };

  const handleSave = async (data) => {
    setSaving(true);
    if (selectedTenant) {
      await base44.entities.Tenant.update(selectedTenant.id, data);
    } else {
      await base44.entities.Tenant.create(data);
    }
    setSaving(false);
    setShowForm(false);
    setSelectedTenant(null);
    loadData();
  };

  const handleDelete = async () => {
    if (tenantToDelete) {
      await base44.entities.Tenant.delete(tenantToDelete.id);
      setDeleteDialogOpen(false);
      setTenantToDelete(null);
      loadData();
    }
  };

  const getActiveContract = (tenantId) => {
    return contracts.find(c => c.tenant_id === tenantId && c.status === 'ساري');
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.phone?.includes(searchTerm) ||
    tenant.national_id?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-56 rounded-xl" />
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
            <UserCheck className="h-8 w-8 text-[#1e3a5f]" />
            المستأجرين
          </h1>
          <p className="text-slate-500 mt-1">إدارة بيانات المستأجرين</p>
        </div>
        <Button
          onClick={() => {
            setSelectedTenant(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a]"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة مستأجر جديد
        </Button>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="بحث بالاسم أو رقم الهاتف أو الرقم القومي..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tenants Grid */}
      {filteredTenants.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <UserCheck className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              {searchTerm ? 'لا توجد نتائج' : 'لا يوجد مستأجرين بعد'}
            </h3>
            <p className="text-slate-500 mb-4">
              {searchTerm ? 'جرب البحث بكلمات أخرى' : 'ابدأ بإضافة مستأجر جديد'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a]"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة مستأجر
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((tenant) => {
            const activeContract = getActiveContract(tenant.id);
            return (
              <Card key={tenant.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-lg font-bold">
                        {tenant.full_name?.[0] || '؟'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{tenant.full_name}</h3>
                        <p className="text-sm text-slate-500">{tenant.national_id}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => {
                          setSelectedTenant(tenant);
                          setShowForm(true);
                        }}>
                          <Edit className="h-4 w-4 ml-2" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setTenantToDelete(tenant);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 text-sm">
                    {tenant.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="h-4 w-4" />
                        <span dir="ltr">{tenant.phone}</span>
                      </div>
                    )}
                    {tenant.email && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="h-4 w-4" />
                        <span>{tenant.email}</span>
                      </div>
                    )}
                    {tenant.job && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Briefcase className="h-4 w-4" />
                        <span>{tenant.job} - {tenant.workplace}</span>
                      </div>
                    )}
                    {tenant.address && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{tenant.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    {activeContract ? (
                      <Badge className="bg-emerald-100 text-emerald-700">
                        عقد ساري
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-500">
                        لا يوجد عقد ساري
                      </Badge>
                    )}
                    <span className="text-xs text-slate-400">
                      {format(new Date(tenant.created_date), 'dd MMM yyyy', { locale: ar })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedTenant ? 'تعديل بيانات المستأجر' : 'إضافة مستأجر جديد'}
            </DialogTitle>
          </DialogHeader>
          <TenantForm
            tenant={selectedTenant}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setSelectedTenant(null);
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
              سيتم حذف بيانات المستأجر "{tenantToDelete?.full_name}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.
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