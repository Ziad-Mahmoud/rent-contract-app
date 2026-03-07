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
import { Loader2, Save, X, Upload, Image } from 'lucide-react';

export default function UnitForm({ unit, onSave, onCancel, loading }) {
  const [formData, setFormData] = useState(unit || {
    owner_id: '',
    unit_type: '',
    title: '',
    address: '',
    area: '',
    rooms: '',
    bathrooms: '',
    floor: '',
    car_model: '',
    car_year: '',
    car_plate: '',
    monthly_rent: '',
    status: 'متاحة',
    description: '',
    images: [],
  });
  const [owners, setOwners] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    const data = await base44.entities.Owner.list();
    setOwners(data);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), file_url]
    }));
    setUploading(false);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const isCar = formData.unit_type === 'سيارة';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="owner_id">المالك *</Label>
          <Select
            value={formData.owner_id}
            onValueChange={(value) => handleChange('owner_id', value)}
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
          <Label htmlFor="unit_type">نوع الوحدة *</Label>
          <Select
            value={formData.unit_type}
            onValueChange={(value) => handleChange('unit_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع الوحدة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="شقة">شقة</SelectItem>
              <SelectItem value="فيلا">فيلا</SelectItem>
              <SelectItem value="وحدة إدارية">وحدة إدارية</SelectItem>
              <SelectItem value="سيارة">سيارة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">اسم/عنوان الوحدة *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder={isCar ? 'مثال: تويوتا كورولا 2022' : 'مثال: شقة المعادي'}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">الحالة</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="متاحة">متاحة</SelectItem>
              <SelectItem value="مؤجرة">مؤجرة</SelectItem>
              <SelectItem value="صيانة">صيانة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!isCar ? (
          <>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">العنوان التفصيلي</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="أدخل العنوان التفصيلي"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">المساحة (م²)</Label>
              <Input
                id="area"
                type="number"
                value={formData.area}
                onChange={(e) => handleChange('area', e.target.value)}
                placeholder="المساحة"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor">الطابق</Label>
              <Input
                id="floor"
                value={formData.floor}
                onChange={(e) => handleChange('floor', e.target.value)}
                placeholder="مثال: الثالث"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rooms">عدد الغرف</Label>
              <Input
                id="rooms"
                type="number"
                value={formData.rooms}
                onChange={(e) => handleChange('rooms', e.target.value)}
                placeholder="عدد الغرف"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">عدد الحمامات</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => handleChange('bathrooms', e.target.value)}
                placeholder="عدد الحمامات"
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="car_model">موديل السيارة</Label>
              <Input
                id="car_model"
                value={formData.car_model}
                onChange={(e) => handleChange('car_model', e.target.value)}
                placeholder="مثال: تويوتا كورولا"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="car_year">سنة الصنع</Label>
              <Input
                id="car_year"
                value={formData.car_year}
                onChange={(e) => handleChange('car_year', e.target.value)}
                placeholder="مثال: 2022"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="car_plate">رقم اللوحة</Label>
              <Input
                id="car_plate"
                value={formData.car_plate}
                onChange={(e) => handleChange('car_plate', e.target.value)}
                placeholder="مثال: أ ب ج 1234"
              />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="monthly_rent">الإيجار الشهري (جنيه)</Label>
          <Input
            id="monthly_rent"
            type="number"
            value={formData.monthly_rent}
            onChange={(e) => handleChange('monthly_rent', e.target.value)}
            placeholder="الإيجار الشهري"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">وصف الوحدة</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="أدخل وصف تفصيلي للوحدة"
            rows={3}
          />
        </div>

        {/* Images */}
        <div className="space-y-2 md:col-span-2">
          <Label>صور الوحدة</Label>
          <div className="flex flex-wrap gap-3">
            {formData.images?.map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={img}
                  alt={`صورة ${idx + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <label className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5 transition-colors">
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              ) : (
                <>
                  <Upload className="h-6 w-6 text-slate-400" />
                  <span className="text-xs text-slate-400 mt-1">إضافة صورة</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
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
          {unit ? 'تحديث' : 'حفظ'}
        </Button>
      </div>
    </form>
  );
}