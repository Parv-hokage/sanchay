'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { apiRequest } from '../../../lib/api-client';
import { ServiceCard } from '../../../components/catalog/ServiceCard';

interface DepartmentDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName?: string | null;
  organizations: {
    id: string;
    name: string;
    slug: string;
    officialDomain: string;
    description: string;
    services: {
      id: string;
      name: string;
      slug: string;
      description: string;
      officialUrl: string;
      capabilities: {
        id: string;
        name: string;
        type: string;
      }[];
    }[];
  }[];
}

export default function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const [department, setDepartment] = useState<DepartmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartmentDetail();
  }, [resolvedParams.slug]);

  const fetchDepartmentDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<DepartmentDetail>(`/departments/${resolvedParams.slug}`);
      setDepartment(res.data);
    } catch (err: any) {
      setError(err.message || 'Department not found.');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (slugName: string) => {
    switch (slugName) {
      case 'education':
        return '🎓';
      case 'healthcare':
        return '🏥';
      case 'finance':
        return '💼';
      case 'transport':
        return '🚗';
      default:
        return '🏛️';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-8">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-44 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="text-3xl mb-3">⚠️</div>
        <h1 className="text-lg font-bold text-slate-800 mb-2">Department Not Found</h1>
        <p className="text-xs text-slate-600 mb-6">{error || 'The requested government department does not exist.'}</p>
        <Link
          href="/departments"
          className="px-4 py-2 bg-sanchay-navy-700 text-white rounded-xl text-xs font-semibold"
        >
          ← Return to All Departments
        </Link>
      </div>
    );
  }

  const allServices = department.organizations.flatMap((org) =>
    org.services.map((srv) => ({
      ...srv,
      organization: {
        name: org.name,
        department: {
          name: department.name,
          slug: department.slug,
        },
      },
    })),
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-sanchay-navy-700">Home</Link>
        <span>/</span>
        <Link href="/departments" className="hover:text-sanchay-navy-700">Departments</Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">{department.name}</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-sanchay-navy-950 to-sanchay-navy-800 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shrink-0">
            {getIcon(department.slug)}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sanchay-gold-300">
              Government Department
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5 mb-2">
              {department.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {department.description}
            </p>
          </div>
        </div>
      </div>

      {/* Subordinate Organizations / Agencies */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-sanchay-gold-700 mb-3">
          Participating Agencies & Statutory Bodies ({department.organizations.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {department.organizations.map((org) => (
            <div key={org.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-bold text-sanchay-navy-900">{org.name}</h3>
                <span className="text-[10px] font-mono text-sanchay-gold-800 bg-sanchay-gold-50 border border-sanchay-gold-200 px-2 py-0.5 rounded">
                  {org.officialDomain}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {org.description}
              </p>
              <span className="text-[11px] font-semibold text-slate-400">
                {org.services.length} {org.services.length === 1 ? 'Service' : 'Services'} under this body
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section>
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-sanchay-gold-700">
            Available Services
          </span>
          <h2 className="text-xl font-bold text-sanchay-navy-900">
            Citizen Digital Services ({allServices.length})
          </h2>
        </div>

        {allServices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-xs text-slate-500">
            No services registered under this department yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allServices.map((srv) => (
              <ServiceCard
                key={srv.id}
                id={srv.id}
                name={srv.name}
                slug={srv.slug}
                description={srv.description}
                officialUrl={srv.officialUrl}
                organization={srv.organization}
                capabilities={srv.capabilities}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
