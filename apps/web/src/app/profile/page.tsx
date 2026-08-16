'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../lib/api-client';
import {
  Address,
  AddressType,
  ConsentRecord,
  IdentityLink,
} from '@sanchay/types';

export default function ProfilePage() {
  const { user, profile, isAuthenticated, isLoading, refreshProfile } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [identityLinks, setIdentityLinks] = useState<IdentityLink[]>([]);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'identity-links' | 'consents'>('profile');

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editGender, setEditGender] = useState('MALE');
  const [editLang, setEditLang] = useState('en');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Add address state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addrType, setAddrType] = useState<AddressType>(AddressType.PERMANENT);
  const [addrLine1, setAddrLine1] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrDistrict, setAddrDistrict] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPin, setAddrPin] = useState('');
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (profile) {
      setEditFullName(profile.fullName || '');
      setEditDob(profile.dateOfBirth || '');
      setEditGender(profile.gender || 'MALE');
      setEditLang(profile.preferredLanguage || 'en');
    }
  }, [profile]);

  const loadUserData = async () => {
    setLoadingData(true);
    try {
      const [addrRes, linksRes, consentsRes] = await Promise.all([
        apiRequest<Address[]>('/me/addresses'),
        apiRequest<IdentityLink[]>('/me/identity-links'),
        apiRequest<ConsentRecord[]>('/me/consents'),
      ]);
      setAddresses(addrRes.data);
      setIdentityLinks(linksRes.data);
      setConsents(consentsRes.data);
    } catch {
      // Handled gracefully
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await apiRequest('/me/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: editFullName,
          dateOfBirth: editDob || undefined,
          gender: editGender,
          preferredLanguage: editLang,
        }),
      });
      await refreshProfile();
      setProfileMsg('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (err: any) {
      setProfileMsg('Error: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      await apiRequest('/me/addresses', {
        method: 'POST',
        body: JSON.stringify({
          addressType: addrType,
          addressLine1: addrLine1,
          city: addrCity,
          district: addrDistrict,
          state: addrState,
          postalCode: addrPin,
          isPrimary: addresses.length === 0,
        }),
      });
      setIsAddingAddress(false);
      setAddrLine1('');
      setAddrCity('');
      setAddrDistrict('');
      setAddrState('');
      setAddrPin('');
      loadUserData();
    } catch (err: any) {
      alert('Failed to save address: ' + err.message);
    } finally {
      setSavingAddr(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await apiRequest(`/me/addresses/${id}`, { method: 'DELETE' });
      loadUserData();
    } catch (err: any) {
      alert('Failed to delete address: ' + err.message);
    }
  };

  const handleRevokeConsent = async (consentId: string) => {
    if (!confirm('Revoke this consent? Future automatic data sharing for this service will be stopped.')) return;
    try {
      await apiRequest(`/me/consents/${consentId}/revoke`, { method: 'PATCH' });
      loadUserData();
    } catch (err: any) {
      alert('Failed to revoke consent: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-sanchay-navy-600 border-t-transparent rounded-full mb-3" />
        <p className="text-sm text-slate-500">Loading citizen identity context...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-sanchay-navy-50 text-sanchay-navy-700 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          🔒
        </div>
        <h1 className="text-xl font-bold text-sanchay-navy-900 mb-2">Authentication Required</h1>
        <p className="text-sm text-slate-600 mb-6">
          Please sign in with your verified Sanchay identity to access your citizen profile, documents, and consents.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Citizen Identity Header Card */}
      <div className="bg-gradient-to-r from-sanchay-navy-900 to-sanchay-navy-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-sanchay-emerald-500/20 text-sanchay-emerald-300 border border-sanchay-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sanchay-emerald-400" />
                Verified Citizen Account
              </span>
              <span className="text-xs text-slate-400">Status: {user?.status}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {profile?.fullName || 'Citizen'}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Account created: {user ? new Date().toLocaleDateString() : '-'}
            </p>
          </div>

          {/* Sanchay UID Chip */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15">
            <span className="block text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
              Sanchay UID
            </span>
            <div className="flex items-center gap-2">
              <code className="font-mono text-sm font-bold text-sanchay-gold-300">
                {user?.sanchayUid}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(user?.sanchayUid || '');
                  alert('Sanchay UID copied to clipboard!');
                }}
                className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded transition-colors"
                title="Copy UID"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      {profileMsg && (
        <div className="mb-6 p-4 rounded-xl text-xs bg-sanchay-emerald-50 text-sanchay-emerald-800 border border-sanchay-emerald-200">
          {profileMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 sm:gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-sanchay-navy-700 text-sanchay-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Personal Details
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'addresses'
              ? 'border-sanchay-navy-700 text-sanchay-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Addresses ({addresses.length})
        </button>
        <button
          onClick={() => setActiveTab('identity-links')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'identity-links'
              ? 'border-sanchay-navy-700 text-sanchay-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Identity Links ({identityLinks.length})
        </button>
        <button
          onClick={() => setActiveTab('consents')}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'consents'
              ? 'border-sanchay-navy-700 text-sanchay-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Granted Consents ({consents.filter((c) => c.status === 'GRANTED').length})
        </button>
      </div>

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-sanchay-navy-900">Personal Information</h2>
              <p className="text-xs text-slate-500">Core citizen details verified for auto-filling services.</p>
            </div>
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="text-xs bg-sanchay-navy-50 hover:bg-sanchay-navy-100 text-sanchay-navy-700 font-semibold px-3 py-1.5 rounded-lg transition-colors border border-sanchay-navy-200"
              >
                Edit Details
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sanchay-navy-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sanchay-navy-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sanchay-navy-500"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Language</label>
                <select
                  value={editLang}
                  onChange={(e) => setEditLang(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sanchay-navy-500"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 bg-sanchay-navy-700 text-white rounded-lg text-xs font-semibold hover:bg-sanchay-navy-800 disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="block text-xs text-slate-400 font-medium">Full Name</span>
                <span className="text-sm font-semibold text-slate-800">{profile?.fullName || '-'}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-medium">Date of Birth</span>
                <span className="text-sm font-semibold text-slate-800">{profile?.dateOfBirth || 'Not specified'}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-medium">Gender</span>
                <span className="text-sm font-semibold text-slate-800">{profile?.gender || 'Not specified'}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-medium">Language Preference</span>
                <span className="text-sm font-semibold text-slate-800">
                  {profile?.preferredLanguage === 'hi' ? 'हिन्दी (Hindi)' : 'English'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-sanchay-navy-900">Registered Addresses</h2>
            <button
              onClick={() => setIsAddingAddress(true)}
              className="px-3 py-1.5 bg-sanchay-navy-700 hover:bg-sanchay-navy-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              + Add Address
            </button>
          </div>

          {isAddingAddress && (
            <form onSubmit={handleCreateAddress} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">New Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Address Type</label>
                  <select
                    value={addrType}
                    onChange={(e) => setAddrType(e.target.value as AddressType)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value={AddressType.PERMANENT}>Permanent Address</option>
                    <option value={AddressType.CORRESPONDENCE}>Correspondence Address</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Postal PIN Code</label>
                  <input
                    type="text"
                    value={addrPin}
                    onChange={(e) => setAddrPin(e.target.value)}
                    placeholder="110001"
                    maxLength={6}
                    required
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Address Line 1</label>
                  <input
                    type="text"
                    value={addrLine1}
                    onChange={(e) => setAddrLine1(e.target.value)}
                    placeholder="House/Plot No, Street, Landmark"
                    required
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">City / Town</label>
                  <input
                    type="text"
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    required
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">District</label>
                  <input
                    type="text"
                    value={addrDistrict}
                    onChange={(e) => setAddrDistrict(e.target.value)}
                    required
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">State</label>
                  <input
                    type="text"
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    required
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddr}
                  className="px-3 py-1.5 bg-sanchay-emerald-600 hover:bg-sanchay-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {savingAddr ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          )}

          {addresses.length === 0 && !isAddingAddress ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs">
              No addresses saved yet. Add an address to enable one-click form filling.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sanchay-navy-700 bg-sanchay-navy-50 px-2 py-0.5 rounded">
                      {addr.addressType}
                    </span>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-xs font-medium text-slate-800">{addr.addressLine1}</p>
                  {addr.addressLine2 && <p className="text-xs text-slate-600">{addr.addressLine2}</p>}
                  <p className="text-xs text-slate-600 mt-1">
                    {addr.city}, {addr.district}, {addr.state} — <span className="font-semibold">{addr.postalCode}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Identity Links */}
      {activeTab === 'identity-links' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-sanchay-navy-900 mb-1">Connected Government Providers</h2>
          <p className="text-xs text-slate-500 mb-6">
            Authorized external identities linked to your Sanchay account for single sign-on and document verification.
          </p>

          <div className="divide-y divide-slate-100">
            {identityLinks.map((link) => (
              <div key={link.id} className="py-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900">{link.provider}</span>
                  <span className="block text-[11px] text-slate-500 font-mono">
                    Ref: {link.externalSubjectReference}
                  </span>
                </div>
                <span className="text-xs bg-sanchay-emerald-50 text-sanchay-emerald-700 border border-sanchay-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                  Verified
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Consents */}
      {activeTab === 'consents' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-sanchay-navy-900 mb-1">Purpose-Specific Data Consents</h2>
          <p className="text-xs text-slate-500 mb-6">
            You maintain complete control over which services access your citizen profile and documents. You can revoke any consent at any time.
          </p>

          {consents.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No active data consents granted yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {consents.map((c) => (
                <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{c.purpose}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'GRANTED'
                            ? 'bg-sanchay-emerald-50 text-sanchay-emerald-700 border border-sanchay-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Scope: {Array.isArray(c.scope) ? c.scope.join(', ') : c.scope} | Version: {c.version}
                    </p>
                  </div>
                  {c.status === 'GRANTED' && (
                    <button
                      onClick={() => handleRevokeConsent(c.id)}
                      className="text-xs text-red-600 hover:text-red-800 font-semibold border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Revoke Consent
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
