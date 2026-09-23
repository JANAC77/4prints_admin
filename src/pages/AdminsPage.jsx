import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Mail,
  Lock,
  User,
  Shield,
  KeyRound,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Table, TableHead, TableRow, TableCell } from '../components/common/Table.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { TableSkeleton } from '../components/ui/Skeleton.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { adminApi } from '../api/admin.api.js';
import { mockAdminsList } from '../utils/mockData.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate, formatRelativeTime } from '../utils/formatters.js';

export function AdminsPage() {
  const { isDemoMode, admin: currentAdmin } = useAuth();
  const toast = useToast();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin', // 'superadmin' | 'admin' | 'editor'
  });

  const loadAdmins = async () => {
    setLoading(true);
    if (isDemoMode) {
      setAdmins(mockAdminsList);
      setLoading(false);
      return;
    }

    try {
      const res = await adminApi.listAdmins();
      if (res.success && Array.isArray(res.admins)) {
        setAdmins(res.admins);
      } else {
        setAdmins(mockAdminsList);
      }
    } catch (err) {
      console.warn('Fallback to mock admins:', err);
      setAdmins(mockAdminsList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, [isDemoMode]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
    });
    setIsAddOpen(true);
  };

  const handleOpenDelete = (admin) => {
    if (admin._id === currentAdmin?._id) {
      toast.error('You cannot delete your own admin account');
      return;
    }
    setSelectedAdmin(admin);
    setIsDeleteOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error('All fields are required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isDemoMode) {
        const newAdm = {
          _id: `admin_${Date.now()}`,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          tfaEnabled: false,
          lastLogin: null,
          createdAt: new Date().toISOString(),
        };
        setAdmins((prev) => [newAdm, ...prev]);
        toast.success(`Admin "${formData.name}" added successfully`);
      } else {
        await adminApi.createAdmin(formData);
        toast.success(`Admin account created for ${formData.email}!`);
        await loadAdmins();
      }
      setIsAddOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to create admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedAdmin) return;
    setIsSubmitting(true);
    try {
      if (isDemoMode) {
        setAdmins((prev) => prev.filter((a) => a._id !== selectedAdmin._id));
        toast.success(`Admin "${selectedAdmin.name}" removed`);
      } else {
        await adminApi.deleteAdmin(selectedAdmin._id);
        toast.success(`Admin account removed`);
        await loadAdmins();
      }
      setIsDeleteOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to delete admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-slate-100">
            Administrators & Team
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage admin credentials, role permissions, and two-factor authentication security
          </p>
        </div>

        <Button icon={UserPlus} onClick={handleOpenAdd} size="md">
          Add Administrator
        </Button>
      </div>

      {/* Admins Table */}
      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : admins.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Administrators Found"
          description="Create your first administrator team member."
          actionLabel="Add Admin"
          onAction={handleOpenAdd}
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell isHeader>Admin User</TableCell>
              <TableCell isHeader>Role</TableCell>
              <TableCell isHeader>Two-Factor Auth</TableCell>
              <TableCell isHeader>Last Login</TableCell>
              <TableCell isHeader>Created On</TableCell>
              <TableCell isHeader className="text-right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <tbody>
            {admins.map((adm) => {
              const isSelf = adm._id === currentAdmin?._id;

              return (
                <TableRow key={adm._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 uppercase shadow-md shadow-indigo-500/20">
                        {adm.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {adm.name}
                          </span>
                          {isSelf && (
                            <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">{adm.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        adm.role === 'superadmin'
                          ? 'purple'
                          : adm.role === 'admin'
                          ? 'primary'
                          : 'default'
                      }
                      size="sm"
                      className="uppercase"
                    >
                      {adm.role || 'Admin'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {adm.tfaEnabled ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                        Disabled
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {adm.lastLogin ? formatRelativeTime(adm.lastLogin) : 'Never'}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {formatDate(adm.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {!isSelf && (
                      <button
                        onClick={() => handleOpenDelete(adm)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </tbody>
        </Table>
      )}

      {/* ADD ADMIN MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Administrator"
        description="Grant administrative dashboard access to a new staff member."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-admin-form"
              isLoading={isSubmitting}
            >
              Create Administrator
            </Button>
          </>
        }
      >
        <form
          id="add-admin-form"
          onSubmit={handleAddSubmit}
          className="space-y-4"
        >
          <Input
            label="Full Name"
            icon={User}
            placeholder="e.g. John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="john@4prints.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Initial Password"
            type="password"
            icon={Lock}
            placeholder="Minimum 8 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Role Permission
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-xl py-2.5 px-3.5 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="admin">Admin (Standard Access)</option>
              <option value="superadmin">Superadmin (Full Access & Team Management)</option>
              <option value="editor">Editor (Catalog & Content Only)</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Remove Administrator?"
        description="This action will revoke all administrative access."
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteSubmit}
              isLoading={isSubmitting}
            >
              Revoke & Delete
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Are you sure you want to remove{' '}
            <strong className="text-slate-900 dark:text-slate-100">
              {selectedAdmin?.name} ({selectedAdmin?.email})
            </strong>
            ?
          </p>
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            ⚠️ The user will immediately be logged out and cannot sign in again unless re-invited.
          </div>
        </div>
      </Modal>
    </div>
  );
}
