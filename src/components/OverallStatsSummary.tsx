import React from 'react';
import { Subject, CustomExamSyllabus } from '../types';
import { Target, BookOpen, CheckCircle, Clock, Search, Filter } from 'lucide-react';

interface OverallStatsSummaryProps {
  activeExamId: string;
  syllabuses: CustomExamSyllabus[];
  subjects: Subject[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
  onStatusFilterChange: (status: 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED') => void;
  onAddSubject: () => void;
  isAdminMode?: boolean;
}

export const OverallStatsSummary: React.FC<OverallStatsSummaryProps> = ({
  activeExamId,
  syllabuses,
  subjects,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onAddSubject,
  isAdminMode = false,
}) => {
  const currentExam = syllabuses.find(s => s.exam_id === activeExamId);
  const examTitle = currentExam ? currentExam.exam_title : 'সমগ্র সিলেবাস (All Chapters)';

  // Calculate subject-level stats for active exam
  const subjectStats = React.useMemo(() => {
    return subjects.map(subject => {
      const relevantChapters = activeExamId === 'ALL'
        ? subject.chapters
        : subject.chapters.filter(ch => ch.included_in_exams.includes(activeExamId));

      const totalChapters = relevantChapters.length;
      const completedChapters = relevantChapters.filter(ch => ch.completion_percentage === 100).length;
      const totalPercentage = relevantChapters.reduce((acc, ch) => acc + ch.completion_percentage, 0);
      const avgPercentage = totalChapters > 0 ? Math.round(totalPercentage / totalChapters) : 0;

      return {
        ...subject,
        relevantChaptersCount: totalChapters,
        completedChaptersCount: completedChapters,
        avgPercentage,
      };
    });
  }, [subjects, activeExamId]);

  const totalExamChapters = subjectStats.reduce((acc, s) => acc + s.relevantChaptersCount, 0);
  const totalExamCompleted = subjectStats.reduce((acc, s) => acc + s.completedChaptersCount, 0);
  const totalWeightedProgress = subjectStats.reduce((acc, s) => {
    const sum = s.relevantChaptersCount > 0 ? s.avgPercentage * s.relevantChaptersCount : 0;
    return acc + sum;
  }, 0);
  const overallExamPct = totalExamChapters > 0 ? Math.round(totalWeightedProgress / totalExamChapters) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 mb-6">
      {/* Top Banner: Exam Progress Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              টার্গেট পরীক্ষা সিলেবাস
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            {examTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            এই পরীক্ষার সিলেবাসে মোট <strong className="text-slate-800">{totalExamChapters}</strong> টি অধ্যায় অন্তর্ভুক্ত রয়েছে (সম্পূর্ণ: {totalExamCompleted} টি)
          </p>
        </div>

        {/* Big Overall Progress Pill */}
        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
          <div className="text-right">
            <div className="text-[11px] font-medium text-slate-500">গড় প্রস্তুতি সম্পন্ন</div>
            <div className="text-2xl font-black text-slate-900 leading-none mt-0.5">
              {overallExamPct}%
            </div>
          </div>
          <div className="w-28 sm:w-36 bg-slate-200 rounded-full h-3 overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-teal-500 to-emerald-500"
              style={{ width: `${overallExamPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Subject Progress Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 my-5">
        {subjectStats.map(s => {
          return (
            <div
              key={s.subject_id}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-md shrink-0 shadow-2xs"
                    style={{ backgroundColor: s.theme_color }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 leading-tight">
                      {s.subject_name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {s.english_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900">
                    {s.avgPercentage}%
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {s.completedChaptersCount}/{s.relevantChaptersCount} অধ্যায়
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${s.avgPercentage}%`,
                    backgroundColor: s.theme_color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            id="chapter-search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="অধ্যায়ের নাম দিয়ে খুঁজুন (যেমন: গতি, পরিমাপ)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Status filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3 h-3" />
            অবস্থা:
          </span>
          {(
            [
              { id: 'ALL', label: 'সকল' },
              { id: 'COMPLETED', label: 'সম্পূর্ণ (১০০%)' },
              { id: 'IN_PROGRESS', label: 'চলমান' },
              { id: 'NOT_STARTED', label: 'শুরু হয়নি (০%)' },
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              type="button"
              id={`status-filter-${tab.id.toLowerCase()}`}
              onClick={() => onStatusFilterChange(tab.id)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-emerald-100 text-emerald-800 font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            type="button"
            id="add-subject-btn"
            onClick={onAddSubject}
            className="ml-auto sm:ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shrink-0 shadow-2xs cursor-pointer"
            title={isAdminMode ? 'নতুন বিষয় যোগ করুন' : 'নতুন বিষয় যোগ করতে এডমিন মোড সক্রিয় করুন'}
          >
            <span>+ নতুন বিষয়</span>
            {!isAdminMode && (
              <span className="text-[10px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-medium">
                এডমিন
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
