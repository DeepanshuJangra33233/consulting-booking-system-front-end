'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatINR } from '../../../lib/utils';
import { ServiceEntity } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

export default function AdminServicesPage() {
  const { role } = useAuth();
  const [services, setServices] = useState<ServiceEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceEntity | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    durationMinutes: 60,
    price: 2500,
    active: true,
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const list = await api.getServices();
      setServices(list);
    } catch (err: any) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      fetchServices();
    }
  }, [role]);

  const handleOpenAdd = () => {
    setEditingService(null);
    setForm({
      name: '',
      description: '',
      durationMinutes: 60,
      price: 2500,
      active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (svc: ServiceEntity) => {
    setEditingService(svc);
    setForm({
      name: svc.name,
      description: svc.description,
      durationMinutes: svc.durationMinutes,
      price: svc.price,
      active: svc.active,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.updateService(editingService.id, form);
      } else {
        await api.createService(form);
      }
      setModalOpen(false);
      await fetchServices();
    } catch (err: any) {
      alert(err.message || 'Error saving service');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service offering?')) return;
    try {
      await api.deleteService(id);
      await fetchServices();
    } catch (err: any) {
      alert(err.message || 'Error deleting service');
    }
  };

  if (role !== 'admin') {
    return <div className="max-w-md mx-auto py-20 text-center">Admin authorization required.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/admin/dashboard"
        className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Consulting Services Management
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Configure consultation packages, session durations, and fee pricing in INR (₹).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" /> Add New Service
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          Loading services...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-3">
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md text-slate-600">
                    <Clock className="w-3 h-3" /> {svc.durationMinutes} mins
                  </span>
                  <span className="text-lg font-bold text-slate-900">{formatINR(svc.price)}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">{svc.name}</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-6">{svc.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    svc.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {svc.active ? 'Active Offering' : 'Inactive'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(svc)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit Service"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(svc.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete Service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-900">
              {editingService ? 'Edit Consulting Service' : 'Create Consulting Service'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. 60 Minute Consultation"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe key outcomes and scope..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Mins) *</label>
                <input
                  type="number"
                  required
                  min={15}
                  step={15}
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹ INR) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="activeToggle"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <label htmlFor="activeToggle" className="text-xs font-semibold text-slate-700">
                Active (available for customer booking)
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow"
              >
                Save Offering
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
