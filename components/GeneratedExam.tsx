
import React, { useState, useRef } from 'react';
import type { Exam, Question } from '../types';
import { PdfIcon } from './icons/PdfIcon';

interface GeneratedExamProps {
  exam: Exam;
}

// Need to declare jsPDF on the window object for the script-based import
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

const QuestionCard: React.FC<{ question: Question; showAnswer: boolean }> = ({ question, showAnswer }) => {
  return (
    <div className="bg-white dark:bg-slate-700/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
      <p className="font-semibold text-slate-800 dark:text-slate-200 mb-4">
        {question.questionNumber}. {question.questionText}
      </p>
      {question.questionType === 'MCQ' && question.options && (
        <div className="space-y-2 mb-4">
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center">
              <span className="text-slate-500 dark:text-slate-400 mr-2">{String.fromCharCode(65 + index)}.</span>
              <span className="text-slate-700 dark:text-slate-300">{option}</span>
            </div>
          ))}
        </div>
      )}
      {showAnswer && (
        <div className="mt-4 pt-4 border-t border-dashed border-slate-300 dark:border-slate-600">
          <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Answer:</p>
          <p className="text-slate-700 dark:text-slate-300">{question.correctAnswer}</p>
        </div>
      )}
    </div>
  );
};


export const GeneratedExam: React.FC<GeneratedExamProps> = ({ exam }) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const examContentRef = useRef<HTMLDivElement>(null);

  const exportToPdf = async () => {
    if (!examContentRef.current || !window.jspdf || !window.html2canvas) {
        alert("PDF generation library not loaded.");
        return;
    };
    
    setIsExporting(true);
    const { jsPDF } = window.jspdf;
    
    try {
        const canvas = await window.html2canvas(examContentRef.current, {
            scale: 2,
            backgroundColor: null, 
            useCORS: true,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        
        let finalImgWidth = pdfWidth - 20; // with margin
        let finalImgHeight = finalImgWidth / ratio;
        
        let heightLeft = finalImgHeight;
        let position = 10; // top margin

        pdf.addImage(imgData, 'PNG', 10, position, finalImgWidth, finalImgHeight);
        heightLeft -= (pdfHeight - 20);

        while (heightLeft > 0) {
            position = - (finalImgHeight - heightLeft);
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, finalImgWidth, finalImgHeight);
            heightLeft -= (pdfHeight - 20);
        }

        pdf.save(`${exam.title.replace(/\s+/g, '_')}.pdf`);
    } catch(e) {
        console.error("Error exporting to PDF:", e);
        alert("An error occurred while generating the PDF.");
    } finally {
        setIsExporting(false);
    }
  };


  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 md:p-8 border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 border-b border-slate-200 dark:border-slate-700 pb-6">
        <div>
            <h2 id="exam-title" className="text-2xl font-bold text-slate-900 dark:text-white">{exam.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Generated on: {new Date(exam.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <label htmlFor="show-answers" className="flex items-center cursor-pointer">
            <span className="mr-3 text-sm font-medium text-slate-700 dark:text-slate-300">Show Answers</span>
            <div className="relative">
              <input type="checkbox" id="show-answers" className="sr-only peer" checked={showAnswers} onChange={() => setShowAnswers(!showAnswers)} />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </div>
          </label>
          <button onClick={exportToPdf} disabled={isExporting} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-indigo-500 disabled:opacity-50">
            <PdfIcon className="w-5 h-5 mr-2" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      <div ref={examContentRef} className="bg-white dark:bg-slate-800 p-4 printable-area">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-2 printable-title">{exam.title}</h2>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-8 printable-subtitle">ExaPrep AI Generated Exam</p>
        <div className="space-y-6">
          {exam.questions.sort((a,b) => a.questionNumber - b.questionNumber).map((q) => (
            <QuestionCard key={q.questionNumber} question={q} showAnswer={showAnswers} />
          ))}
        </div>
      </div>

       <style>{`
          .printable-area { color: #111827; }
          .dark .printable-area { color: #111827; background-color: white; }
          .dark .printable-area .dark\\:bg-slate-700\\/50 { background-color: #f8fafc; }
          .dark .printable-area .dark\\:text-slate-200 { color: #334155; }
          .dark .printable-area .dark\\:text-slate-300 { color: #475569; }
          .dark .printable-area .dark\\:text-slate-400 { color: #64748b; }
          .dark .printable-area .dark\\:border-slate-700 { border-color: #e2e8f0; }
          .dark .printable-area .dark\\:text-indigo-400 { color: #4f46e5; }
          .dark .printable-area .dark\\:border-slate-600 { border-color: #cbd5e1; }
          .dark .printable-area .printable-title { color: #111827 !important; }
          .dark .printable-area .printable-subtitle { color: #64748b !important; }
        `}</style>
    </div>
  );
};
