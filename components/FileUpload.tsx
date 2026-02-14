
import React, { useState, useCallback, useMemo } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  currentFile: File | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, currentFile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = useCallback((file: File | null) => {
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const onDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const onDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, [handleFileChange]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files[0]);
    }
  };
  
  const fileDetails = useMemo(() => {
    if (!currentFile) return null;
    return (
      <div className="mt-4 text-center">
        {preview && <img src={preview} alt="File preview" className="mx-auto max-h-32 rounded-lg mb-2 border border-slate-300 dark:border-slate-600" />}
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{currentFile.name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{(currentFile.size / 1024).toFixed(2)} KB</p>
      </div>
    );
  }, [currentFile, preview]);

  return (
    <div className="mb-6">
      <label
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer
        ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadIcon className="w-10 h-10 mb-3 text-slate-400" />
          <p className="mb-2 text-sm text-slate-500 dark:text-slate-400 text-center">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">PDF, DOCX, PNG, JPG (max 10MB)</p>
        </div>
        <input id="dropzone-file" type="file" className="hidden" onChange={onInputChange} accept=".pdf,.doc,.docx,image/*" />
      </label>
      {fileDetails}
    </div>
  );
};
