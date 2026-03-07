import React, { useState, useEffect } from 'react';
import { createEntity } from "../api/entityFactory";
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  MoreVertical,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import OwnerForm from '@/components/forms/OwnerForm';

export default function Owners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    loadData();
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('new') === 'true') {
      setShowForm(true);
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [ownersData, unitsData] = await Promise.all([
      createEntity("owner").list('-created_date'),
      createEntity("unit").list(),
    ]);
    setOwners(ownersData);
    setUnits(unitsData);
    setLoading(false);
  };

  const handleSave = async (data) => {
    setSaving(true);
    if (selectedOwner) {
      await createEntity("owner").update(selectedOwner.id, data);
    } else {
      await createEntity("owner").create(data);
    }
    setSaving(false);
    setShowForm(false);
    setSelectedOwner(null);
    loadData();
  };

  const handleDelete = async () => {
    if (ownerToDelete) {
      await createEntity("owner").delete(ownerToDelete.id);
      setDeleteDialogOpen(false);
      setOwnerToDelete(null);
      loadData();
    }
  };

  const getOwnerUnitsCount = (ownerId) => {
    return units.filter(u => u.owner_id === ownerId).length;
  };

  const filteredOwners = owners.filter(owner =>
    owner.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.phone?.includes(searchTerm) ||
    owner.national_id?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48 rounded-xl" />
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
            <Users className="h-8 w-8 text-[#1e3a5f]" />
            الملاك
          </h1>
          <p className="text-slate-500 mt-1">إدارة بيانات الملاك</p>
        </div>
        <Button
          onClick={() => {
            setSelectedOwner(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a]"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة مالك جديد
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

      {/* Owners Grid */}
      {filteredOwners.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              {searchTerm ? 'لا توجد نتائج' : 'لا يوجد ملاك بعد'}
            </h3>
            <p className="text-slate-500 mb-4">
              {searchTerm ? 'جرب البحث بكلمات أخرى' : 'ابدأ بإضافة مالك جديد'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a]"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة مالك
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOwners.map((owner) => (
            <Card key={owner.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8a] flex items-center justify-center text-white text-lg font-bold">
                      {owner.full_name?.[0] || '؟'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{owner.full_name}</h3>
                      <p className="text-sm text-slate-500">{owner.national_id}</p>
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
                        setSelectedOwner(owner);
                        setShowForm(true);
                      }}>
                        <Edit className="h-4 w-4 ml-2" />
                        تعديل
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setOwnerToDelete(owner);
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
                  {owner.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="h-4 w-4" />
                      <span dir="ltr">{owner.phone}</span>
                    </div>
                  )}
                  {owner.email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-4 w-4" />
                      <span>{owner.email}</span>
                    </div>
                  )}
                  {owner.address && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{owner.address}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <Badge variant="outline" className="bg-[#1e3a5f]/5 text-[#1e3a5f] border-[#1e3a5f]/20">
                    {getOwnerUnitsCount(owner.id)} وحدات
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {format(new Date(owner.created_date), 'dd MMM yyyy', { locale: ar })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedOwner ? 'تعديل بيانات المالك' : 'إضافة مالك جديد'}
            </DialogTitle>
          </DialogHeader>
          <OwnerForm
            owner={selectedOwner}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setSelectedOwner(null);
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
              سيتم حذف بيانات المالك "{ownerToDelete?.full_name}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.
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