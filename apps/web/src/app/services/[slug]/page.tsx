'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { apiRequest } from '../../../lib/api-client';
import { useAI } from '../../../context/AIContext';
import { KnowledgeSearchWidget } from '../../../components/knowledge/KnowledgeSearchWidget';

interface ServiceCapabilityRequirement {
  id: string;
  fieldKey: string;
  label: string;
  required: boolean;
  source: string;
}

interface ServiceCapability {
  id: string;
  name: string;
  slug: string;
  type: 'KNOWLEDGE' | 'RETRIEVE' | 'DOCUMENT' | 'ACTION' | 'STATUS' | 'TRANSFORM';
  description: string;
  requiresAuthentication: boolean;
  requiresConsent: boolean;
  requiresConfirmation: boolean;
  requirements?: ServiceCapabilityRequirement[];
}

interface ServiceDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  officialUrl: string;
  version: string;
  status: string;
  organization: {
    name: string;
    slug: string;
    officialDomain: string;
    department: {
      name: string;
      slug: string;
    };
  };
  capabilities: ServiceCapability[];
  integrations: {
    integrationType: string;
    baseReference: string;
    status: string;
  }[];
}

export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const { setAIContext } = useAI();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCapability, setSelectedCapability] = useState<ServiceCapability | null>(null);

  useEffect(() => {
    fetchServiceDetail();
  }, [resolvedParams.slug]);

  useEffect(() => {
    if (service) {
      setAIContext({
        department: service.organization.department.name,
        organization: service.organization.name,
        service: service.name,
        capability: selectedCapability?.name,
        route: `/services/${service.slug}`,
      });
    }
  }, [service, selectedCapability, setAIContext]);

  const fetchServiceDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<ServiceDetail>(`/services/${resolvedParams.slug}`);
      setService(res.data);
      if (res.data.capabilities.length > 0) {
        setSelectedCapability(res.data.capabilities[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Service not found.');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'ACTION':
        return 'bg-sanchay-gold-50 text-sanchay-gold-800 border-sanchay-gold-300';
      case 'DOCUMENT':
        return 'bg-sanchay-navy-50 text-sanchay-navy-800 border-sanchay-navy-200';
      case 'STATUS':
        return 'bg-sanchay-emerald-50 text-sanchay-emerald-800 border-sanchay-emerald-200';
      case 'RETRIEVE':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-8">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-52 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-96 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="text-3xl mb-3">⚠️</div>
        <h1 className="text-lg font-bold text-slate-800 mb-2">Service Not Found</h1>
        <p className="text-xs text-slate-600 mb-6">{error || 'The requested service does not exist in the Sanchay registry.'}</p>
        <Link
          href="/"
          className="px-4 py-2 bg-sanchay-navy-700 text-white rounded-xl text-xs font-semibold"
        >
          ← Return to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">


      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-sanchay-navy-700">Home</Link>
        <span>/</span>
        <Link href={`/departments/${service.organization.department.slug}`} className="hover:text-sanchay-navy-700">
          {service.organization.department.name}
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">{service.name}</span>
      </nav>

      {/* Hero Service Header */}
      <div className="bg-gradient-to-r from-sanchay-navy-950 via-sanchay-navy-900 to-sanchay-navy-800 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-sanchay-navy-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sanchay-gold-300 bg-white/10 px-2.5 py-0.5 rounded-md border border-white/15">
                {service.organization.name}
              </span>
              <span className="text-xs text-slate-300">
                Official Domain: <code className="font-mono text-sanchay-gold-200">{service.organization.officialDomain}</code>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              {service.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {service.description}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 shrink-0 w-full md:w-auto">
            <span className="block text-[10px] uppercase font-bold text-slate-300 mb-1">
              Official Portal Reference
            </span>
            <a
              href={service.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-sanchay-gold-300 hover:text-sanchay-gold-200 underline flex items-center gap-1 mb-3"
            >
              <span>{service.officialUrl}</span>
              <span>↗</span>
            </a>
            <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sanchay-emerald-400" />
              <span>Sanchay Architecture: <strong>v{service.version}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Disclaimer Banner */}
      <div className="bg-sanchay-navy-50/80 border border-sanchay-navy-200/80 rounded-2xl p-4 flex items-center gap-3 text-xs text-sanchay-navy-900 shadow-2xs">
        <span className="text-xl">🏛️</span>
        <div>
          <p className="font-bold">Unified Government Service Layer</p>
          <p className="text-[11px] text-slate-600">
            Sanchay connects directly to verified authority endpoints. Auto-fill verified profile data with one-click consent and transparent confirmation.
          </p>
        </div>
      </div>

      {/* Source-Grounded Knowledge Search Engine for this Service */}
      <KnowledgeSearchWidget
        initialServiceId={service.slug}
        placeholder={`Search official ${service.name} rules, eligibility, bulletins & circulars...`}
      />

      {/* Capabilities Layout (2 Columns: List on left, Requirement preview on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Capabilities Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-bold text-sanchay-navy-900">
              Service Capabilities ({service.capabilities.length})
            </h2>
            <span className="text-xs text-slate-500">
              Click a capability to inspect requirements
            </span>
          </div>

          <div className="space-y-3">
            {service.capabilities.map((cap) => {
              const isSelected = selectedCapability?.id === cap.id;
              return (
                <div
                  key={cap.id}
                  onClick={() => setSelectedCapability(cap)}
                  className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-sanchay-navy-600 shadow-md ring-2 ring-sanchay-navy-100'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getBadgeStyle(cap.type)}`}>
                        {cap.type}
                      </span>
                      <h3 className="text-sm font-bold text-sanchay-navy-900">
                        {cap.name}
                      </h3>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-sanchay-navy-700 bg-sanchay-navy-50 px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {cap.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      {cap.requiresAuthentication ? '🔒 Requires Sign In' : '🌐 Public Information'}
                    </span>
                    {cap.requiresConsent && (
                      <span className="flex items-center gap-1 text-sanchay-gold-800 font-medium">
                        🛡️ Requires Citizen Consent
                      </span>
                    )}
                    {cap.requirements && cap.requirements.length > 0 && (
                      <span className="ml-auto font-medium text-slate-600">
                        {cap.requirements.length} Required Field{cap.requirements.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Capability Requirement Inspector */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-sanchay-navy-900">
            Capability Details
          </h2>

          {selectedCapability ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
              <div className="mb-4 pb-3 border-b border-slate-100">
                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mb-2 ${getBadgeStyle(selectedCapability.type)}`}>
                  {selectedCapability.type}
                </span>
                <h3 className="text-base font-bold text-sanchay-navy-900">
                  {selectedCapability.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {selectedCapability.description}
                </p>
              </div>

              {/* Requirement Fields */}
              <div className="space-y-3 mb-6">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Required Citizen Data Fields:
                </span>
                {selectedCapability.requirements && selectedCapability.requirements.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCapability.requirements.map((req) => (
                      <div
                        key={req.id}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-800">{req.label}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">
                            Key: {req.fieldKey}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase text-sanchay-navy-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                          Source: {req.source}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-4 text-center text-xs text-slate-500">
                    No private citizen fields required for this capability.
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100">
                <Link
                  href={`/applications/new?serviceSlug=${service.slug}&capabilitySlug=${selectedCapability.slug}`}
                  className="w-full py-2.5 bg-sanchay-gold-600 hover:bg-sanchay-gold-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>
                    {selectedCapability.type === 'ACTION'
                      ? 'Start Online Application'
                      : selectedCapability.type === 'DOCUMENT'
                      ? 'Retrieve Document'
                      : 'Launch Service Capability'}
                  </span>
                  <span>→</span>
                </Link>
                <p className="text-[10px] text-slate-400 text-center mt-2 italic">
                  Deterministic Auto-Fill & Consent Protected.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              Select a capability to view its requirements.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
