import React from 'react';
import { Pencil, FileText, Upload, CheckCircle } from 'lucide-react';
import { AppFormSubmission, CustomFormSubmission, CustomForm, CustomFormField } from '../../types';

interface SubmissionCardProps {
  submission: AppFormSubmission | CustomFormSubmission;
  type: 'classic' | 'custom';
  targetForm?: CustomForm;
  fields?: CustomFormField[];
  onEdit: () => void;
}

export const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission, type, targetForm, fields, onEdit }) => {
  const isClassic = type === 'classic';
  const app = isClassic ? (submission as AppFormSubmission) : null;
  const sub = !isClassic ? (submission as CustomFormSubmission) : null;

  return (
    <div className={`border rounded-2xl p-6 transition duration-300 hover:shadow-lg shadow-xs ${
      isClassic ? 'border-gray-150 bg-slate-50/20' : 'border-amber-100 bg-amber-50/10'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
        <div className="space-y-1.5">
          <h4 className="text-sm font-black text-gray-950 flex items-center space-x-2">
            {!isClassic && <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded font-mono uppercase tracking-wider">Dynamic Form</span>}
            <span>{isClassic ? app?.formLabel : targetForm?.title || 'কাস্টম সংস্করণ'}</span>
          </h4>
          <span className="text-[11px] text-gray-500 block font-mono font-medium">আইডি - #{submission.submissionId} | দাখিলকৃত সময়: {submission.submittedAt}</span>
        </div>

        {/* Status indicator */}
        <span className={`text-[10px] px-3 py-1.5 rounded-full font-extrabold uppercase tracking-wide self-start sm:self-center font-mono inline-flex items-center gap-1.5 ${
          submission.status === 'approved' ? 'bg-green-100 text-green-700' :
          submission.status === 'rejected' ? 'bg-red-100 text-red-700' :
          submission.status === 'success' ? 'bg-green-100 text-green-700' :
          'bg-amber-100 text-amber-700'
        }`}>
          <span className={`h-2 w-2 rounded-full ${
            submission.status === 'approved' || submission.status === 'success' ? 'bg-green-600' : 
            submission.status === 'rejected' ? 'bg-red-600' : 'bg-amber-600'
          }`} />
          <span>{submission.status === 'approved' ? 'Approved (অনুমোদিত)' : 
                submission.status === 'success' ? 'Success (জমা হয়েছে)' :
                submission.status === 'rejected' ? 'Rejected' : 'Pending (যাচাইাধীন)'}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-[12px] text-gray-600 font-sans">
        {Object.entries(submission.data || {}).map(([key, val]) => {
          let label = key;
          if (isClassic) {
            if (key === 'name') label = 'নাম';
            else if (key === 'mobile') label = 'মোবাইল';
            else if (key === 'batch') label = 'ব্যাচ';
            else if (key === 'bloodGroup') label = 'রক্তের গ্রুপ';
            else if (key === 'occupation') label = 'পেশা';
            else if (key === 'address') label = 'যোগাযোগের ঠিকানা';
            else if (key === 'mentorArea') label = 'মেন্টরশিপ এরিয়া';
            else if (key === 'experienceYears') label = 'অভিজ্ঞ বছর';
            else if (key === 'bio') label = 'বায়ো ও দক্ষতা';
            else if (key === 'title') label = 'স্মরণিকা শিরোনাম';
            else if (key === 'topic') label = 'বিষয়বস্তু';
            else if (key === 'content') label = 'মূল লেখা';
          } else if (fields) {
            const fld = fields.find(fd => fd.fieldId === key);
            if (fld) label = fld.label;
          }

          const valueStr = String(val);
          const isFile = !isClassic && fields?.find(f => f.fieldId === key)?.fieldType === 'file';
          const isImage = isFile && (valueStr.startsWith('data:image/') || valueStr.endsWith('.png') || valueStr.endsWith('.jpg'));
          const isPdf = isFile && (valueStr.startsWith('data:application/pdf') || valueStr.endsWith('.pdf'));

          return (
            <div key={key} className={`${key === 'bio' || key === 'content' || key === 'address' ? 'sm:col-span-2 md:col-span-3' : ''} bg-white border border-gray-100 rounded-xl p-3 shadow-3xs`}>
              <span className="text-gray-450 font-bold block mb-1 uppercase tracking-wider text-[10px]">{label}:</span>
              
              {isImage ? (
                <div className="mt-1 border border-gray-100 rounded-lg p-1 bg-gray-50 flex flex-col items-center">
                  <img src={valueStr} alt={label} className="max-h-32 max-w-full rounded object-contain" referrerPolicy="no-referrer" />
                </div>
              ) : isPdf ? (
                <div className="mt-1 flex items-center space-x-2 text-[10px] bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-150 inline-flex">
                  <FileText className="h-4 w-4 shrink-0 text-red-500" />
                  <span className="font-extrabold">PDF Document</span>
                </div>
              ) : (
                <span className="text-gray-900 font-medium leading-relaxed font-mono whitespace-pre-line block">{valueStr}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
        <button
          type="button"
          onClick={onEdit}
          className="text-xs text-primary font-bold hover:text-primary/90 transition flex items-center gap-1.5 cursor-pointer focus:outline-none bg-primary/5 px-4 py-2 rounded-lg"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span>সংশোধন করুন (Edit)</span>
        </button>
      </div>
    </div>
  );
};
