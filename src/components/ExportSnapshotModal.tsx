import React, { useRef, useState } from 'react';
import { AppData } from '../types';
import { toPng } from 'html-to-image';
import {
  Download,
  Image as ImageIcon,
  X,
  CheckCircle2,
  GraduationCap,
  Award,
  Calendar,
  Sparkles,
  Share2,
} from 'lucide-react';

interface ExportSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  activeExamTitle: string;
  overallPercentage: number;
  completedChapters: number;
  totalChapters: number;
}

export const ExportSnapshotModal: React.FC<ExportSnapshotModalProps> = ({
  isOpen,
  onClose,
  data,
  activeExamTitle,
  overallPercentage,
  completedChapters,
  totalChapters,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    setStatusMessage('ছবি প্রসেসিং হচ্ছে...');

    try {
      // Generate high-resolution PNG
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2, // High DPI for gallery clarity
      });

      const link = document.createElement('a');
      link.download = `SSC-2028-Progress-${data.student_profile.full_name.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
      setStatusMessage('গ্যালারি ইমেজ সফলভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error('Snapshot generation failed:', err);
      setStatusMessage('ছবি তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      id="snapshot-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        id="snapshot-modal-card"
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">গ্যালারি কার্ড এক্সপোর্ট (Export Progress Card)</h2>
              <p className="text-[11px] text-slate-400">
                স্মার্টফোন গ্যালারি ও ফটো অ্যাপে সরাসরি সংরক্ষণ করার জন্য হাই-রেজুলিউশন কার্ড
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Preview Area */}
        <div className="p-6 bg-slate-100 flex flex-col items-center justify-center overflow-x-auto">
          {/* THE CAPTURABLE CARD */}
          <div
            ref={cardRef}
            id="capturable-progress-card"
            className="w-full max-w-xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-indigo-900/50 relative overflow-hidden"
          >
            {/* Background Decorative Rings */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-sm">
                  SSC
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">SSC 2028 সিলেবাস ট্র্যাকার</h3>
                  <p className="text-[11px] text-indigo-200">বিজ্ঞান বিভাগ (Science Group)</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  {activeExamTitle.split('(')[0].trim()}
                </span>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Student Info & Big Circular Progress */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 bg-white/5 border border-white/10 p-4 rounded-2xl mb-5">
              <div>
                <p className="text-[11px] text-indigo-300 font-medium">শিক্ষার্থী</p>
                <h4 className="text-lg font-extrabold text-white tracking-tight">
                  {data.student_profile.full_name}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-400/20">
                    <Award className="w-3 h-3 text-emerald-400" />
                    টার্গেট GPA {data.student_profile.target_gpa}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md border border-blue-400/20">
                    <GraduationCap className="w-3 h-3 text-blue-400" />
                    ব্যাচ {data.student_profile.ssc_batch}
                  </span>
                </div>
              </div>

              {/* Big Metric Badge */}
              <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-2xl border border-white/10">
                <div className="text-center">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 leading-none">
                    {overallPercentage}%
                  </span>
                  <p className="text-[10px] text-indigo-200 mt-1">সামগ্রিক অগ্রগতি</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-center">
                  <span className="text-lg font-bold text-white leading-none">
                    {completedChapters}/{totalChapters}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">অধ্যায় সম্পন্ন</p>
                </div>
              </div>
            </div>

            {/* Subject-Wise Mini Grid */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                বিষয়ভিত্তিক অগ্রগতি (Subject Breakdown)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {data.subjects.map((sub) => {
                  const chs = sub.chapters;
                  const total = chs.length;
                  const done = chs.filter((c) => c.completion_percentage === 100).length;
                  const avg = total > 0 ? Math.round(chs.reduce((acc, c) => acc + c.completion_percentage, 0) / total) : 0;
                  return (
                    <div
                      key={sub.subject_id}
                      className="bg-white/5 border border-white/10 p-2.5 rounded-xl flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-200 truncate pr-1">
                          {sub.subject_name}
                        </span>
                        <span className="font-bold text-emerald-300 text-[11px]">{avg}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${avg}%`,
                            backgroundColor: sub.theme_color || '#10b981',
                          }}
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 text-right">
                        {done}/{total} সম্পন্ন
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
              <span>SSC 2028 Study Sync & Tracking System</span>
              <span className="text-emerald-400 font-mono font-medium">StudySync verified</span>
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            {statusMessage ? (
              <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {statusMessage}
              </span>
            ) : (
              <span>* ছবিটি সরাসরি আপনার ফোনের ফটোস / গ্যালারি ফোল্ডারে সেভ হবে।</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              বন্ধ করুন
            </button>
            <button
              type="button"
              id="download-snapshot-btn"
              onClick={handleDownloadImage}
              disabled={isExporting}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'তৈরি হচ্ছে...' : 'গ্যালারিতে ডাউনলোড করুন'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
