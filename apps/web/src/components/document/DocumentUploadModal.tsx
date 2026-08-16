'use client';

import React, { useState, useRef } from 'react';
import { apiRequest } from '../../lib/api-client';
import { DocumentType } from '@sanchay/types';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>(DocumentType.IDENTITY_PROOF);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        setError('File exceeds 5MB size limit.');
        return;
      }
      setFile(selected);
      if (!title) {
        // Auto-populate friendly title without extension
        const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a document title.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      formData.append('documentType', documentType);

      const token = typeof window !== 'undefined' ? localStorage.getItem('sanchay_token') : null;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

      const res = await fetch(`${apiBase}/documents/upload`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'Upload failed');
      }

      onUploadSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-start mb-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sanchay-gold-700 bg-sanchay-gold-50 px-2 py-0.5 rounded border border-sanchay-gold-200">
              Private Citizen Vault
            </span>
            <h2 className="text-xl font-bold text-sanchay-navy-900 mt-1">
              Upload Document
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl mb-4 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Target Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
              file
                ? 'border-sanchay-emerald-400 bg-sanchay-emerald-50/40'
                : 'border-slate-300 hover:border-sanchay-navy-500 bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
            />
            {file ? (
              <div className="space-y-1">
                <span className="text-2xl">📄</span>
                <p className="text-xs font-bold text-slate-800">{file.name}</p>
                <p className="text-[11px] text-slate-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for security scan
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <span className="text-2xl text-slate-400">📁</span>
                <p className="text-xs font-bold text-slate-700">
                  Click to browse or drag document here
                </p>
                <p className="text-[11px] text-slate-400">
                  Supported formats: PDF, JPEG, PNG, WebP (Max 5MB)
                </p>
              </div>
            )}
          </div>

          {/* Document Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Document Category <span className="text-red-500">*</span>
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
            >
              <option value={DocumentType.IDENTITY_PROOF}>Identity Proof (Aadhaar / Voter / Passport)</option>
              <option value={DocumentType.EDUCATION_CERTIFICATE}>Education Certificate (Class 10 / 12 / Degree)</option>
              <option value={DocumentType.ADDRESS_PROOF}>Address Proof (Utility Bill / Domicile)</option>
              <option value={DocumentType.CATEGORY_CERTIFICATE}>Category Certificate (OBC-NCL / SC / ST / EWS)</option>
              <option value={DocumentType.INCOME_CERTIFICATE}>Income Certificate</option>
              <option value={DocumentType.PHOTOGRAPH}>Passport Photograph</option>
              <option value={DocumentType.SIGNATURE}>Specimen Signature</option>
              <option value={DocumentType.OTHER}>Other Official Document</option>
            </select>
          </div>

          {/* Document Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Document Title / Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Class 12 Marksheet 2026"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
            />
          </div>

          {/* Privacy Notice */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2">
            <span className="text-xs">🛡️</span>
            <p className="text-[11px] text-slate-500 leading-snug">
              Files are stored in private encrypted storage and validated with signature & malware scanning before availability.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2.5 bg-sanchay-navy-700 hover:bg-sanchay-navy-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isUploading ? 'Uploading & Scanning...' : 'Upload to Vault'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
