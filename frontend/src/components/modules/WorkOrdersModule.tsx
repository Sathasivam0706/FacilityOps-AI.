import React, { useState } from 'react';
import { ClipboardList, Plus, CheckCircle2, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { WorkOrder } from '../../types';
import { createWorkOrderApi } from '../../api/client';

interface WorkOrdersModuleProps {
  workOrders: WorkOrder[];
  onRefresh: () => void;
}

export const WorkOrdersModule: React.FC<WorkOrdersModuleProps> = ({ workOrders, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [equipmentName, setEquipmentName] = useState('Chiller 1');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      await createWorkOrderApi({
        title,
        equipmentName,
        priority,
        description,
        aiGenerated: false,
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            Maintenance Work Orders Queue
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Automated Work Order dispatching integrated with Express backend (`/api/workorders`).
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-cyan-300" />
          <span>New Work Order</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3.5">WO ID</th>
                <th className="p-3.5">Title & Equipment</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Assigned Tech</th>
                <th className="p-3.5">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {workOrders.map((wo) => (
                <tr key={wo.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-mono text-cyan-700 font-extrabold">{wo.id}</td>
                  <td className="p-3.5 space-y-0.5">
                    <div className="text-slate-900 font-extrabold">{wo.title}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{wo.equipmentName}</div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        wo.priority === 'urgent'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : wo.priority === 'high'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {wo.priority}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`flex items-center space-x-1 font-mono text-[11px] font-bold ${
                        wo.status === 'completed'
                          ? 'text-emerald-700'
                          : wo.status === 'in_progress'
                          ? 'text-cyan-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {wo.status === 'completed' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 animate-spin text-cyan-600" style={{ animationDuration: '8s' }} />
                      )}
                      <span className="capitalize">{wo.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-700 font-medium">{wo.assignedTechnician || 'Unassigned'}</td>
                  <td className="p-3.5">
                    {wo.aiGenerated ? (
                      <span className="inline-flex items-center space-x-1 text-[10px] bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded font-mono font-bold">
                        <Sparkles className="w-3 h-3 text-cyan-600" />
                        <span>AI Dispatched</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">Manual</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Work Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h2 className="text-base font-extrabold text-slate-900">Create New Work Order</h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Inspect Chiller 1 Motor Bearing"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Equipment Name</label>
                <input
                  type="text"
                  value={equipmentName}
                  onChange={(e) => setEquipmentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
                  placeholder="Details regarding maintenance task..."
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Submit Work Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
