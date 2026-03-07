import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const ContractPreview = forwardRef(({ contract, owner, tenant, unit }, ref) => {
  const numberToArabicWords = (num) => {
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
    const thousands = ['', 'ألف', 'ألفان', 'ثلاثة آلاف', 'أربعة آلاف', 'خمسة آلاف', 'ستة آلاف', 'سبعة آلاف', 'ثمانية آلاف', 'تسعة آلاف'];
    
    if (num === 0) return 'صفر';
    if (num >= 10000) return num.toLocaleString('ar-EG') + ' جنيه';
    
    let result = '';
    const th = Math.floor(num / 1000);
    const h = Math.floor((num % 1000) / 100);
    const t = Math.floor((num % 100) / 10);
    const o = num % 10;
    
    if (th > 0) result += thousands[th] + ' ';
    if (h > 0) result += (result ? 'و' : '') + hundreds[h] + ' ';
    if (t > 0 || o > 0) {
      if (t === 1) {
        result += (result ? 'و' : '') + ones[o] + (o > 0 ? ' عشر' : 'عشرة');
      } else {
        if (o > 0) result += (result ? 'و' : '') + ones[o] + ' ';
        if (t > 0) result += (result ? 'و' : '') + tens[t];
      }
    }
    
    return result.trim() + ' جنيهاً مصرياً';
  };

  return (
    <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto text-sm leading-relaxed" dir="rtl">
      <style>{`
        @media print {
          @page { size: A4; margin: 20mm; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-slate-800 pb-6">
        <h1 className="text-2xl font-bold mb-2">عقد إيجار</h1>
        <h2 className="text-lg text-slate-600">وفقاً لأحكام القانون المدني المصري</h2>
        <p className="text-slate-500 mt-2">رقم العقد: {contract?.contract_number}</p>
      </div>

      {/* Contract Body */}
      <div className="space-y-6">
        {/* Introduction */}
        <div>
          <p className="mb-4">
            إنه في يوم {contract?.start_date ? format(new Date(contract.start_date), 'EEEE', { locale: ar }) : '___'}{' '}
            الموافق {contract?.start_date ? format(new Date(contract.start_date), 'dd/MM/yyyy') : '___/___/____'} 
          </p>
          <p className="mb-2">تحرر هذا العقد بين كل من:</p>
        </div>

        {/* First Party - Owner */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="font-bold text-[#1e3a5f] mb-2">الطرف الأول (المؤجر):</h3>
          <div className="grid grid-cols-2 gap-4">
            <p><span className="font-medium">الاسم:</span> {owner?.full_name || '_______________'}</p>
            <p><span className="font-medium">الرقم القومي:</span> {owner?.national_id || '_______________'}</p>
            <p><span className="font-medium">رقم الهاتف:</span> {owner?.phone || '_______________'}</p>
            <p><span className="font-medium">العنوان:</span> {owner?.address || '_______________'}</p>
          </div>
        </div>

        {/* Second Party - Tenant */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="font-bold text-[#1e3a5f] mb-2">الطرف الثاني (المستأجر):</h3>
          <div className="grid grid-cols-2 gap-4">
            <p><span className="font-medium">الاسم:</span> {tenant?.full_name || '_______________'}</p>
            <p><span className="font-medium">الرقم القومي:</span> {tenant?.national_id || '_______________'}</p>
            <p><span className="font-medium">رقم الهاتف:</span> {tenant?.phone || '_______________'}</p>
            <p><span className="font-medium">العنوان:</span> {tenant?.address || '_______________'}</p>
            <p><span className="font-medium">الوظيفة:</span> {tenant?.job || '_______________'}</p>
            <p><span className="font-medium">جهة العمل:</span> {tenant?.workplace || '_______________'}</p>
          </div>
        </div>

        {/* Property Description */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="font-bold text-[#1e3a5f] mb-2">العين المؤجرة:</h3>
          <div className="grid grid-cols-2 gap-4">
            <p><span className="font-medium">نوع الوحدة:</span> {unit?.unit_type || '_______________'}</p>
            <p><span className="font-medium">الوصف:</span> {unit?.title || '_______________'}</p>
            <p className="col-span-2"><span className="font-medium">العنوان:</span> {unit?.address || '_______________'}</p>
            {unit?.area && <p><span className="font-medium">المساحة:</span> {unit.area} م²</p>}
            {unit?.rooms && <p><span className="font-medium">عدد الغرف:</span> {unit.rooms}</p>}
          </div>
        </div>

        {/* Terms */}
        <div>
          <h3 className="font-bold text-[#1e3a5f] mb-3">بنود العقد:</h3>
          <div className="space-y-3">
            <p className="pr-4">
              <span className="font-bold">البند الأول:</span> أجر الطرف الأول للطرف الثاني العين المبينة أعلاه وذلك لاستعمالها في غرض {contract?.contract_purpose || 'سكني'}.
            </p>

            <p className="pr-4">
              <span className="font-bold">البند الثاني:</span> مدة هذا العقد تبدأ من {contract?.start_date ? format(new Date(contract.start_date), 'dd/MM/yyyy') : '___/___/____'} 
              {' '}وتنتهي في {contract?.end_date ? format(new Date(contract.end_date), 'dd/MM/yyyy') : '___/___/____'}.
            </p>

            <p className="pr-4">
              <span className="font-bold">البند الثالث:</span> القيمة الإيجارية الشهرية مبلغ ({contract?.monthly_rent?.toLocaleString('ar-EG')} جنيه) 
              {' '}فقط {contract?.monthly_rent ? numberToArabicWords(contract.monthly_rent) : '_______________'} لا غير، 
              تدفع مقدماً في اليوم {contract?.payment_day || '___'} من كل شهر بطريقة {contract?.payment_method || '___'}.
            </p>

            <p className="pr-4">
              <span className="font-bold">البند الرابع:</span> دفع الطرف الثاني للطرف الأول مبلغ ({contract?.deposit?.toLocaleString('ar-EG') || '___'} جنيه) 
              كتأمين يُرد عند انتهاء العقد وتسليم العين المؤجرة بحالتها.
            </p>

            <p className="pr-4">
              <span className="font-bold">البند الخامس:</span> يلتزم الطرف الثاني بالمحافظة على العين المؤجرة وردها بالحالة التي تسلمها بها، وعدم إجراء أي تعديلات بها دون موافقة كتابية من الطرف الأول.
            </p>

            <p className="pr-4">
              <span className="font-bold">البند السادس:</span> لا يجوز للطرف الثاني التنازل عن هذا العقد أو من باطنه للغير بدون موافقة كتابية من الطرف الأول.
            </p>

            <p className="pr-4">
              <span className="font-bold">البند السابع:</span> يلتزم الطرف الثاني بسداد فواتير المرافق (كهرباء - مياه - غاز) خلال فترة الإيجار.
            </p>

            <p className="pr-4">
              <span className="font-bold">البند الثامن:</span> في حالة رغبة أي من الطرفين في عدم تجديد العقد، يجب إخطار الطرف الآخر قبل انتهاء مدة العقد بشهرين على الأقل.
            </p>

            <p className="pr-4">
              <span className="font-bold">البند التاسع:</span> يختص القضاء المصري بالفصل في أي نزاع ينشأ عن تنفيذ هذا العقد.
            </p>

            {contract?.special_terms && (
              <p className="pr-4">
                <span className="font-bold">شروط خاصة:</span> {contract.special_terms}
              </p>
            )}
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-12 pt-8 border-t-2">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <p className="font-bold mb-4">الطرف الأول (المؤجر)</p>
              <p className="mb-8">{owner?.full_name || '_______________'}</p>
              <p className="border-t border-slate-400 pt-2">التوقيع</p>
            </div>
            <div className="text-center">
              <p className="font-bold mb-4">الطرف الثاني (المستأجر)</p>
              <p className="mb-8">{tenant?.full_name || '_______________'}</p>
              <p className="border-t border-slate-400 pt-2">التوقيع</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 mt-8 pt-4 border-t">
          <p>تم تحرير هذا العقد من نسختين، نسخة لكل طرف للعمل بموجبها عند اللزوم</p>
          <p className="mt-1">تاريخ التحرير: {contract?.start_date ? format(new Date(contract.start_date), 'dd MMMM yyyy', { locale: ar }) : '_______________'}</p>
        </div>
      </div>
    </div>
  );
});

ContractPreview.displayName = 'ContractPreview';

export default ContractPreview;