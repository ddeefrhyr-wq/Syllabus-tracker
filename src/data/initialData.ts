import { AppData, ProgressBreakdown } from '../types';

export const INITIAL_APP_DATA: AppData = {
  student_profile: {
    student_id: "STU_2028_001",
    full_name: "Md Saimon Hassan",
    ssc_batch: "2028",
    group: "Science",
    target_gpa: "5.00",
    active_exam_filter: "EXAM_ANNUAL"
  },
  custom_exam_syllabuses: [
    {
      exam_id: "EXAM_HALF_YEARLY",
      exam_title: "অর্ধবার্ষিক পরীক্ষা (Half Yearly)",
      is_active: false
    },
    {
      exam_id: "EXAM_ANNUAL",
      exam_title: "বার্ষিক পরীক্ষা (Annual Exam)",
      is_active: true
    },
    {
      exam_id: "EXAM_PRE_TEST",
      exam_title: "প্রাক-নির্বাচনী পরীক্ষা (Pre-Test)",
      is_active: false
    },
    {
      exam_id: "EXAM_TEST",
      exam_title: "নির্বাচনী পরীক্ষা (Test Exam)",
      is_active: false
    },
    {
      exam_id: "EXAM_CUSTOM",
      exam_title: "নিজের তৈরি সিলেবাস (Custom Syllabus)",
      is_active: false
    }
  ],
  subjects: [
    {
      subject_id: "PHY_101",
      subject_name: "পদার্থবিজ্ঞান",
      english_name: "Physics",
      theme_color: "#10B981",
      chapters: [
        {
          chapter_id: "PHY_CH_01",
          chapter_number: 1,
          chapter_title: "ভৌত রাশি ও পরিমাপ",
          included_in_exams: ["EXAM_HALF_YEARLY", "EXAM_ANNUAL", "EXAM_TEST", "EXAM_CUSTOM"],
          progress_breakdown: {
            board_book_reading: true,
            cq_practice: true,
            mcq_practice: false,
            test_paper_solve: false,
            revision_done: false
          },
          completion_percentage: 40
        },
        {
          chapter_id: "PHY_CH_02",
          chapter_number: 2,
          chapter_title: "গতি",
          included_in_exams: ["EXAM_HALF_YEARLY", "EXAM_ANNUAL", "EXAM_PRE_TEST", "EXAM_TEST", "EXAM_CUSTOM"],
          progress_breakdown: {
            board_book_reading: true,
            cq_practice: true,
            mcq_practice: true,
            test_paper_solve: true,
            revision_done: true
          },
          completion_percentage: 100
        },
        {
          chapter_id: "PHY_CH_03",
          chapter_number: 3,
          chapter_title: "বল",
          included_in_exams: ["EXAM_ANNUAL", "EXAM_TEST"],
          progress_breakdown: {
            board_book_reading: false,
            cq_practice: false,
            mcq_practice: false,
            test_paper_solve: false,
            revision_done: false
          },
          completion_percentage: 0
        }
      ]
    },
    {
      subject_id: "CHEM_102",
      subject_name: "রসায়ন",
      english_name: "Chemistry",
      theme_color: "#8B5CF6",
      chapters: [
        {
          chapter_id: "CHEM_CH_01",
          chapter_number: 1,
          chapter_title: "রসায়নের ধারণা",
          included_in_exams: ["EXAM_HALF_YEARLY", "EXAM_ANNUAL", "EXAM_TEST"],
          progress_breakdown: {
            board_book_reading: true,
            cq_practice: true,
            mcq_practice: true,
            test_paper_solve: false,
            revision_done: false
          },
          completion_percentage: 60
        }
      ]
    },
    {
      subject_id: "HMATH_103",
      subject_name: "উচ্চতর গণিত",
      english_name: "Higher Mathematics",
      theme_color: "#06B6D4",
      chapters: [
        {
          chapter_id: "HMATH_CH_01",
          chapter_number: 1,
          chapter_title: "সেট ও ফাংশন",
          included_in_exams: ["EXAM_ANNUAL", "EXAM_PRE_TEST", "EXAM_TEST"],
          progress_breakdown: {
            board_book_reading: true,
            cq_practice: false,
            mcq_practice: false,
            test_paper_solve: false,
            revision_done: false
          },
          completion_percentage: 20
        }
      ]
    }
  ]
};

export const MILESTONE_KEYS: (keyof ProgressBreakdown)[] = [
  'board_book_reading',
  'cq_practice',
  'mcq_practice',
  'test_paper_solve',
  'revision_done'
];

export const MILESTONE_LABELS: Record<keyof ProgressBreakdown, { bn: string; en: string; short: string }> = {
  board_book_reading: {
    bn: 'মূল বই রিডিং',
    en: 'Board Book Reading',
    short: 'বই রিডিং'
  },
  cq_practice: {
    bn: 'সৃজনশীল অনুশীলন (CQ)',
    en: 'Creative Questions Practice',
    short: 'CQ প্র্যাকটিস'
  },
  mcq_practice: {
    bn: 'বহুনির্বাচনী অনুশীলন (MCQ)',
    en: 'Multiple Choice Practice',
    short: 'MCQ প্র্যাকটিস'
  },
  test_paper_solve: {
    bn: 'টেস্ট পেপার সমাধান',
    en: 'Test Paper Solving',
    short: 'টেস্ট পেপার'
  },
  revision_done: {
    bn: 'চূড়ান্ত রিভিশন সম্পন্ন',
    en: 'Final Revision Complete',
    short: 'রিভিশন'
  }
};

export function calculateCompletion(breakdown: ProgressBreakdown): number {
  const count = MILESTONE_KEYS.filter(k => breakdown[k]).length;
  return Math.round((count / MILESTONE_KEYS.length) * 100);
}
