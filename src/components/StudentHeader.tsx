import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { User, Award, Hash, GraduationCap, Edit3, RotateCcw, Download, Upload, CheckCircle2 } from 'lucide-react';

interface StudentHeaderProps {
  profile: StudentProfile;
  totalChapters: number;
  completedChapters: number;
  overallPercentage: number;
  activeExamTitle: string;
  activeExamPercentage: number;
  onEditProfile: () => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  profile,
  totalChapters,
  completedChapters,
  overallPercentage,
  activeExamTitle,
  activeExamPercentage,
  onEditProfile,
  onResetData,
  onExportData,
  onImportData
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Student Profile Info */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-500/10 shrink-0">
              {profile.full_name
                .split(' ')
                .slice(-2)
                .map(n => n[0])
                .join('') || 'SH'}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {profile.full_name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  টার্গেট GPA {profile.target_gpa}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  SSC {profile.ssc_batch} ({profile.group})
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3 text-slate-400" />
                  আইডি: <strong className="text-slate-700 font-mono">{profile.student_id}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">
                  বর্তমান পরীক্ষা: <strong className="text-slate-800">{activeExamTitle}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Active Exam Progress Badge */}
            <div className="bg-slate-50 rounded-xl px-3.5 py-2 border border-slate-200/80 flex items-center gap-3">
              <div>
                <p className="text-[11px] font-medium text-slate-500 leading-tight">
                  পরীক্ষার সিলেবাস অগ্রগতি
                </p>
                <p className="text-lg font-bold text-slate-900 leading-none mt-0.5">
                  {activeExamPercentage}%
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center font-bold text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            {/* Total Completed Chapters */}
            <div className="bg-slate-50 rounded-xl px-3.5 py-2 border border-slate-200/80 flex items-center gap-3">
              <div>
                <p className="text-[11px] font-medium text-slate-500 leading-tight">
                  সম্পূর্ণ অধ্যায়
                </p>
                <p className="text-lg font-bold text-slate-900 leading-none mt-0.5">
                  {completedChapters} <span className="text-xs text-slate-400 font-normal">/ {totalChapters}</span>
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
              <button
                type="button"
                id="edit-profile-btn"
                onClick={onEditProfile}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-2xs"
                title="প্রোফাইল সম্পাদনা করুন"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">প্রোফাইল</span>
              </button>

              <button
                type="button"
                id="export-data-btn"
                onClick={onExportData}
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
                title="ব্যাকআপ ডাউনলোড করুন (Export JSON)"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">ব্যাকআপ</span>
              </button>

              <label
                id="import-data-label"
                className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                title="ব্যাকআপ লোড করুন (Import JSON)"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">রিস্টোর</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportData}
                  className="hidden"
                />
              </label>

              {showConfirmReset ? (
                <div className="inline-flex items-center gap-1 bg-amber-50 p-1 rounded-lg border border-amber-200">
                  <span className="text-[11px] text-amber-800 font-medium px-1">রিসেট?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onResetData();
                      setShowConfirmReset(false);
                    }}
                    className="px-2 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700"
                  >
                    হ্যাঁ
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-medium hover:bg-slate-300"
                  >
                    না
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="reset-data-btn"
                  onClick={() => setShowConfirmReset(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-red-600 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50/50 transition-colors shadow-2xs"
                  title="ডিফল্ট ডেটায় রিসেট করুন"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
