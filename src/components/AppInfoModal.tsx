import React from 'react';
import { Info, BookOpen, CheckCircle2, Shield, Smartphone, Award, X } from 'lucide-react';

interface AppInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
  isAdminMode: boolean;
}

export const AppInfoModal: React.FC<AppInfoModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmin,
  isAdminMode,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="app-info-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
    >
      <div
        id="app-info-modal"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/icon.svg"
              alt="Study Tracker Logo"
              className="w-11 h-11 rounded-xl shadow-md shrink-0 object-contain ring-1 ring-white/20"
            />
            <div>
              <h3 className="text-base font-bold text-white">Study Tracker — অ্যাপ তথ্য</h3>
              <p className="text-xs text-indigo-200">SSC 2028 সিলেবাস ও প্রোগ্রেস ড্যাশবোর্ড</p>
            </div>
          </div>
          <button
            type="button"
            id="close-app-info-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-slate-700 text-xs sm:text-sm">
          {/* Identity banner */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              <h4 className="font-bold text-indigo-950 text-sm">SSC 2028 Science Syllabus Roadmap</h4>
            </div>
            <p className="text-xs text-indigo-900/80 leading-relaxed">
              বাংলাদেশ জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) অনুমোদিত বিজ্ঞান বিভাগের ৯ম-১০ম শ্রেণির শিক্ষার্থীদের সকল বিষয়ভিত্তিক প্রস্তুতি ও অধ্যায়ভিত্তিক মাইলস্টোন ট্র্যাক করার পূর্ণাঙ্গ ডিজিটাল ড্যাশবোর্ড।
            </p>
          </div>

          {/* Key Features */}
          <div className="space-y-3">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
              মূল সুবিধাসমূহ:
            </h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h6 className="font-semibold text-slate-900 text-xs">৫-ধাপ বিশিষ্ট মাইলস্টোন</h6>
                  <p className="text-[11px] text-slate-500 mt-0.5">বোর্ড বই রিডিং, CQ, MCQ, টেস্ট পেপার ও ফাইনাল রিভিশন।</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h6 className="font-semibold text-slate-900 text-xs">টার্মভিত্তিক পরীক্ষা সিলেবাস</h6>
                  <p className="text-[11px] text-slate-500 mt-0.5">অর্ধবার্ষিক, বার্ষিক, প্রাক-নির্বাচনী, টেস্ট ও SSC 2028 ফাইনাল।</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-2.5">
                <Smartphone className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h6 className="font-semibold text-slate-900 text-xs">অফলাইন ও PWA সুবিধা</h6>
                  <p className="text-[11px] text-slate-500 mt-0.5">ইন্টারনেট ছাড়াই ফোনে সরাসরি ইনস্টল করে ব্যবহারযোগ্য।</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h6 className="font-semibold text-slate-900 text-xs">সুরক্ষিত এডমিন মোড</h6>
                  <p className="text-[11px] text-slate-500 mt-0.5">পাসকোড দ্বারা সংরক্ষিত কারিকুলাম ও অধ্যায় এডিটর।</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status and Admin Action */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              <span>ভার্সন: <strong>v1.2.0 (PWA Ready)</strong></span>
              <span className="mx-2">•</span>
              <span>মোড: <strong className={isAdminMode ? 'text-indigo-600' : 'text-slate-700'}>
                {isAdminMode ? 'এডমিন (Admin)' : 'শিক্ষার্থী (Student)'}
              </strong></span>
            </div>

            {!isAdminMode ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>এডমিন পাসকোড দিন</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                এডমিন অ্যাক্টিভ
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            ঠিক আছে (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
