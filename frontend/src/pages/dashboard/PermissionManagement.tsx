import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  ChevronRight,
  FolderLock,
  Plus,
  Trash2,
} from 'lucide-react';
import permissionService from '../../services/permissionService';
import type { PermissionTemplate } from '../../types/model';
import type { EmployeeWithAssignment } from '../../services/permissionService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

type FlagKey = 'canViewOwn' | 'canViewAll' | 'canCreate' | 'canUpdate' | 'canDelete';

// ─── Constants ────────────────────────────────────────────────────────────────

const FEATURE_LABELS: Record<string, string> = {
  DEPARTMENTS_MANAGEMENT: 'Departments',
  EMPLOYEES_MANAGEMENT: 'Employees',
  CLIENT_MANAGEMENT: 'Clients',
  CATEGORY_MANAGEMENT: 'Categories',
  SUPPLIER_MANAGEMENT: 'Suppliers',
  EXPENSE_MANAGEMENT: 'Expenses',
  STOCKIN_MANAGEMENT: 'Stock In',
  STOCKOUT_MANAGEMENT: 'Stock Out',
  SALES_RETURN_MANAGEMENT: 'Sales Returns',
  VIEW_SALES_REPORTS: 'Sales Reports',
  VIEW_INVENTORY_REPORTS: 'Inventory Reports',
};

