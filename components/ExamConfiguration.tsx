
import React from 'react';
import type { Difficulty, QuestionType } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface ExamConfigurationProps {
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  questionTypes: QuestionType[];
  onQuestionTypesChange: (qt: QuestionType[]) => void;
  numberOfQuestions: number;
  onNumberOfQuestionsChange: (n: number) => void;
}

const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const allQuestionTypes: QuestionType[] = ['MCQ', 'ShortAnswer', 'Essay'];

export const ExamConfiguration: React.FC<ExamConfigurationProps> = ({
  difficulty,
  onDifficultyChange,
  questionTypes,
  onQuestionTypesChange,
  numberOfQuestions,
  onNumberOfQuestionsChange,
}) => {

  const handleQuestionTypeToggle = (type: QuestionType) => {
    const newTypes = questionTypes.includes(type)
      ? questionTypes.filter(t => t !== type)
      : [...questionTypes, type];
    // Ensure at least one type is selected
    if (newTypes.length > 0) {
      onQuestionTypesChange(newTypes);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="difficulty" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Difficulty Level
        </label>
        <div className="relative">
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
            className="w-full appearance-none bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg py-2 px-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
            <label htmlFor="num-questions" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Number of Questions
            </label>
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">{numberOfQuestions}</span>
        </div>
        <input
            id="num-questions"
            type="range"
            min="5"
            max="15"
            value={numberOfQuestions}
            onChange={(e) => onNumberOfQuestionsChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer range-thumb"
        />
        <style>{`
            .range-thumb::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                background: #4f46e5;
                cursor: pointer;
                border-radius: 50%;
            }

            .range-thumb::-moz-range-thumb {
                width: 20px;
                height: 20px;
                background: #4f46e5;
                cursor: pointer;
                border-radius: 50%;
                border: none;
            }
        `}</style>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Question Types
        </label>
        <div className="grid grid-cols-3 gap-2">
          {allQuestionTypes.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => handleQuestionTypeToggle(type)}
              className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-indigo-500
                ${questionTypes.includes(type)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`
              }
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
