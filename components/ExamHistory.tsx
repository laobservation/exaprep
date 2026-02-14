
import React from 'react';
import type { Exam } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';

interface ExamHistoryProps {
  history: Exam[];
  onSelect: (exam: Exam) => void;
  currentExamId?: string | null;
  startNewExam: () => void;
}

export const ExamHistory: React.FC<ExamHistoryProps> = ({ history, onSelect, currentExamId, startNewExam }) => {
  if (history.length === 0) {
    return null; // Don't show the component if there's no history
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
        <HistoryIcon className="w-5 h-5 mr-2 text-slate-500" />
        Exam History
      </h3>
      <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {history.map(exam => (
          <li key={exam.id}>
            <button
              onClick={() => onSelect(exam)}
              className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                currentExamId === exam.id
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <p className="truncate text-sm font-medium">{exam.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(exam.createdAt).toLocaleString()}
              </p>
            </button>
          </li>
        ))}
      </ul>
       <button
        onClick={startNewExam}
        className="w-full mt-4 text-sm bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-300 dark:focus:ring-slate-600 transition-all duration-300"
      >
        + Start New Exam
      </button>
    </div>
  );
};
