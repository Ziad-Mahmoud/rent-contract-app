import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, X } from 'lucide-react';

export default function TenantForm({ tenant, onSave, onCancel, loading }) {
  const [formData, setFormData] = useState(tenant || {
    full_name: '',
    national_id: '',
    phone: '',
    email: '',
    address: '',
    job: '',
    workplace: '',
    emergency_contact: '',
    notes: '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="full_name">الاسم الكامل *</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            placeholder="أدخل الاسم الكامل"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="national_id">الرقم القومي *</Label>
          <Input
            id="national_id"
            value={formData.national_id}
            onChange={(e) => handleChange('national_id', e.target.value)}
            placeholder="أدخل الرقم القومي"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="أدخل رقم الهاتف"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="أدخل البريد الإلكتروني"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">العنوان الحالي</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="أدخل العنوان الحالي"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="job">الوظيفة</Label>
          <Input
            id="job"
            value={formData.job}
            onChange={(e) => handleChange('job', e.target.value)}
            placeholder="أدخل الوظيفة"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workplace">جهة العمل</Label>
          <Input
            id="workplace"
            value={formData.workplace}
            onChange={(e) => handleChange('workplace', e.target.value)}
            placeholder="أدخل جهة العمل"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="emergency_contact">رقم طوارئ</Label>
          <Input
            id="emergency_contact"
            value={formData.emergency_contact}
            onChange={(e) => handleChange('emergency_contact', e.target.value)}
            placeholder="رقم للتواصل في حالات الطوارئ"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">ملاحظات</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="أدخل أي ملاحظات إضافية"
            rows={3}
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
          {tenant ? 'تحديث' : 'حفظ'}
        </Button>
      </div>
    </form>
  );
}