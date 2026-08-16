'use client';

import React, { useState } from 'react';
import { CitizenDocument, DocumentStatus } from '@sanchay/types';

interface DocumentDetailModalProps {
  document: CitizenDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document,
  isOpen,
  onClose,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !document) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('sanchay_token') : null;
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

      const res = await fetch(`${apiBase}/documents/${document.id}/download`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.message || json.message || 'Download failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.title;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err: any) {
      alert(err.message || 'Could not download document.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${document.title}" from your private vault?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(document.id);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to delete document.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.VERIFIED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sanchay-emerald-50 text-sanchay-emerald-800 border border-sanchay-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sanchay-emerald-500" />
            Verified & Available
          </span>
        );
      case DocumentStatus.PENDING_SCAN:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            Security Scanning...
          </span>
        );
      case DocumentStatus.QUARANTINED:
      case DocumentStatus.REJECTED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Quarantined (Security Threat)
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-start mb-5">
          <div>
            <div className="mb-2">{getStatusBadge(document.status)}</div>
            <h2 className="text-xl font-bold text-sanchay-navy-900">
              {document.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Metadata Grid */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 mb-6">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block">Category</span>
              <span className="text-slate-800 font-bold">{document.documentType.replace(/_/g, ' ')}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Format / MIME</span>
              <span className="text-slate-800 font-mono font-medium">{document.mimeType}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">File Size</span>
              <span className="text-slate-800 font-semibold">
                {(document.fileSize / (1024 * 1024)).toFixed(2)} MB ({document.fileSize.toLocaleString()} bytes)
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Uploaded On</span>
              <span className="text-slate-800 font-semibold">
                {new Date(document.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>Doc ID: {document.id.substring(0, 13)}...</span>
            <span>Version: v1</span>
          </div>
        </div>

        {/* Access Safeguards Warning */}
        {document.status === DocumentStatus.PENDING_SCAN && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3.5 rounded-xl mb-6 leading-snug">
            ⏳ This document is currently undergoing asynchronous antivirus inspection. Download and application linking will become active once verified.
          </div>
        )}

        {document.status === DocumentStatus.QUARANTINED && (
          <div className="bg-red-50 border border-red-200 text-red-900 text-xs p-3.5 rounded-xl mb-6 leading-snug">
            ⚠️ Security Quarantine: This document failed file integrity verification and cannot be downloaded or shared.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200"
          >
            {isDeleting ? 'Deleting...' : '🗑️ Delete Document'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading || document.status !== DocumentStatus.VERIFIED}
              className="px-5 py-2.5 bg-sanchay-navy-700 hover:bg-sanchay-navy-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isDownloading ? 'Preparing...' : '⬇️ Download'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
