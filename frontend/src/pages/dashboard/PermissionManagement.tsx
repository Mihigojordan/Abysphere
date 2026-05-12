import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Users,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Loader2,
  Search,
  FolderLock,
} from 'lucide-react';
import useAdminAuth from '../../context/AdminAuthContext';
import permissionService from '../../services/permissionService';
import type { PermissionTemplate } from '../../types/model';
import type { EmployeeWithAssignment } from '../../services/permissionService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SystemFeature {
  id: string;
  name: string;
  description?: string;
}

interface AdminUser {
  features?: SystemFeature[];
  [key: string]: unknown;
}

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ActionToggles {
  canViewOwn: boolean;
  canViewAll: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FEATURE_LABELS: Record<string, string> = {
  DEPARTMENTS_MANAGEMENT: 'Departments',
  EMPLOYEES_MANAGEMENT: 'Employees',
  CLIENTS_MANAGEMENT: 'Clients',
  CATEGORY_MANAGEMENT: 'Categories',
  SUPPLIER_MANAGEMENT: 'Suppliers',
  STOCKIN_MANAGEMENT: 'Stock In',
  STOCKOUT_MANAGEMENT: 'Stock Out',
  SALES_RETURN_MANAGEMENT: 'Sales Returns',
  VIEW_SALES_REPORTS: 'Sales Reports',
  VIEW_INVENTORY_REPORTS: 'Inventory Reports',
};

const ACTION_LABELS: Array<{ key: keyof ActionToggles; label: string }> = [
  { key: 'canViewOwn', label: 'View Own' },
  { key: 'canViewAll', label: 'View All' },
  { key: 'canCreate', label: 'Create' },
  { key: 'canUpdate', label: 'Update' },
  { key: 'canDelete', label: 'Delete' },
];

const EMPTY_TOGGLES: ActionToggles = {
  canViewOwn: false,
  canViewAll: false,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ActionToggle: React.FC<{
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}> = ({ label, value, onChange, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => onChange(!value)}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-150 select-none ${
      value
        ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
        : 'bg-theme-bg-secondary border-theme-border text-theme-text-secondary hover:border-primary-300'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {value ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
    {label}
  </button>
);

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  loading?: boolean;
}> = ({ checked, onChange, loading }) => (
  <button
    type="button"
    onClick={() => !loading && onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
      checked ? 'bg-primary-500' : 'bg-gray-300'
    } ${loading ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
    {loading && (
      <span className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="w-3 h-3 text-white animate-spin" />
      </span>
    )}
  </button>
);

// ─── Toast ────────────────────────────────────────────────────────────────────

let _toastId = 0;

const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((type: Toast['type'], message: string) => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return { toasts, add };
};

const ToastContainer: React.FC<{ toasts: Toast[] }> = ({ toasts }) => (
  <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white pointer-events-auto transition-all duration-300 ${
          t.type === 'success'
            ? 'bg-green-500'
            : t.type === 'error'
            ? 'bg-red-500'
            : 'bg-blue-500'
        }`}
      >
        {t.type === 'success' ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : t.type === 'error' ? (
          <XCircle className="w-4 h-4" />
        ) : (
          <AlertTriangle className="w-4 h-4" />
        )}
        {t.message}
      </div>
    ))}
  </div>
);

// ─── Template Form Modal ──────────────────────────────────────────────────────

interface TemplateFormProps {
  features: SystemFeature[];
  initial?: PermissionTemplate | null;
  onSave: (data: {
    name: string;
    description: string;
    featureName: string;
  } & ActionToggles) => Promise<void>;
  onClose: () => void;
}

const TemplateFormModal: React.FC<TemplateFormProps> = ({
  features,
  initial,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [featureName, setFeatureName] = useState(initial?.featureName ?? features[0]?.name ?? '');
  const [actions, setActions] = useState<ActionToggles>({
    canViewOwn: initial?.canViewOwn ?? false,
    canViewAll: initial?.canViewAll ?? false,
    canCreate: initial?.canCreate ?? false,
    canUpdate: initial?.canUpdate ?? false,
    canDelete: initial?.canDelete ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErr('Name is required'); return; }
    if (!featureName) { setErr('Select a feature'); return; }
    setSaving(true);
    setErr('');
    try {
      await onSave({ name: name.trim(), description: description.trim(), featureName, ...actions });
      onClose();
    } catch (ex: any) {
      setErr(ex?.response?.data?.message ?? ex?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-theme-bg-primary rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border">
          <h2 className="text-lg font-semibold text-theme-text-primary">
            {initial ? 'Edit Permission' : 'Create Permission'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-theme-bg-tertiary">
            <X className="w-5 h-5 text-theme-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Feature selector — locked when editing */}
          <div>
            <label className="text-sm font-medium text-theme-text-secondary mb-1 block">Feature</label>
            <select
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
              disabled={!!initial}
              className="w-full px-3 py-2 rounded-lg border border-theme-border bg-theme-bg-secondary text-theme-text-primary text-sm disabled:opacity-60"
            >
              {features.map((f) => (
                <option key={f.id} value={f.name}>
                  {FEATURE_LABELS[f.name] ?? f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-theme-text-secondary mb-1 block">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Stock Manager"
              className="w-full px-3 py-2 rounded-lg border border-theme-border bg-theme-bg-secondary text-theme-text-primary text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-theme-text-secondary mb-1 block">
              Description <span className="text-xs font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What can someone with this permission do?"
              className="w-full px-3 py-2 rounded-lg border border-theme-border bg-theme-bg-secondary text-theme-text-primary text-sm resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-theme-text-secondary mb-2 block">Allowed Actions</label>
            <div className="flex flex-wrap gap-2">
              {ACTION_LABELS.map(({ key, label }) => (
                <ActionToggle
                  key={key}
                  label={label}
                  value={actions[key]}
                  onChange={(v) => setActions((a) => ({ ...a, [key]: v }))}
                />
              ))}
            </div>
          </div>

          {err && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> {err}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-theme-border text-sm font-medium text-theme-text-secondary hover:bg-theme-bg-tertiary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {initial ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Tab 1: Create & Manage Templates ────────────────────────────────────────

interface Tab1Props {
  features: SystemFeature[];
  templates: PermissionTemplate[];
  onCreated: (t: PermissionTemplate) => void;
  onUpdated: (t: PermissionTemplate) => void;
  onDeleted: (id: string) => void;
  toast: (type: Toast['type'], msg: string) => void;
}

const Tab1: React.FC<Tab1Props> = ({
  features,
  templates,
  onCreated,
  onUpdated,
  onDeleted,
  toast,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PermissionTemplate | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filterFeature, setFilterFeature] = useState<string>('ALL');

  const visible = filterFeature === 'ALL'
    ? templates
    : templates.filter((t) => t.featureName === filterFeature);

  const handleSave = async (data: Parameters<TemplateFormProps['onSave']>[0]) => {
    if (editing) {
      const updated = await permissionService.updateTemplate(editing.id, {
        name: data.name,
        description: data.description,
        canViewOwn: data.canViewOwn,
        canViewAll: data.canViewAll,
        canCreate: data.canCreate,
        canUpdate: data.canUpdate,
        canDelete: data.canDelete,
      });
      onUpdated(updated);
      toast('success', 'Permission updated');
    } else {
      const created = await permissionService.createTemplate(data);
      onCreated(created);
      toast('success', 'Permission created');
    }
    setEditing(null);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await permissionService.deleteTemplate(id);
      onDeleted(id);
      toast('success', 'Permission deleted');
    } catch (ex: any) {
      toast('error', ex?.response?.data?.message ?? 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterFeature}
          onChange={(e) => setFilterFeature(e.target.value)}
          className="px-3 py-2 rounded-lg border border-theme-border bg-theme-bg-secondary text-theme-text-primary text-sm"
        >
          <option value="ALL">All Features</option>
          {features.map((f) => (
            <option key={f.id} value={f.name}>
              {FEATURE_LABELS[f.name] ?? f.name}
            </option>
          ))}
        </select>

        <div className="ml-auto">
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Permission
          </button>
        </div>
      </div>

      {/* Template cards */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-theme-text-secondary">
          <FolderLock className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">No permissions yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((t) => (
            <div
              key={t.id}
              className="bg-theme-bg-primary border border-theme-border rounded-xl p-4 shadow-sm flex flex-col gap-3"
            >
              {/* Feature badge + name */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 mb-1">
                    {FEATURE_LABELS[t.featureName] ?? t.featureName}
                  </span>
                  <h3 className="font-semibold text-theme-text-primary leading-tight">{t.name}</h3>
                  {t.description && (
                    <p className="text-xs text-theme-text-secondary mt-0.5 line-clamp-2">{t.description}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => { setEditing(t); setShowForm(true); }}
                    className="p-1.5 rounded-lg hover:bg-theme-bg-tertiary text-theme-text-secondary"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deleting === t.id}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 disabled:opacity-50"
                    title="Delete"
                  >
                    {deleting === t.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action chips */}
              <div className="flex flex-wrap gap-1.5">
                {ACTION_LABELS.map(({ key, label }) => (
                  <span
                    key={key}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      t[key]
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-400 line-through'
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* Assigned count */}
              <div className="flex items-center gap-1 text-xs text-theme-text-secondary border-t border-theme-border pt-2">
                <Users className="w-3.5 h-3.5" />
                <span>{t._count?.assignments ?? 0} employee(s) assigned</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <TemplateFormModal
          features={features}
          initial={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
};

// ─── Tab 2: Manage Access ─────────────────────────────────────────────────────

interface Tab2Props {
  templates: PermissionTemplate[];
  toast: (type: Toast['type'], msg: string) => void;
}

const Tab2: React.FC<Tab2Props> = ({ templates, toast }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<PermissionTemplate | null>(
    templates[0] ?? null,
  );
  const [employees, setEmployees] = useState<EmployeeWithAssignment[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Update selected when templates change (e.g. first load or after create)
  useEffect(() => {
    if (!selectedTemplate && templates.length > 0) setSelectedTemplate(templates[0]);
  }, [templates, selectedTemplate]);

  const loadEmployees = useCallback(async (template: PermissionTemplate) => {
    setLoadingEmployees(true);
    try {
      const data = await permissionService.getTemplateEmployees(template.id);
      setEmployees(data);
    } catch {
      toast('error', 'Failed to load employees');
    } finally {
      setLoadingEmployees(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedTemplate) loadEmployees(selectedTemplate);
  }, [selectedTemplate, loadEmployees]);

  const handleToggle = async (emp: EmployeeWithAssignment) => {
    if (!selectedTemplate) return;
    setTogglingId(emp.id);
    const prev = emp.isAssigned;
    // Optimistic update
    setEmployees((list) =>
      list.map((e) => (e.id === emp.id ? { ...e, isAssigned: !prev } : e)),
    );
    try {
      if (prev) {
        await permissionService.revokeTemplate(emp.id, selectedTemplate.id);
        toast('info', `Access removed from ${emp.first_name ?? emp.email}`);
      } else {
        await permissionService.assignTemplate(emp.id, selectedTemplate.id);
        toast('success', `Access granted to ${emp.first_name ?? emp.email}`);
      }
    } catch (ex: any) {
      // Revert on failure
      setEmployees((list) =>
        list.map((e) => (e.id === emp.id ? { ...e, isAssigned: prev } : e)),
      );
      toast('error', ex?.response?.data?.message ?? 'Operation failed');
    } finally {
      setTogglingId(null);
    }
  };

  // Group templates by feature
  const grouped = templates.reduce<Record<string, PermissionTemplate[]>>((acc, t) => {
    (acc[t.featureName] = acc[t.featureName] ?? []).push(t);
    return acc;
  }, {});

  const filteredEmployees = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      (e.first_name ?? '').toLowerCase().includes(q) ||
      (e.last_name ?? '').toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      (e.position ?? '').toLowerCase().includes(q)
    );
  });

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-theme-text-secondary">
        <Shield className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Create permission templates first (use the first tab).</p>
      </div>
    );
  }

  return (
    <div className="flex gap-0 h-[calc(100vh-240px)] min-h-[520px] border border-theme-border rounded-xl overflow-hidden">
      {/* Left sidebar — template list */}
      <div className="w-64 shrink-0 bg-theme-bg-secondary border-r border-theme-border overflow-y-auto">
        <div className="px-3 py-3 border-b border-theme-border">
          <p className="text-xs font-semibold uppercase tracking-wide text-theme-text-secondary">
            Permissions
          </p>
        </div>
        {Object.entries(grouped).map(([featureName, tpls]) => (
          <div key={featureName}>
            <div className="px-3 pt-3 pb-1">
              <span className="text-xs font-bold text-primary-600 uppercase tracking-wide">
                {FEATURE_LABELS[featureName] ?? featureName}
              </span>
            </div>
            {tpls.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => { setSelectedTemplate(tpl); setSearch(''); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-sm transition-colors ${
                  selectedTemplate?.id === tpl.id
                    ? 'bg-primary-500/10 text-primary-700 font-medium border-r-2 border-primary-500'
                    : 'text-theme-text-primary hover:bg-theme-bg-tertiary'
                }`}
              >
                <span className="truncate">{tpl.name}</span>
                <ChevronRight className="w-4 h-4 shrink-0 opacity-50" />
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Right — employee table */}
      <div className="flex-1 flex flex-col overflow-hidden bg-theme-bg-primary">
        {selectedTemplate && (
          <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-theme-border flex flex-wrap items-center gap-3">
              <div>
                <h3 className="font-semibold text-theme-text-primary">{selectedTemplate.name}</h3>
                <p className="text-xs text-theme-text-secondary mt-0.5">
                  {FEATURE_LABELS[selectedTemplate.featureName] ?? selectedTemplate.featureName}
                  {' · '}
                  Toggle access per employee in real-time
                </p>
              </div>

              {/* Granted action chips */}
              <div className="flex flex-wrap gap-1.5 ml-2">
                {ACTION_LABELS.map(({ key, label }) =>
                  selectedTemplate[key] ? (
                    <span key={key} className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                      {label}
                    </span>
                  ) : null,
                )}
              </div>

              {/* Search */}
              <div className="ml-auto relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-text-secondary" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search employees…"
                  className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-theme-border bg-theme-bg-secondary text-theme-text-primary w-52"
                />
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
              {loadingEmployees ? (
                <div className="flex items-center justify-center h-40 gap-2 text-theme-text-secondary">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading employees…</span>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-theme-text-secondary">
                  <Users className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">{search ? 'No matching employees' : 'No employees found'}</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-theme-bg-secondary sticky top-0 z-10">
                    <tr>
                      <th className="text-left px-5 py-3 font-semibold text-theme-text-secondary">Employee</th>
                      <th className="text-left px-4 py-3 font-semibold text-theme-text-secondary">Position</th>
                      <th className="text-left px-4 py-3 font-semibold text-theme-text-secondary">Department</th>
                      <th className="text-left px-4 py-3 font-semibold text-theme-text-secondary">Status</th>
                      <th className="text-center px-4 py-3 font-semibold text-theme-text-secondary">Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-border">
                    {filteredEmployees.map((emp) => (
                      <tr
                        key={emp.id}
                        className="hover:bg-theme-bg-secondary/50 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                              {(emp.first_name?.[0] ?? emp.email[0]).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-theme-text-primary">
                                {[emp.first_name, emp.last_name].filter(Boolean).join(' ') || '—'}
                              </p>
                              <p className="text-xs text-theme-text-secondary">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-theme-text-secondary">{emp.position || '—'}</td>
                        <td className="px-4 py-3 text-theme-text-secondary">{emp.department || '—'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                              emp.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {emp.isAssigned
                              ? <Eye className="w-4 h-4 text-primary-500" />
                              : <EyeOff className="w-4 h-4 text-gray-400" />}
                            <ToggleSwitch
                              checked={emp.isAssigned}
                              onChange={() => handleToggle(emp)}
                              loading={togglingId === emp.id}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const PermissionManagement: React.FC = () => {
  const adminAuth = useAdminAuth();
  const user = adminAuth.user as AdminUser | null;
  const companyFeatures: SystemFeature[] = (user?.features as SystemFeature[] | undefined) ?? [];

  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, add: addToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const data = await permissionService.getTemplates();
        setTemplates(data);
      } catch {
        addToast('error', 'Failed to load permissions');
      } finally {
        setLoading(false);
      }
    })();
  }, [addToast]);

  const handleCreated = (t: PermissionTemplate) =>
    setTemplates((prev) => [t, ...prev]);

  const handleUpdated = (t: PermissionTemplate) =>
    setTemplates((prev) => prev.map((p) => (p.id === t.id ? t : p)));

  const handleDeleted = (id: string) =>
    setTemplates((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <ToastContainer toasts={toasts} />

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary-100">
          <Shield className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-theme-text-primary">Permission Management</h1>
          <p className="text-sm text-theme-text-secondary">
            Define permission templates and control which employees can access each feature.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-theme-border">
        <div className="flex gap-0">
          {[
            { label: 'Create Permissions', icon: Plus },
            { label: 'Manage Access', icon: Users },
          ].map(({ label, icon: Icon }, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i as 0 | 1)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === i
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* No features warning */}
      {companyFeatures.length === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          Your company has no features assigned yet. Ask the Super Admin to assign features first.
        </div>
      )}

      {/* Tab content */}
      {loading ? (
        <div className="flex items-center justify-center h-48 gap-2 text-theme-text-secondary">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading permissions…</span>
        </div>
      ) : activeTab === 0 ? (
        <Tab1
          features={companyFeatures}
          templates={templates}
          onCreated={handleCreated}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
          toast={addToast}
        />
      ) : (
        <Tab2 templates={templates} toast={addToast} />
      )}
    </div>
  );
};

export default PermissionManagement;
