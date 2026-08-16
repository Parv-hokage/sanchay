'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '../../lib/api-client';
import { DepartmentCard } from '../../components/catalog/DepartmentCard';

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

export default function DepartmentsDirectoryPage() {
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<DepartmentData[]>('/departments');
      setDepartments(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-sanchay-navy-700">Home</Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">Departments Directory</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-sanchay-gold-700">
          Government Hierarchy
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-sanchay-navy-900 mt-1 mb-2">
          Central Ministries & Departments
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          Sanchay organizes services under standardized central government departments and testing agencies to eliminate portal fragmentation.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      )}
    </div>
  );
}
