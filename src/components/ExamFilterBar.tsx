import React from 'react';
import { CustomExamSyllabus, Subject } from '../types';
import { Layers, SlidersHorizontal, BookCheck, Sparkles } from 'lucide-react';

interface ExamFilterBarProps {
  syllabuses: CustomExamSyllabus[];
  activeExamId: string;
  subjects: Subject[];
  onSelectExam: (examId: string) => void;
  onOpenCustomManager: () => void;
}

export const ExamFilterBar: React.FC<ExamFilterBarProps> = ({
  syllabuses,
  activeExamId,
  subjects,
  onSelectExam,
  onOpenCustomManager,
}) => {
  // Compute counts & average completion for each syllabus
  const examStats = React.useMemo(() => {
    const stats: Record<string, { count: number; completedCount: number; avgPct: number }> = {};

    syllabuses.forEach(s => {
      let count = 0;
      let completedCount = 0;
      let totalPct = 0;

      subjects.forEach(subj => {
        subj.chapters.forEach(ch => {
          if (ch.included_in_exams.includes(s.exam_id)) {
            count++;
            totalPct += ch.completion_percentage;
            if (ch.completion_percentage === 100) {
              completedCount++;
            }
          }
        });
      });

      stats[s.exam_id] = {
        count,
        completedCount,
        avgPct: count > 0 ? Math.round(totalPct / count) : 0,
      };
    });

    // "ALL" stats
    let allCount = 0;
    let allCompleted = 0;
    let allTotalPct = 0;
    subjects.forEach(subj => {
      subj.chapters.forEach(ch => {
        allCount++;
        allTotalPct += ch.completion_percentage;
        if (ch.completion_percentage === 100) {
          allCompleted++;
        }
      });
    });

    stats['ALL'] = {
      count: allCount,
      completedCount: allCompleted,
      avgPct: allCount > 0 ? Math.round(allTotalPct / allCount) : 0,
    };

    return stats;
  }, [syllabuses, subjects]);

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-20 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Scrollable Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              সিলেবাস ফিল্টার:
            </span>

            {/* "ALL" option */}
            <button
              type="button"
              id="filter-exam-all"
              onClick={() => onSelectExam('ALL')}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeExamId === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              <span>সমগ্র সিলেবাস (All)</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  activeExamId === 'ALL' ? 'bg-slate-700 text-slate-100' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {examStats['ALL']?.count || 0} অধ্যায়
              </span>
            </button>

            {/* Configured Exams */}
            {syllabuses.map((exam) => {
              const isSelected = activeExamId === exam.exam_id;
              const stats = examStats[exam.exam_id] || { count: 0, avgPct: 0 };
              const isCustom = exam.exam_id === 'EXAM_CUSTOM';

              return (
                <button
                  key={exam.exam_id}
                  type="button"
                  id={`filter-exam-${exam.exam_id}`}
                  onClick={() => onSelectExam(exam.exam_id)}
                  className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  {isCustom && <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  <span>{exam.exam_title}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      isSelected
                        ? 'bg-emerald-700 text-emerald-100'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {stats.count} টি ({stats.avgPct}%)
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Custom Syllabus Manager button */}
          <div className="shrink-0 flex items-center justify-end">
            <button
              type="button"
              id="manage-custom-syllabus-btn"
              onClick={onOpenCustomManager}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              সিলেবাস মডিফাই / কাস্টমাইজ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
