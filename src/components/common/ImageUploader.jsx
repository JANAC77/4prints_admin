import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { formatBytes } from '../../utils/formatters.js';

export function ImageUploader({
  initialUrl,
  onFileSelect,
  label = 'Product / Banner Image',
  helperText = 'PNG, JPG, WEBP up to 5MB',
  maxSizeMb = 5,
}) {
  const [preview, setPreview] = useState(initialUrl || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreview(initialUrl || null);
    setSelectedFile(null);
    setError('');
  }, [initialUrl]);

  const handleFile = (file) => {
    setError('');
    if (!file) return;

    // Check type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG, WEBP, GIF, SVG)');
      return;
    }

    // Check size
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Image size exceeds ${maxSizeMb}MB limit`);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setPreview(null);
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          {label}
        </label>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-4 transition-all duration-200 flex flex-col items-center justify-center min-h-[160px] text-center ${isDragging
          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
          : 'border-slate-300 dark:border-slate-700/80 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-900/40'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {preview ? (
          <div className="relative w-full h-44 rounded-xl overflow-hidden group/preview border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
            <img
              src={preview}
              alt="Uploaded Preview"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <span className="text-xs font-medium text-white bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                Change Image
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-md"
                title="Remove Image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {selectedFile && (
              <span className="absolute bottom-2 left-2 text-[10px] bg-slate-900/80 text-slate-200 px-2 py-0.5 rounded backdrop-blur-sm">
                {selectedFile.name} ({formatBytes(selectedFile.size)})
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 space-y-2 text-slate-500 dark:text-slate-400">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-sm">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Click to browse
              </span>{' '}
              or drag & drop
            </div>
            <p className="text-xs text-slate-400">{helperText}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium pt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
