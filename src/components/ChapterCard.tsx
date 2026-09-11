import React, { useState } from 'react';
import { Chapter, ProgressBreakdown, CustomExamSyllabus } from '../types';
import { MILESTONE_KEYS, MILESTONE_LABELS } from '../data/initialData';
import { Check, CheckCircle2, Circle, MoreVertical, FileText, Sparkles, Tag, Trash2, Edit2 } from 'lucide-react';

interface ChapterCardProps {
  chapter: Chapter;
  subjectColor: string;
  syllabuses: CustomExamSyllabus[];
  activeExamId: string;
  onToggleMilestone: (chapterId: string, milestoneKey: keyof ProgressBreakdown) => void;
  onSetAllMilestones: (chapterId: string, value: boolean) => void;
  onToggleExamInclusion: (chapterId: string, examId: string) => void;
  onOpenNotes: (chapter: Chapter) => void;
  onEditChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapterId: string) => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  subjectColor,
  syllabuses,
  activeExamId,
  onToggleMilestone,
  onSetAllMilestones,
  onToggleExamInclusion,
  onOpenNotes,
  onEditChapter,
  onDeleteChapter,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showExamManager, setShowExamManager] = useState(false);

  const isCompleted = chapter.completion_percentage === 100;
  const isStarted = chapter.completion_percentage > 0;

  // Percentage color
  const getBadgeColor = (pct: number) => {
    if (pct === 100) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (pct >= 60) return 'bg-teal-100 text-teal-800 border-teal-300';
    if (pct >= 40) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (pct > 0) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div
      id={`chapter-card-${chapter.chapter_id}`}
      className={`bg-white rounded-xl border transition-all duration-200 p-4 sm:p-5 ${
        isCompleted
          ? 'border-emerald-200/90 shadow-xs bg-linear-to-b from-white to-emerald-50/20'
          : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
      }`}
    >
      {/* Chapter Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Chapter Number Badge */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 text-white shadow-2xs"
            style={{ backgroundColor: subjectColor }}
          >
            {chapter.chapter_number}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-slate-900 leading-snug">
                {chapter.chapter_title}
              </h4>
              {chapter.notes && (
                <button
                  type="button"
                  onClick={() => onOpenNotes(chapter)}
                  className="text-amber-500 hover:text-amber-600 transition-colors"
                  title="নোট পড়ুন"
                >
                  <FileText className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Exam Tags Strip */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {syllabuses.map((exam) => {
                const isIncluded = chapter.included_in_exams.includes(exam.exam_id);
                const isCurrentActive = activeExamId === exam.exam_id;

                if (!isIncluded && !showExamManager) return null;

                return (
                  <button
                    key={exam.exam_id}
                    type="button"
                    onClick={() => onToggleExamInclusion(chapter.chapter_id, exam.exam_id)}
                    title={isIncluded ? 'ক্লিক করে এই সিলেবাস থেকে বাদ দিন' : 'ক্লিক করে এই সিলেবাসে যোগ করুন'}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1 transition-all ${
                      isIncluded
                        ? isCurrentActive
                          ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        : 'bg-white hover:bg-slate-100 text-slate-400 border border-dashed border-slate-300'
                    }`}
                  >
                    {exam.exam_id === 'EXAM_CUSTOM' && <Sparkles className="w-2.5 h-2.5 text-amber-500" />}
                    <span>{exam.exam_title.split(' ')[0]}</span>
                    {isIncluded ? '✓' : '+'}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setShowExamManager(!showExamManager)}
                className="text-[10px] px-1.5 py-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                title="সিলেবাস ট্যাগসমূহ পরিবর্তন করুন"
              >
                <Tag className="w-3 h-3 inline mr-0.5" />
                {showExamManager ? 'সম্পন্ন' : 'সিলেবাস ট্যাগ'}
              </button>
            </div>
          </div>
        </div>

        {/* Right side: Progress percentage & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getBadgeColor(
                chapter.completion_percentage
              )}`}
            >
              {chapter.completion_percentage}% সম্পন্ন
            </span>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-30 text-xs text-slate-700"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSetAllMilestones(chapter.chapter_id, true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  সব সম্পন্ন মার্ক করুন
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSetAllMilestones(chapter.chapter_id, false);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Circle className="w-3.5 h-3.5 text-slate-400" />
                  রিসেট (০% করুন)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenNotes(chapter);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  নোট যুক্ত / এডিট করুন
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onEditChapter(chapter);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                  অধ্যায় সম্পাদনা
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={() => {
                    onDeleteChapter(chapter.chapter_id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  অধ্যায় মুছে ফেলুন
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            chapter.completion_percentage === 100
              ? 'bg-emerald-500'
              : chapter.completion_percentage >= 60
              ? 'bg-teal-500'
              : chapter.completion_percentage >= 40
              ? 'bg-amber-500'
              : 'bg-slate-400'
          }`}
          style={{ width: `${chapter.completion_percentage}%` }}
        />
      </div>

      {/* 5 Milestone Checkboxes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-4 pt-3 border-t border-slate-100">
        {MILESTONE_KEYS.map((key) => {
          const isDone = chapter.progress_breakdown[key];
          const info = MILESTONE_LABELS[key];

          return (
            <button
              key={key}
              type="button"
              id={`milestone-${chapter.chapter_id}-${key}`}
              onClick={() => onToggleMilestone(chapter.chapter_id, key)}
              className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-300/80 text-emerald-900 shadow-2xs font-medium'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-600 hover:bg-slate-50/80'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md flex items-center justify-center transition-all shrink-0 ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'border border-slate-300 bg-white'
                }`}
              >
                {isDone && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs leading-tight truncate font-semibold">
                  {info.bn}
                </p>
                <p className="text-[10px] text-slate-400 leading-none truncate mt-0.5">
                  {info.en}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Note Preview if exists */}
      {chapter.notes && (
        <div className="mt-3 p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-lg text-xs text-amber-900 flex items-start gap-2">
          <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="flex-1 italic">{chapter.notes}</p>
        </div>
      )}
    </div>
  );
};
