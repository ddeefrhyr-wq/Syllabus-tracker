import React from 'react';
import { RotateCcw, AlertTriangle, X, CheckSquare, RefreshCw } from 'lucide-react';

interface ResetProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetMilestonesOnly: () => void;
  onMasterReset: () => void;
  isAdminMode: boolean;
}

export const ResetProgressModal: React.FC<ResetProgressModalProps> = ({
  isOpen,
  onClose,
  onResetMilestonesOnly,
  onMasterReset,
  isAdminMode,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="reset-progress-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
    >
      <div
        id="reset-progress-modal"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-amber-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">প্রগ্রেস রিসেট (Reset Progress)</h3>
              <p className="text-[11px] text-amber-100">রিসেটের ধরন নির্বাচন করুন</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-amber-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              সতর্কতা: রিসেট করার পর পূর্বের প্রগ্রেস স্বয়ংক্রিয়ভাবে মুছে যাবে। আপনি চাইলে আগে <strong>'ব্যাকআপ'</strong> ফাইল ডাউনলোড করে রাখতে পারেন।
            </p>
          </div>

          <div className="space-y-3">
            {/* Option 1: Reset milestones only */}
            <div className="p-4 border border-slate-200 hover:border-slate-300 rounded-xl bg-slate-50/50 flex flex-col justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  মাইলস্টোন প্রগ্রেস ০% করুন (Reset Milestones Only)
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  আপনার বিষয়, অধ্যায় ও নোট অপরিবর্তিত থাকবে—শুধু টিক দেওয়া অধ্যায়ের অগ্রগতি ০% রিসেট হবে।
                </p>
              </div>
              <button
                type="button"
                id="confirm-reset-milestones-btn"
                onClick={() => {
                  onResetMilestonesOnly();
                  onClose();
                }}
                className="w-full py-2 bg-white border border-slate-300 hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-amber-800 text-xs font-semibold rounded-lg transition-colors"
              >
                শুধুমাত্র মাইলস্টোন ০% রিসেট করুন
              </button>
            </div>

            {/* Option 2: Full Master Reset */}
            <div className="p-4 border border-red-200 hover:border-red-300 rounded-xl bg-red-50/30 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-red-950 flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 text-red-600" />
                    মাস্টার রিসেট (Full Master Reset)
                  </h4>
                  {isAdminMode ? (
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                      এডমিন অনুমোদিত
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                      ডিফল্ট প্রিসেট
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  সকল কাস্টম বিষয়, অধ্যায় ও প্রগ্রেস মুছে সম্পূর্ণ ফ্যাক্টরি ডিফল্ট SSC 2028 NCTB সিলেবাসে ফিরিয়ে আনা হবে।
                </p>
              </div>
              <button
                type="button"
                id="confirm-master-reset-btn"
                onClick={() => {
                  onMasterReset();
                  onClose();
                }}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
              >
                সম্পূর্ণ মাস্টার রিসেট করুন (Master Reset)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ফিরে যান (Cancel)
          </button>
        </div>
      </div>
    </div>
  );
};
