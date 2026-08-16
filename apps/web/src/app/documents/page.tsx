'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api-client';
import { useAuth } from '../../context/AuthContext';
import { CitizenDocument, DocumentType, DocumentStatus } from '@sanchay/types';
import { DocumentUploadModal } from '../../components/document/DocumentUploadModal';
import { DocumentDetailModal } from '../../components/document/DocumentDetailModal';

export default function DocumentVaultPage() {
  const { isAuthenticated, openLogin } = useAuth();
  const [documents, setDocuments] = useState<CitizenDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CitizenDocument | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDocuments();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest<CitizenDocument[]>('/documents');
      setDocuments(res.data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    await apiRequest(`/documents/${id}`, { method: 'DELETE' });
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const getDocIcon = (type: DocumentType) => {
    switch (type) {
      case DocumentType.IDENTITY_PROOF:
        return '🪪';
      case DocumentType.EDUCATION_CERTIFICATE:
        return '🎓';
      case DocumentType.ADDRESS_PROOF:
        return '🏠';
      case DocumentType.INCOME_CERTIFICATE:
      case DocumentType.CATEGORY_CERTIFICATE:
        return '📑';
      case DocumentType.PHOTOGRAPH:
        return '🖼️';
      case DocumentType.SIGNATURE:
        return '✍️';
      default:
        return '📄';
    }
  };

  const getStatusIndicator = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.VERIFIED:
        return (
          <span className="text-[11px] font-bold text-sanchay-emerald-700 bg-sanchay-emerald-50 border border-sanchay-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sanchay-emerald-500" />
            Verified
          </span>
        );
      case DocumentStatus.PENDING_SCAN:
        return (
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Scanning...
          </span>
        );
      case DocumentStatus.QUARANTINED:
      case DocumentStatus.REJECTED:
        return (
          <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Quarantined
          </span>
        );
    }
  };

  const filteredDocs = documents.filter((doc) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'IDENTITY') return doc.documentType === DocumentType.IDENTITY_PROOF || doc.documentType === DocumentType.ADDRESS_PROOF;
    if (activeTab === 'EDUCATION') return doc.documentType === DocumentType.EDUCATION_CERTIFICATE;
    if (activeTab === 'FINANCIAL') return doc.documentType === DocumentType.INCOME_CERTIFICATE || doc.documentType === DocumentType.CATEGORY_CERTIFICATE;
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-sanchay-navy-50 text-sanchay-navy-700 flex items-center justify-center text-2xl mx-auto border border-sanchay-navy-100">
          📁
        </div>
        <h2 className="text-xl font-bold text-sanchay-navy-900">Private Document Vault</h2>
        <p className="text-xs text-slate-500">
          Sign in to view, manage, and securely upload your verified identity, educational, and official documents.
        </p>
        <button
          onClick={openLogin}
          className="px-6 py-2.5 bg-sanchay-navy-700 hover:bg-sanchay-navy-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Sign In to Access Vault
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-sanchay-gold-700 bg-sanchay-gold-50 px-2 py-0.5 rounded border border-sanchay-gold-200">
            Encrypted Sovereign Storage
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-sanchay-navy-900 mt-1">
            Private Document Vault
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Store documents once and seamlessly authorize reuse across verified government service applications.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-sanchay-navy-700 hover:bg-sanchay-navy-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <span>➕</span>
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: 'ALL', label: 'All Documents' },
          { id: 'IDENTITY', label: 'Identity & Address' },
          { id: 'EDUCATION', label: 'Education & Degrees' },
          { id: 'FINANCIAL', label: 'Income & Category' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-sanchay-navy-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Document Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-sanchay-navy-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Decrypting vault metadata...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl mx-auto text-slate-400">
            📁
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">No Documents in Vault</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Upload your certificates or identification to speed up future government applications.
            </p>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 bg-sanchay-navy-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Upload First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-sanchay-navy-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-sanchay-navy-50 text-xl flex items-center justify-center transition-colors">
                    {getDocIcon(doc.documentType)}
                  </div>
                  {getStatusIndicator(doc.status)}
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-sanchay-navy-800 transition-colors line-clamp-1">
                  {doc.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {doc.documentType.replace(/_/g, ' ')}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{(doc.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                <span>{new Date(doc.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={fetchDocuments}
      />

      {/* Detail & Download Modal */}
      <DocumentDetailModal
        document={selectedDoc}
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDelete={handleDeleteDocument}
      />
    </div>
  );
}
