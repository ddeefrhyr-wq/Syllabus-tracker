import React, { useState } from 'react';
import { Subject, Chapter, CustomExamSyllabus, ProgressBreakdown } from '../types';
import { ChapterCard } from './ChapterCard';
import { ChevronDown, ChevronUp, Plus, CheckCheck, RotateCcw, BookOpen, AlertCircle } from 'lucide-react';

interface SubjectSectionProps {
  subject: Subject;
  activeExamId: string;
  syllabuses: CustomExamSyllabus[];
  searchQuery: string;
  statusFilter: 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED';
  onToggleMilestone: (chapterId: string, milestoneKey: keyof ProgressBreakdown) => void;
  onSetAllMilestones: (chapterId: string, value: boolean) => void;
  onToggleExamInclusion: (chapterId: string, examId: string) => void;
  onOpenNotes: (chapter: Chapter) => void;
  onEditChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapterId: string) => void;
  onAddChapterToSubject: (subjectId: string) => void;
  onBatchSetSubjectMilestones: (subjectId: string, value: boolean) => void;
}

export const SubjectSection: React.FC<SubjectSectionProps> = ({
  subject,
  activeExamId,
  syllabuses,
  searchQuery,
  statusFilter,
  onToggleMilestone,
  onSetAllMilestones,
  onToggleExamInclusion,
  onOpenNotes,
  onEditChapter,
  onDeleteChapter,
  onAddChapterToSubject,
  onBatchSetSubjectMilestones,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter chapters based on activeExamId, searchQuery, statusFilter
  const filteredChapters = React.useMemo(() => {
    return subject.chapters.filter((chapter) => {
      // 1. Exam filter
      if (activeExamId !== 'ALL' && !chapter.included_in_exams.includes(activeExamId)) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = chapter.chapter_title.toLowerCase().includes(query);
        const matchesNum = chapter.chapter_number.toString().includes(query);
        const matchesNotes = chapter.notes?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesNum && !matchesNotes) {
          return false;
        }
      }

      // 3. Status filter
      if (statusFilter === 'COMPLETED' && chapter.completion_percentage !== 100) return false;
      if (statusFilter === 'IN_PROGRESS' && (chapter.completion_percentage === 0 || chapter.completion_percentage === 100)) return false;
      if (statusFilter === 'NOT_STARTED' && chapter.completion_percentage !== 0) return false;

      return true;
    });
  }, [subject.chapters, activeExamId, searchQuery, statusFilter]);

  // Overall stats for this subject in current active exam
  const examRelevantChapters = React.useMemo(() => {
    return activeExamId === 'ALL'
      ? subject.chapters
      : subject.chapters.filter(ch => ch.included_in_exams.includes(activeExamId));
  }, [subject.chapters, activeExamId]);

  const totalExamChapters = examRelevantChapters.length;
  const completedExamChapters = examRelevantChapters.filter(ch => ch.completion_percentage === 100).length;
  const totalPercentage = examRelevantChapters.reduce((acc, ch) => acc + ch.completion_percentage, 0);
  const subjectAvgPct = totalExamChapters > 0 ? Math.round(totalPercentage / totalExamChapters) : 0;

  return (
    <div
      id={`subject-section-${subject.subject_id}`}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden mb-6 transition-all"
    >
      {/* Subject Header Bar */}
      <div className="p-4 sm:p-5 bg-linear-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            title={isCollapsed ? 'প্রদর্শন করুন' : 'লুকিয়ে রাখুন'}
          >
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>

          <span
            className="w-4 h-4 rounded-md shrink-0 shadow-2xs"
            style={{ backgroundColor: subject.theme_color }}
          />

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {subject.subject_name}
              </h3>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                ({subject.english_name})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              সিলেবাসে অন্তর্ভুক্ত: <strong className="text-slate-700">{totalExamChapters}</strong> টি অধ্যায়
              (সম্পূর্ণ: {completedExamChapters} টি)
            </p>
          </div>
        </div>

        {/* Progress and quick subject buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-3.5 pl-8 sm:pl-0">
          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-800">{subjectAvgPct}%</span>
            </div>
            <div className="w-20 sm:w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${subjectAvgPct}%`,
                  backgroundColor: subject.theme_color,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id={`add-chapter-to-${subject.subject_id}`}
              onClick={() => onAddChapterToSubject(subject.subject_id)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-95 shadow-2xs"
              style={{ backgroundColor: subject.theme_color }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>অধ্যায় যোগ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chapters Container */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 space-y-3.5 bg-slate-50/30">
          {filteredChapters.length > 0 ? (
            filteredChapters.map((chapter) => (
              <ChapterCard
                key={chapter.chapter_id}
                chapter={chapter}
                subjectColor={subject.theme_color}
                syllabuses={syllabuses}
                activeExamId={activeExamId}
                onToggleMilestone={onToggleMilestone}
                onSetAllMilestones={onSetAllMilestones}
                onToggleExamInclusion={onToggleExamInclusion}
                onOpenNotes={onOpenNotes}
                onEditChapter={onEditChapter}
                onDeleteChapter={onDeleteChapter}
              />
            ))
          ) : (
            <div className="text-center py-8 px-4 bg-white rounded-xl border border-dashed border-slate-200">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                এই ফিল্টারে কোনো অধ্যায় পাওয়া যায়নি
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {activeExamId !== 'ALL'
                  ? `বর্তমান নির্বাচিত পরীক্ষায় (${activeExamId}) এই বিষয়ের কোনো অধ্যায় এখনও ট্যাগ করা নেই অথবা সার্চে মিলছে না।`
                  : 'কোনো অধ্যায় এই ফিল্টারে মিলছে না।'}
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => onAddChapterToSubject(subject.subject_id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                >
                  + নতুন অধ্যায় যোগ করুন
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
