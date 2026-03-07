import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, X } from 'lucide-react';

export default function ContractForm({ contract, onSave, onCancel, loading }) {
  const [formData, setFormData] = useState(contract || {
    contract_number: '',
    owner_id: '',
    tenant_id: '',
    unit_id: '',
    start_date: '',
    end_date: '',
    monthly_rent: '',
    payment_day: 1,
    deposit: '',
    contract_purpose: 'سكني',
    payment_method: 'نقدي',
    special_terms: '',
    status: 'ساري',
  });
  const [owners, setOwners] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.owner_id) {
      const ownerUnits = units.filter(u => u.owner_id === formData.owner_id);
      setFilteredUnits(ownerUnits);
    } else {
      setFilteredUnits([]);
    }
  }, [formData.owner_id, units]);

  const loadData = async () => {
    const [ownersData, tenantsData, unitsData] = await Promise.all([
      base44.entities.Owner.list(),
      base44.entities.Tenant.list(),
      base44.entities.Unit.list(),
    ]);
    setOwners(ownersData);
    setTenants(tenantsData);
    setUnits(unitsData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Generate contract number if not provided
    const data = {
      ...formData,
      contract_number: formData.contract_number || `C-${Date.now().toString(36).toUpperCase()}`,
    };
    onSave(data);
  };

  const selectedUnit = units.find(u => u.id === formData.unit_id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="contract_number">رقم العقد</Label>
          <Input
            id="contract_number"
            value={formData.contract_number}
            onChange={(e) => handleChange('contract_number', e.target.value)}
            placeholder="سيتم إنشاءه تلقائياً"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">حالة العقد</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ساري">ساري</SelectItem>
              <SelectItem value="منتهي">منتهي</SelectItem>
              <SelectItem value="ملغي">ملغي</SelectItem>
              <SelectItem value="معلق">معلق</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner_id">المالك (المؤجر) *</Label>
          <Select
            value={formData.owner_id}
            onValueChange={(value) => {
              handleChange('owner_id', value);
              handleChange('unit_id', '');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المالك" />
            </SelectTrigger>
            <SelectContent>
              {owners.map(owner => (
                <SelectItem key={owner.id} value={owner.id}>
                  {owner.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit_id">الوحدة *</Label>
          <Select
            value={formData.unit_id}
            onValueChange={(value) => {
              handleChange('unit_id', value);
              const unit = units.find(u => u.id === value);
              if (unit?.monthly_rent) {
                handleChange('monthly_rent', unit.monthly_rent);
              }
            }}
            disabled={!formData.owner_id}
          >
            <SelectTrigger>
              <SelectValue placeholder={formData.owner_id ? 'اختر الوحدة' : 'اختر المالك أولاً'} />
            </SelectTrigger>
            <SelectContent>
              {filteredUnits.map(unit => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.title} - {unit.unit_type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tenant_id">المستأجر *</Label>
          <Select
            value={formData.tenant_id}
            onValueChange={(value) => handleChange('tenant_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المستأجر" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map(tenant => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contract_purpose">غرض الإيجار</Label>
          <Select
            value={formData.contract_purpose}
            onValueChange={(value) => handleChange('contract_purpose', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الغرض" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="سكني">سكني</SelectItem>
              <SelectItem value="تجاري">تجاري</SelectItem>
              <SelectItem value="إداري">إداري</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_date">تاريخ البداية *</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">تاريخ النهاية *</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => handleChange('end_date', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthly_rent">الإيجار الشهري (جنيه) *</Label>
          <Input
            id="monthly_rent"
            type="number"
            value={formData.monthly_rent}
            onChange={(e) => handleChange('monthly_rent', parseFloat(e.target.value))}
            placeholder="الإيجار الشهري"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_day">يوم السداد الشهري</Label>
          <Input
            id="payment_day"
            type="number"
            min="1"
            max="28"
            value={formData.payment_day}
            onChange={(e) => handleChange('payment_day', parseInt(e.target.value))}
            placeholder="يوم السداد (1-28)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deposit">مبلغ التأمين (جنيه)</Label>
          <Input
            id="deposit"
            type="number"
            value={formData.deposit}
            onChange={(e) => handleChange('deposit', parseFloat(e.target.value))}
            placeholder="مبلغ التأمين"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_method">طريقة الدفع</Label>
          <Select
            value={formData.payment_method}
            onValueChange={(value) => handleChange('payment_method', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر طريقة الدفع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="نقدي">نقدي</SelectItem>
              <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
              <SelectItem value="شيك">شيك</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="special_terms">شروط خاصة</Label>
          <Textarea
            id="special_terms"
            value={formData.special_terms}
            onChange={(e) => handleChange('special_terms', e.target.value)}
            placeholder="أدخل أي شروط خاصة للعقد"
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 ml-2" />
          إلغاء
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a]"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 ml-2" />
          )}
          {contract ? 'تحديث العقد' : 'إنشاء العقد'}
        </Button>
      </div>
    </form>
  );
}