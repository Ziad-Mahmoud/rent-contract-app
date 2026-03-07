import React from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function ContractTemplatePreview({ template, mini = false }) {
  if (mini) {
    return (
      <div className="bg-white border-2 border-slate-200 rounded-lg p-4 text-[8px] leading-tight h-full overflow-hidden relative">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <span className="text-6xl font-bold text-slate-900 rotate-[-30deg]">نموذج</span>
        </div>
        
        {/* Header */}
        <div className="text-center border-b border-slate-300 pb-2 mb-2">
          <h1 className="font-bold text-[10px]">عقد إيجار</h1>
          <p className="text-slate-500 text-[6px]">{template?.template_type || 'عام'}</p>
        </div>

        {/* Fake content lines */}
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <span className="font-bold">الطرف الأول:</span>
            <div className="flex-1 border-b border-dotted border-slate-300"></div>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">الطرف الثاني:</span>
            <div className="flex-1 border-b border-dotted border-slate-300"></div>
          </div>
          <div className="h-1"></div>
          <div className="bg-slate-50 p-1 rounded text-[6px]">
            <p className="font-bold mb-0.5">البند الأول:</p>
            <div className="h-1 bg-slate-200 rounded w-full mb-0.5"></div>
            <div className="h-1 bg-slate-200 rounded w-3/4"></div>
          </div>
          <div className="bg-slate-50 p-1 rounded text-[6px]">
            <p className="font-bold mb-0.5">البند الثاني:</p>
            <div className="h-1 bg-slate-200 rounded w-full mb-0.5"></div>
            <div className="h-1 bg-slate-200 rounded w-5/6"></div>
          </div>
          <div className="bg-slate-50 p-1 rounded text-[6px]">
            <p className="font-bold mb-0.5">البند الثالث:</p>
            <div className="h-1 bg-slate-200 rounded w-full mb-0.5"></div>
            <div className="h-1 bg-slate-200 rounded w-2/3"></div>
          </div>
        </div>

        {/* Signature area */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex justify-between text-[6px] border-t border-slate-200 pt-1">
            <div className="text-center">
              <p>الطرف الأول</p>
              <div className="w-12 border-b border-slate-300 mt-2"></div>
            </div>
            <div className="text-center">
              <p>الطرف الثاني</p>
              <div className="w-12 border-b border-slate-300 mt-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-slate-200 rounded-lg p-8 text-sm leading-relaxed" dir="rtl">
      {/* Header */}
      <div className="text-center border-b-2 border-slate-800 pb-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">عقد إيجار</h1>
        <h2 className="text-lg text-slate-600">وفقاً لأحكام القانون المدني المصري</h2>
        <p className="text-slate-500 mt-2">{template?.title}</p>
      </div>

      {/* Introduction */}
      <div className="mb-6">
        <p className="mb-4">
          إنه في يوم ______________ الموافق ____/____/________ 
        </p>
        <p className="mb-2">تحرر هذا العقد بين كل من:</p>
      </div>

      {/* First Party */}
      <div className="bg-slate-50 p-4 rounded-lg mb-4">
        <h3 className="font-bold text-[#1e3a5f] mb-2">الطرف الأول (المؤجر):</h3>
        <div className="grid grid-cols-2 gap-4">
          <p><span className="font-medium">الاسم:</span> _______________</p>
          <p><span className="font-medium">الرقم القومي:</span> _______________</p>
          <p><span className="font-medium">رقم الهاتف:</span> _______________</p>
          <p><span className="font-medium">العنوان:</span> _______________</p>
        </div>
      </div>

      {/* Second Party */}
      <div className="bg-slate-50 p-4 rounded-lg mb-6">
        <h3 className="font-bold text-[#1e3a5f] mb-2">الطرف الثاني (المستأجر):</h3>
        <div className="grid grid-cols-2 gap-4">
          <p><span className="font-medium">الاسم:</span> _______________</p>
          <p><span className="font-medium">الرقم القومي:</span> _______________</p>
          <p><span className="font-medium">رقم الهاتف:</span> _______________</p>
          <p><span className="font-medium">العنوان:</span> _______________</p>
        </div>
      </div>

      {/* Property */}
      <div className="bg-slate-50 p-4 rounded-lg mb-6">
        <h3 className="font-bold text-[#1e3a5f] mb-2">العين المؤجرة:</h3>
        <div className="grid grid-cols-2 gap-4">
          <p><span className="font-medium">نوع الوحدة:</span> {template?.template_type || '_______________'}</p>
          <p><span className="font-medium">العنوان:</span> _______________</p>
          <p><span className="font-medium">المساحة:</span> _______________ م²</p>
          <p><span className="font-medium">الوصف:</span> _______________</p>
        </div>
      </div>

      {/* Terms */}
      <div className="mb-6">
        <h3 className="font-bold text-[#1e3a5f] mb-3">بنود العقد:</h3>
        <div className="space-y-3">
          <p className="pr-4">
            <span className="font-bold">البند الأول:</span> أجر الطرف الأول للطرف الثاني العين المبينة أعلاه وذلك لاستعمالها في غرض _______________.
          </p>
          <p className="pr-4">
            <span className="font-bold">البند الثاني:</span> مدة هذا العقد تبدأ من ____/____/________ وتنتهي في ____/____/________.
          </p>
          <p className="pr-4">
            <span className="font-bold">البند الثالث:</span> القيمة الإيجارية الشهرية مبلغ (_______________ جنيه) تدفع مقدماً في اليوم ___ من كل شهر.
          </p>
          <p className="pr-4">
            <span className="font-bold">البند الرابع:</span> دفع الطرف الثاني للطرف الأول مبلغ (_______________ جنيه) كتأمين يُرد عند انتهاء العقد.
          </p>
          <p className="pr-4">
            <span className="font-bold">البند الخامس:</span> يلتزم الطرف الثاني بالمحافظة على العين المؤجرة وردها بالحالة التي تسلمها بها.
          </p>
          <p className="pr-4">
            <span className="font-bold">البند السادس:</span> لا يجوز للطرف الثاني التنازل عن هذا العقد أو من باطنه للغير بدون موافقة كتابية.
          </p>
          <p className="pr-4">
            <span className="font-bold">البند السابع:</span> يلتزم الطرف الثاني بسداد فواتير المرافق (كهرباء - مياه - غاز) خلال فترة الإيجار.
          </p>
        </div>
      </div>

      {/* Signatures */}
      <div className="mt-12 pt-8 border-t-2">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <p className="font-bold mb-4">الطرف الأول (المؤجر)</p>
            <p className="mb-8">_______________</p>
            <p className="border-t border-slate-400 pt-2">التوقيع</p>
          </div>
          <div className="text-center">
            <p className="font-bold mb-4">الطرف الثاني (المستأجر)</p>
            <p className="mb-8">_______________</p>
            <p className="border-t border-slate-400 pt-2">التوقيع</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 mt-8 pt-4 border-t">
        <p>تم تحرير هذا العقد من نسختين، نسخة لكل طرف للعمل بموجبها عند اللزوم</p>
      </div>
    </div>
  );
}