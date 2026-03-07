import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase';   // adjust path to your firebase.js
import React, { useState, useEffect, useRef } from 'react';
import { createEntity } from "../api/entityFactory";
import { Link } from 'react-router-dom';
import {
  FileDown,
  Plus,
  Search,
  Download,
  Trash2,
  MoreVertical,
  FileText,
  Upload,
  Loader2,
  Home,
  Building2,
  Briefcase,
  Car,
  File,
  Eye,
  Printer,
  X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import ContractTemplatePreview from '@/components/templates/ContractTemplatePreview';

export default function ContractTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    template_type: 'عام',
    description: '',
    file_url: '',
  });
  const [uploading, setUploading] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await createEntity("contractTemplate").list('-created_date');
    setTemplates(data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await createEntity("contractTemplate").create(formData);
    setSaving(false);
    setShowForm(false);
    setFormData({ title: '', template_type: 'عام', description: '', file_url: '' });
    loadData();
  };

  const handleDelete = async () => {
    if (templateToDelete) {
      await createEntity("contractTemplate").delete(templateToDelete.id);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
      loadData();
    }
  };

  const handleDownload = async (template) => {
    // Increment download count
    await createEntity("contractTemplate").update(template.id, {
      downloads_count: (template.downloads_count || 0) + 1
    });
    
    // Open file in new tab if exists, otherwise print template
    if (template.file_url) {
      window.open(template.file_url, '_blank');
    } else {
      handlePrintTemplate(template);
    }
    loadData();
  };

  const handlePrintTemplate = (template) => {
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${template.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
          * { font-family: 'Cairo', sans-serif; box-sizing: border-box; }
          @page { size: A4; margin: 20mm; }
          body { padding: 0; margin: 0; direction: rtl; font-size: 14px; line-height: 1.8; }
          .container { max-width: 210mm; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1e3a5f; padding-bottom: 20px; }
          .header h1 { color: #1e3a5f; margin: 0; font-size: 28px; }
          .header h2 { color: #64748b; margin-top: 10px; font-size: 16px; font-weight: normal; }
          .section { background: #f8fafc; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px; }
          .section h3 { color: #1e3a5f; margin: 0 0 15px 0; font-size: 16px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; }
          .grid p { margin: 5px 0; }
          .terms { margin-bottom: 30px; }
          .terms h3 { color: #1e3a5f; margin-bottom: 15px; }
          .term { padding-right: 20px; margin-bottom: 12px; }
          .term-title { font-weight: bold; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 60px; padding-top: 30px; border-top: 2px solid #e2e8f0; }
          .signature { text-align: center; }
          .signature p { margin: 5px 0; }
          .signature .name { margin-bottom: 50px; }
          .signature .line { border-top: 1px solid #64748b; padding-top: 10px; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
          .blank { border-bottom: 1px dotted #64748b; display: inline-block; min-width: 150px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>عقد إيجار</h1>
            <h2>وفقاً لأحكام القانون المدني المصري</h2>
            <p style="color: #94a3b8; margin-top: 10px;">${template.title}</p>
          </div>

          <p style="margin-bottom: 20px;">
            إنه في يوم <span class="blank"></span> الموافق <span class="blank"></span>
          </p>
          <p style="margin-bottom: 20px;">تحرر هذا العقد بين كل من:</p>

          <div class="section">
            <h3>الطرف الأول (المؤجر):</h3>
            <div class="grid">
              <p><strong>الاسم:</strong> <span class="blank"></span></p>
              <p><strong>الرقم القومي:</strong> <span class="blank"></span></p>
              <p><strong>رقم الهاتف:</strong> <span class="blank"></span></p>
              <p><strong>العنوان:</strong> <span class="blank"></span></p>
            </div>
          </div>

          <div class="section">
            <h3>الطرف الثاني (المستأجر):</h3>
            <div class="grid">
              <p><strong>الاسم:</strong> <span class="blank"></span></p>
              <p><strong>الرقم القومي:</strong> <span class="blank"></span></p>
              <p><strong>رقم الهاتف:</strong> <span class="blank"></span></p>
              <p><strong>العنوان:</strong> <span class="blank"></span></p>
              <p><strong>الوظيفة:</strong> <span class="blank"></span></p>
              <p><strong>جهة العمل:</strong> <span class="blank"></span></p>
            </div>
          </div>

          <div class="section">
            <h3>العين المؤجرة:</h3>
            <div class="grid">
              <p><strong>نوع الوحدة:</strong> ${template.template_type}</p>
              <p><strong>الوصف:</strong> <span class="blank"></span></p>
              <p><strong>العنوان:</strong> <span class="blank" style="min-width: 300px;"></span></p>
              <p><strong>المساحة:</strong> <span class="blank"></span> م²</p>
            </div>
          </div>

          <div class="terms">
            <h3>بنود العقد:</h3>
            <div class="term">
              <span class="term-title">البند الأول:</span> أجر الطرف الأول للطرف الثاني العين المبينة أعلاه وذلك لاستعمالها في غرض <span class="blank"></span>.
            </div>
            <div class="term">
              <span class="term-title">البند الثاني:</span> مدة هذا العقد تبدأ من <span class="blank"></span> وتنتهي في <span class="blank"></span>.
            </div>
            <div class="term">
              <span class="term-title">البند الثالث:</span> القيمة الإيجارية الشهرية مبلغ (<span class="blank"></span> جنيه) فقط <span class="blank" style="min-width: 200px;"></span> لا غير، تدفع مقدماً في اليوم <span class="blank" style="min-width: 30px;"></span> من كل شهر.
            </div>
            <div class="term">
              <span class="term-title">البند الرابع:</span> دفع الطرف الثاني للطرف الأول مبلغ (<span class="blank"></span> جنيه) كتأمين يُرد عند انتهاء العقد وتسليم العين المؤجرة بحالتها.
            </div>
            <div class="term">
              <span class="term-title">البند الخامس:</span> يلتزم الطرف الثاني بالمحافظة على العين المؤجرة وردها بالحالة التي تسلمها بها، وعدم إجراء أي تعديلات بها دون موافقة كتابية من الطرف الأول.
            </div>
            <div class="term">
              <span class="term-title">البند السادس:</span> لا يجوز للطرف الثاني التنازل عن هذا العقد أو من باطنه للغير بدون موافقة كتابية من الطرف الأول.
            </div>
            <div class="term">
              <span class="term-title">البند السابع:</span> يلتزم الطرف الثاني بسداد فواتير المرافق (كهرباء - مياه - غاز) خلال فترة الإيجار.
            </div>
            <div class="term">
              <span class="term-title">البند الثامن:</span> في حالة رغبة أي من الطرفين في عدم تجديد العقد، يجب إخطار الطرف الآخر قبل انتهاء مدة العقد بشهرين على الأقل.
            </div>
            <div class="term">
              <span class="term-title">البند التاسع:</span> يختص القضاء المصري بالفصل في أي نزاع ينشأ عن تنفيذ هذا العقد.
            </div>
            <div class="term">
              <span class="term-title">شروط خاصة:</span> <span class="blank" style="min-width: 400px;"></span>
            </div>
          </div>

          <div class="signatures">
            <div class="signature">
              <p><strong>الطرف الأول (المؤجر)</strong></p>
              <p class="name"><span class="blank"></span></p>
              <p class="line">التوقيع</p>
            </div>
            <div class="signature">
              <p><strong>الطرف الثاني (المستأجر)</strong></p>
              <p class="name"><span class="blank"></span></p>
              <p class="line">التوقيع</p>
            </div>
          </div>

          <div class="footer">
            <p>تم تحرير هذا العقد من نسختين، نسخة لكل طرف للعمل بموجبها عند اللزوم</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fileRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const file_url = await getDownloadURL(fileRef);
    setFormData(prev => ({ ...prev, file_url }));
    setUploading(false);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'شقة': return Home;
      case 'فيلا': return Building2;
      case 'وحدة إدارية': return Briefcase;
      case 'سيارة': return Car;
      default: return File;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'شقة': return 'from-blue-500 to-blue-600';
      case 'فيلا': return 'from-purple-500 to-purple-600';
      case 'وحدة إدارية': return 'from-amber-500 to-amber-600';
      case 'سيارة': return 'from-emerald-500 to-emerald-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-96 rounded-xl" />
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
            <FileDown className="h-8 w-8 text-[#1e3a5f]" />
            نماذج العقود
          </h1>
          <p className="text-slate-500 mt-1">تحميل وطباعة نماذج عقود الإيجار المصرية</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a]"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة نموذج
        </Button>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="بحث في النماذج..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <FileDown className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              {searchTerm ? 'لا توجد نتائج' : 'لا توجد نماذج بعد'}
            </h3>
            <p className="text-slate-500 mb-4">
              {searchTerm ? 'جرب البحث بكلمات أخرى' : 'ابدأ بإضافة نموذج عقد جديد'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a]"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة نموذج
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const Icon = getTypeIcon(template.template_type);
            return (
              <Card key={template.id} className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                {/* Contract Preview */}
                <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 p-4 h-64 overflow-hidden">
                  <div className="transform scale-100 origin-top">
                    <ContractTemplatePreview template={template} mini={true} />
                  </div>
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowPreview(true);
                      }}
                      className="bg-white hover:bg-white/90"
                    >
                      <Eye className="h-4 w-4 ml-1" />
                      معاينة
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handlePrintTemplate(template)}
                      className="bg-[#1e3a5f] hover:bg-[#2d5a8a]"
                    >
                      <Printer className="h-4 w-4 ml-1" />
                      طباعة
                    </Button>
                  </div>

                  {/* Type Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className={`bg-gradient-to-r ${getTypeColor(template.template_type)} text-white border-0`}>
                      <Icon className="h-3 w-3 ml-1" />
                      {template.template_type}
                    </Badge>
                  </div>

                  {/* Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-3 left-3 h-8 w-8 bg-white/80 hover:bg-white"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => {
                        setSelectedTemplate(template);
                        setShowPreview(true);
                      }}>
                        <Eye className="h-4 w-4 ml-2" />
                        معاينة
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePrintTemplate(template)}>
                        <Printer className="h-4 w-4 ml-2" />
                        طباعة PDF
                      </DropdownMenuItem>
                      {template.file_url && (
                        <DropdownMenuItem onClick={() => window.open(template.file_url, '_blank')}>
                          <Download className="h-4 w-4 ml-2" />
                          تحميل الملف
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setTemplateToDelete(template);
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
                  <h3 className="font-semibold text-slate-800 text-lg mb-2">{template.title}</h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                    {template.description || 'نموذج عقد إيجار وفقاً للقانون المصري'}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-400">
                      {template.downloads_count || 0} تحميل
                    </span>
                    {template.file_url && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                        <FileText className="h-3 w-3 ml-1" />
                        ملف مرفق
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a]"
                      onClick={() => handlePrintTemplate(template)}
                    >
                      <Printer className="h-4 w-4 ml-2" />
                      طباعة PDF
                    </Button>
                    {template.file_url && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(template.file_url, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center justify-between">
              <span>معاينة النموذج: {selectedTemplate?.title}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handlePrintTemplate(selectedTemplate)}
                  className="bg-[#1e3a5f]"
                >
                  <Printer className="h-4 w-4 ml-2" />
                  طباعة PDF
                </Button>
                {selectedTemplate?.file_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(selectedTemplate.file_url, '_blank')}
                  >
                    <Download className="h-4 w-4 ml-2" />
                    تحميل الملف
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          <div ref={printRef}>
            <ContractTemplatePreview template={selectedTemplate} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">إضافة نموذج عقد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان النموذج *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="مثال: عقد إيجار شقة سكنية"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template_type">نوع النموذج</Label>
              <Select
                value={formData.template_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, template_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="عام">عام</SelectItem>
                  <SelectItem value="شقة">شقة</SelectItem>
                  <SelectItem value="فيلا">فيلا</SelectItem>
                  <SelectItem value="وحدة إدارية">وحدة إدارية</SelectItem>
                  <SelectItem value="سيارة">سيارة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">وصف النموذج</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="أدخل وصف موجز للنموذج"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>ملف إضافي (اختياري)</Label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                {formData.file_url ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-emerald-500" />
                    <span className="text-sm text-slate-600">تم رفع الملف بنجاح</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setFormData(prev => ({ ...prev, file_url: '' }))}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ) : uploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]" />
                    <span className="text-sm text-slate-600">جاري الرفع...</span>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-600">اضغط لرفع ملف (اختياري)</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-slate-500">
                * سيتم إنشاء نموذج العقد تلقائياً بصيغة قابلة للطباعة
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                إلغاء
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !formData.title}
                className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a]"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 ml-2" />
                )}
                إضافة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف النموذج "{templateToDelete?.title}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.
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