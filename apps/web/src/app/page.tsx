'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '../lib/api-client';
import { DepartmentCard } from '../components/catalog/DepartmentCard';
import { ServiceCard } from '../components/catalog/ServiceCard';
import { SearchFilterBar } from '../components/catalog/SearchFilterBar';
import { LoadingSkeleton, ServiceCardSkeleton } from '../components/common/LoadingSkeleton';

interface DepartmentData {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName?: string | null;
  serviceCount: number;
  organizationCount: number;
  featuredServices?: { id: string; name: string; slug: string }[];
}

interface ServiceData {
  id: string;
  name: string;
  slug: string;
  description: string;
  officialUrl: string;
  organization: {
    name: string;
    department: {
      name: string;
      slug: string;
    };
  };
  capabilities: {
    id: string;
    name: string;
    type: string;
  }[];
}

export default function HomePage() {
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [recommendedServices, setRecommendedServices] = useState<ServiceData[]>([]);
  const [allServices, setAllServices] = useState<ServiceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    fetchCatalogData();
  }, []);

  const fetchCatalogData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [deptRes, recRes, srvRes] = await Promise.all([
        apiRequest<DepartmentData[]>('/departments'),
        apiRequest<ServiceData[]>('/services/recommendations'),
        apiRequest<ServiceData[]>('/services'),
      ]);

      setDepartments(deptRes.data);
      setRecommendedServices(recRes.data);
      setAllServices(srvRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load services directory.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered services
  const filteredServices = allServices.filter((srv) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.organization?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      selectedDepartment === '' ||
      srv.organization?.department?.slug === selectedDepartment;

    return matchesSearch && matchesDept;
  });

  const isFiltering = searchQuery.trim() !== '' || selectedDepartment !== '';

  return (
    <div className="space-y-10 pb-12">
      {/* Platform Hero Banner */}
      <section className="bg-gradient-to-br from-sanchay-navy-950 via-sanchay-navy-900 to-sanchay-navy-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden border border-sanchay-navy-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sanchay-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-sanchay-gold-300 text-xs font-semibold mb-4 border border-white/15">
            <span>🇮🇳</span>
            <span>Unified National Digital Service Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4">
            One Citizen Account. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sanchay-gold-300 via-sanchay-gold-200 to-white">
              Every Government Service.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
            Eliminate fragmented portals. Access university admissions (NTA / JEE Main), healthcare assurance (Ayushman Bharat PM-JAY), and public services through verified citizen identity.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sanchay-emerald-400" />
              <span>{departments.length || 4} Government Departments</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sanchay-emerald-400" />
              <span>{allServices.length || 4} Unified Services Live</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sanchay-gold-400" />
              <span>Zero-Trust Citizen Consent</span>
            </div>
          </div>
        </div>
      </section>

      {/* Global Search & Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        departments={departments}
      />

      {/* Error Retry Notice */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-sm font-semibold text-red-800 mb-2">{error}</p>
          <button
            onClick={fetchCatalogData}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Retry Loading Catalog
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-8">
          <div>
            <div className="h-6 w-48 bg-slate-200 rounded-md mb-4 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ServiceCardSkeleton />
              <ServiceCardSkeleton />
            </div>
          </div>
        </div>
      )}

      {/* When filtering, display results directly */}
      {!isLoading && !error && isFiltering && (
        <section>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-sanchay-navy-900">
                Search Results ({filteredServices.length})
              </h2>
              <p className="text-xs text-slate-500">
                Services matching &quot;{searchQuery || selectedDepartment}&quot;
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDepartment('');
              }}
              className="text-xs text-sanchay-navy-700 hover:underline font-semibold"
            >
              Clear Filters
            </button>
          </div>

          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">No services found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No government services matched your search criteria. Try a different search term or select another department.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  slug={service.slug}
                  description={service.description}
                  officialUrl={service.officialUrl}
                  organization={service.organization}
                  capabilities={service.capabilities}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Standard Home Directory Sections (When not filtering) */}
      {!isLoading && !error && !isFiltering && (
        <>
          {/* Featured Services (JEE Main & Ayushman Bharat) */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sanchay-gold-700">
                  Featured Services
                </span>
                <h2 className="text-xl font-bold text-sanchay-navy-900">
                  Key Government Portals
                </h2>
              </div>
              <Link
                href="/departments"
                className="text-xs font-bold text-sanchay-navy-700 hover:text-sanchay-navy-900"
              >
                Browse All Departments →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendedServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  slug={service.slug}
                  description={service.description}
                  officialUrl={service.officialUrl}
                  organization={service.organization}
                  capabilities={service.capabilities}
                  isFeatured={true}
                />
              ))}
            </div>
          </section>

          {/* Department Categories Grid */}
          <section>
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-sanchay-gold-700">
                Service Hierarchy
              </span>
              <h2 className="text-xl font-bold text-sanchay-navy-900">
                Government Departments
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Standardized citizen access across all central ministries and regulatory bodies.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {departments.map((dept) => (
                <DepartmentCard
                  key={dept.id}
                  id={dept.id}
                  name={dept.name}
                  slug={dept.slug}
                  description={dept.description}
                  iconName={dept.iconName}
                  serviceCount={dept.serviceCount}
                  organizationCount={dept.organizationCount}
                  featuredServices={dept.featuredServices}
                />
              ))}
            </div>
          </section>

          {/* All Available Services Catalog */}
          <section>
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-sanchay-gold-700">
                Complete Catalog
              </span>
              <h2 className="text-xl font-bold text-sanchay-navy-900">
                All Available Services ({allServices.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  slug={service.slug}
                  description={service.description}
                  officialUrl={service.officialUrl}
                  organization={service.organization}
                  capabilities={service.capabilities}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