const FLAG_LABELS: Array<{ key: FlagKey; label: string }> = [
  { key: 'canViewOwn', label: 'View Own' },
  { key: 'canViewAll', label: 'View All' },
  { key: 'canCreate', label: 'Create' },
  { key: 'canUpdate', label: 'Update' },
  { key: 'canDelete', label: 'Delete' },
];

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
        className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white pointer-events-auto ${
          t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`}
      >
        {t.type === 'success' ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <XCircle className="w-4 h-4" />
        )}
        {t.message}
      </div>
    ))}
  </div>
);

// ─── Toggle Switch ─────────────────────────────────────────────────────────────

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: () => void;
  loading?: boolean;
  disabled?: boolean;
}> = ({ checked, onChange, loading, disabled }) => (
  <button
    type="button"
    onClick={() => !loading && !disabled && onChange()}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
      checked ? 'bg-primary-500' : 'bg-gray-300'
    } ${loading ? 'opacity-60 cursor-wait' : disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
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

// ─── Main Page ────────────────────────────────────────────────────────────────

const PermissionManagement: React.FC = () => {
  const { toasts, add: toast } = useToast();

  const [templates, setTemplates] = useState<PermissionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmployeeWithAssignment[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Track which (employeeId, flagKey) is saving — key format: `${empId}:${flagKey}` or `${empId}:access`
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // ── Load templates ──────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await permissionService.getTemplates();
        setTemplates(data);
      } catch {
        toast('error', 'Failed to load permissions');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // One template per feature
  const templateMap = templates.reduce<Record<string, PermissionTemplate>>((acc, t) => {
    if (!acc[t.featureName]) acc[t.featureName] = t;
    return acc;
  }, {});

  const selectedTemplate = selectedFeature ? templateMap[selectedFeature] ?? null : null;

  // ── Load employees ──────────────────────────────────────────────────────
  const loadEmployees = useCallback(async (templateId: string) => {
    setLoadingEmployees(true);
    try {
      const data = await permissionService.getTemplateEmployees(templateId);
      setEmployees(data);
    } catch {
      toast('error', 'Failed to load employees');
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      loadEmployees(selectedTemplate.id);
    } else {
      setEmployees([]);
    }
    setSearch('');
  }, [selectedTemplate?.id]);

  // ── Create permission for feature ───────────────────────────────────────
  const handleCreate = async () => {
    if (!selectedFeature) return;
    setCreating(true);
    try {
      const label = FEATURE_LABELS[selectedFeature] ?? selectedFeature;
      const created = await permissionService.createTemplate({
        name: label,
        featureName: selectedFeature,
      });
      setTemplates((prev) => [created, ...prev]);
      toast('success', `Permission for "${label}" enabled`);
    } catch (ex: any) {
      toast('error', ex?.response?.data?.message ?? 'Failed to enable permission');
    } finally {
      setCreating(false);
    }
  };

  // ── Delete permission ───────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!selectedTemplate) return;
    if (!window.confirm(`Remove all access for "${FEATURE_LABELS[selectedFeature!] ?? selectedFeature}"? This will revoke access from all employees.`)) return;
    setDeleting(true);
    try {
      await permissionService.deleteTemplate(selectedTemplate.id);
      setTemplates((prev) => prev.filter((t) => t.id !== selectedTemplate.id));
      setEmployees([]);
      toast('info', 'Permission removed');
    } catch (ex: any) {
      toast('error', ex?.response?.data?.message ?? 'Failed to remove permission');
    } finally {
      setDeleting(false);
    }
  };

  // ── Toggle employee access (assign / revoke) ────────────────────────────
  const handleToggleAccess = async (emp: EmployeeWithAssignment) => {
    if (!selectedTemplate) return;
    const key = `${emp.id}:access`;
    setSavingKey(key);
    const wasAssigned = emp.isAssigned;

    setEmployees((list) =>
      list.map((e) =>
        e.id === emp.id
          ? {
              ...e,
              isAssigned: !wasAssigned,
              canViewOwn: false,
              canViewAll: !wasAssigned ? true : false,
              canCreate: false,
              canUpdate: false,
              canDelete: false,
            }
          : e,
      ),
    );

    try {
      if (wasAssigned) {
        await permissionService.revokeTemplate(emp.id, selectedTemplate.id);
        toast('info', `Access removed from ${emp.first_name ?? emp.email}`);
      } else {
        await permissionService.assignTemplate(emp.id, selectedTemplate.id);
        toast('success', `Access granted to ${emp.first_name ?? emp.email}`);
      }
    } catch (ex: any) {
      setEmployees((list) =>
        list.map((e) => (e.id === emp.id ? { ...e, isAssigned: wasAssigned } : e)),
      );
      toast('error', ex?.response?.data?.message ?? 'Operation failed');
    } finally {
      setSavingKey(null);
    }
  };

  // ── Toggle a single flag for an employee ───────────────────────────────
  const handleToggleFlag = async (emp: EmployeeWithAssignment, flagKey: FlagKey) => {
    if (!selectedTemplate || !emp.isAssigned) return;
    const key = `${emp.id}:${flagKey}`;
    setSavingKey(key);
    const newValue = !emp[flagKey];

    setEmployees((list) =>
      list.map((e) => (e.id === emp.id ? { ...e, [flagKey]: newValue } : e)),
    );

    try {
      await permissionService.updateAssignment(emp.id, selectedTemplate.id, {
        [flagKey]: newValue,
      });
    } catch (ex: any) {
      setEmployees((list) =>
        list.map((e) => (e.id === emp.id ? { ...e, [flagKey]: !newValue } : e)),
      );
      toast('error', ex?.response?.data?.message ?? 'Failed to update permission');
    } finally {
      setSavingKey(null);
    }
  };

  const filteredEmployees = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      (e.first_name ?? '').toLowerCase().includes(q) ||
      (e.last_name ?? '').toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      (e.position ?? '').toLowerCase().includes(q)
    );
  });

  const allFeatures = Object.entries(FEATURE_LABELS);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary-100">
          <Shield className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-theme-text-primary">Permission Management</h1>
          <p className="text-sm text-theme-text-secondary">
            Configure per-employee permissions for each feature in real-time.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 gap-2 text-theme-text-secondary">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading…</span>
        </div>
      ) : (
        <div
          className="flex gap-0 border border-theme-border rounded-xl overflow-hidden"
          style={{ height: 'calc(100vh - 230px)', minHeight: 520 }}
        >
          {/* ── Left sidebar ─────────────────────────────────────────── */}
          <div className="w-56 shrink-0 bg-theme-bg-secondary border-r border-theme-border overflow-y-auto">
            <div className="px-3 py-3 border-b border-theme-border">
              <p className="text-xs font-semibold uppercase tracking-wide text-theme-text-secondary">
                Features
              </p>
            </div>

            {allFeatures.map(([featureKey, featureLabel]) => {
              const tpl = templateMap[featureKey];
              const isSelected = selectedFeature === featureKey;
              return (
                <button
                  key={featureKey}
                  onClick={() => setSelectedFeature(featureKey)}
                  className={`w-full flex items-center justify-between px-3 py-3 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-primary-500/10 text-primary-700 font-medium border-r-2 border-primary-500'
                      : 'text-theme-text-primary hover:bg-theme-bg-tertiary'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${tpl ? 'bg-green-500' : 'bg-gray-300'}`}
                    />
                    <span className="truncate text-xs">{featureLabel}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {tpl && (
                      <span className="text-xs text-theme-text-secondary">
                        {tpl._count?.assignments ?? 0}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Right panel ──────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col overflow-hidden bg-theme-bg-primary">
            {!selectedFeature ? (
              <div className="flex flex-col items-center justify-center h-full text-theme-text-secondary">
                <FolderLock className="w-14 h-14 mb-3 opacity-20" />
                <p className="text-sm">Select a feature to manage permissions</p>
              </div>
            ) : !selectedTemplate ? (
              /* ── No template: enable panel ──────────────────────── */
              <div className="flex flex-col items-center justify-center h-full px-8">
                <div className="w-full max-w-sm text-center space-y-5">
                  <div className="p-4 rounded-full bg-gray-100 w-16 h-16 flex items-center justify-center mx-auto">
                    <Shield className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-theme-text-primary">
                      {FEATURE_LABELS[selectedFeature]} — Not configured
                    </h3>
                    <p className="text-xs text-theme-text-secondary mt-1">
                      Enable this permission to start controlling employee access.
                    </p>
                  </div>
                  <button
                    onClick={handleCreate}
                    disabled={creating}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-60 mx-auto"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Enable Permission
                  </button>
                </div>
              </div>
            ) : (
              /* ── Template exists: employee list with per-employee flags ── */
              <>
                {/* Panel header */}
                <div className="px-5 py-4 border-b border-theme-border flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-theme-text-primary text-base">
                      {FEATURE_LABELS[selectedFeature]}
                    </h3>
                    <p className="text-xs text-theme-text-secondary mt-0.5">
                      Toggle access and individual permissions per employee
                    </p>
                  </div>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Remove Permission
                  </button>
                </div>

                {/* Search */}
                <div className="px-5 py-3 border-b border-theme-border">
                  <div className="relative w-60">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-text-secondary" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search employees…"
                      className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-theme-border bg-theme-bg-secondary text-theme-text-primary w-full"
                    />
                  </div>
                </div>

                {/* Employee list */}
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
                    <table className="w-full text-xs">
                      <thead className="bg-theme-bg-secondary sticky top-0 z-10">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-theme-text-secondary">Employee</th>
                          <th className="text-left px-3 py-3 font-semibold text-theme-text-secondary">Position</th>
                          <th className="text-left px-3 py-3 font-semibold text-theme-text-secondary hidden lg:table-cell">Department</th>
                          <th className="text-center px-3 py-3 font-semibold text-theme-text-secondary">Access</th>
                          <th className="text-center px-3 py-3 font-semibold text-theme-text-secondary">View Own</th>
                          <th className="text-center px-3 py-3 font-semibold text-theme-text-secondary">View All</th>
                          <th className="text-center px-3 py-3 font-semibold text-theme-text-secondary">Create</th>
                          <th className="text-center px-3 py-3 font-semibold text-theme-text-secondary">Update</th>
                          <th className="text-center px-3 py-3 font-semibold text-theme-text-secondary">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-theme-border">
                        {filteredEmployees.map((emp) => (
                          <tr key={emp.id} className="hover:bg-theme-bg-secondary/50 transition-colors">
                            {/* Employee info */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                                  {(emp.first_name?.[0] ?? emp.email[0]).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-theme-text-primary leading-tight">
                                    {[emp.first_name, emp.last_name].filter(Boolean).join(' ') || '—'}
                                  </p>
                                  <p className="text-theme-text-secondary">{emp.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-theme-text-secondary">{emp.position || '—'}</td>
                            <td className="px-3 py-3 text-theme-text-secondary hidden lg:table-cell">{emp.department || '—'}</td>

                            {/* Master access toggle */}
                            <td className="px-3 py-3 text-center">
                              <ToggleSwitch
                                checked={emp.isAssigned}
                                onChange={() => handleToggleAccess(emp)}
                                loading={savingKey === `${emp.id}:access`}
                              />
                            </td>

                            {/* Per-flag toggles */}
                            {FLAG_LABELS.map(({ key }) => (
                              <td key={key} className="px-3 py-3 text-center">
                                <ToggleSwitch
                                  checked={emp[key]}
                                  onChange={() => handleToggleFlag(emp, key)}
                                  loading={savingKey === `${emp.id}:${key}`}
                                  disabled={!emp.isAssigned}
                                />
                              </td>
                            ))}
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
      )}
    </div>
  );
};

export default PermissionManagement;
