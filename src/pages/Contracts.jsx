import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Printer,
  Download
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
import ContractForm from '@/components/forms/ContractForm';
import ContractPreview from '@/components/contract/ContractPreview';

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [owners, setOwners] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    loadData();
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('new') === 'true') {
      setShowForm(true);
    }
    if (urlParams.get('id')) {
      // Will load and show contract details
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [contractsData, ownersData, tenantsData, unitsData] = await Promise.all([
      base44.entities.Contract.list('-created_date'),
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

  const handleSave = async (data) => {
    setSaving(true);
    if (selectedContract) {
      await base44.entities.Contract.update(selectedContract.id, data);
    } else {
      await base44.entities.Contract.create(data);
      // Update unit status to rented
      if (data.unit_id && data.status === 'ساري') {
        await base44.entities.Unit.update(data.unit_id, { status: 'مؤجرة' });
      }
    }
    setSaving(false);
    setShowForm(false);
    setSelectedContract(null);
    loadData();
  };

  const handleDelete = async () => {
    if (contractToDelete) {
      await base44.entities.Contract.delete(contractToDelete.id);
      setDeleteDialogOpen(false);
      setContractToDelete(null);
      loadData();
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>عقد إيجار</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; direction: rtl; }');
    printWindow.document.write('@page { size: A4; margin: 20mm; }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  const getOwnerName = (id) => owners.find(o => o.id === id)?.full_name || 'غير محدد';
  const getTenantName = (id) => tenants.find(t => t.id === id)?.full_name || 'غير محدد';
  const getUnitTitle = (id) => units.find(u => u.id === id)?.title || 'غير محدد';
  const getOwner = (id) => owners.find(o => o.id === id);
  const getTenant = (id) => tenants.find(t => t.id === id);
  const getUnit = (id) => units.find(u => u.id === id);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ساري': return 'bg-emerald-100 text-emerald-700';
      case 'منتهي': return 'bg-slate-100 text-slate-700';
      case 'ملغي': return 'bg-red-100 text-red-700';
      case 'معلق': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const ownerName = getOwnerName(contract.owner_id).toLowerCase();
    const tenantName = getTenantName(contract.tenant_id).toLowerCase();
    const unitTitle = getUnitTitle(contract.unit_id).toLowerCase();
    const matchesSearch = ownerName.includes(searchTerm.toLowerCase()) ||
      tenantName.includes(searchTerm.toLowerCase()) ||
      unitTitle.includes(searchTerm.toLowerCase()) ||
      contract.contract_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
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
            <FileText className="h-8 w-8 text-[#1e3a5f]" />
            العقود
          </h1>
          <p className="text-slate-500 mt-1">إدارة عقود الإيجار</p>
        </div>
        <Button
          onClick={() => {
            setSelectedContract(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a]"
        >
          <Plus className="h-4 w-4 ml-2" />
          إنشاء عقد جديد
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="بحث برقم العقد أو اسم المالك أو المستأجر..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="ساري">ساري</SelectItem>
                <SelectItem value="منتهي">منتهي</SelectItem>
                <SelectItem value="ملغي">ملغي</SelectItem>
                <SelectItem value="معلق">معلق</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'لا توجد نتائج' : 'لا توجد عقود بعد'}
            </h3>
            <p className="text-slate-500 mb-4">
              {searchTerm ? 'جرب البحث بكلمات أخرى' : 'ابدأ بإنشاء عقد جديد'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredContracts.map((contract) => (
            <Card key={contract.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-slate-800 text-lg">
                        عقد رقم {contract.contract_number || contract.id.slice(0, 8)}
                      </h3>
                      <Badge className={getStatusColor(contract.status)}>
                        {contract.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">المالك</p>
                        <p className="font-medium">{getOwnerName(contract.owner_id)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">المستأجر</p>
                        <p className="font-medium">{getTenantName(contract.tenant_id)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">الوحدة</p>
                        <p className="font-medium">{getUnitTitle(contract.unit_id)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(contract.start_date), 'dd/MM/yyyy')} - {format(new Date(contract.end_date), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{contract.monthly_rent?.toLocaleString()} جنيه/شهر</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedContract(contract);
                        setShowPreview(true);
                      }}
                    >
                      <Eye className="h-4 w-4 ml-1" />
                      معاينة
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => {
                          setSelectedContract(contract);
                          setShowForm(true);
                        }}>
                          <Edit className="h-4 w-4 ml-2" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setContractToDelete(contract);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedContract ? 'تعديل العقد' : 'إنشاء عقد جديد'}
            </DialogTitle>
          </DialogHeader>
          <ContractForm
            contract={selectedContract}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setSelectedContract(null);
            }}
            loading={saving}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center justify-between">
              <span>معاينة العقد</span>
              <Button onClick={handlePrint} className="bg-[#1e3a5f]">
                <Printer className="h-4 w-4 ml-2" />
                طباعة
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div ref={printRef}>
            <ContractPreview
              contract={selectedContract}
              owner={getOwner(selectedContract?.owner_id)}
              tenant={getTenant(selectedContract?.tenant_id)}
              unit={getUnit(selectedContract?.unit_id)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف العقد رقم "{contractToDelete?.contract_number}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.
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