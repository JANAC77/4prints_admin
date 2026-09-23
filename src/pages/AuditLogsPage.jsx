import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  Laptop,
  Globe,
  FileCode,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Table, TableHead, TableRow, TableCell } from '../components/common/Table.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { TableSkeleton } from '../components/ui/Skeleton.jsx';
import { auditApi } from '../api/audit.api.js';
import { mockAuditLogs } from '../utils/mockData.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, formatRelativeTime } from '../utils/formatters.js';

export function AuditLogsPage() {
  const { isDemoMode } = useAuth();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const actionTypes = [
    'ALL',
    'LOGIN',
    'TFA_ENABLED',
    'TFA_DISABLED',
    'CATEGORY_CREATE',
    'CATEGORY_UPDATE',
    'CATEGORY_DELETE',
    'SUBCATEGORY_CREATE',
    'SUBCATEGORY_UPDATE',
    'SUBCATEGORY_DELETE',
    'ADMIN_CREATE',
    'ADMIN_DELETE',
  ];

  const loadAuditLogs = async () => {
    setLoading(true);
    if (isDemoMode) {
      setLogs(mockAuditLogs);
      setLoading(false);
      return;
    }

    try {
      const res = await auditApi.list({
        action: selectedAction === 'ALL' ? undefined : selectedAction,
        limit: 100,
      });
      if (res.success && Array.isArray(res.logs)) {
        setLogs(res.logs);
      } else {
        setLogs(mockAuditLogs);
      }
    } catch (err) {
      console.warn('Fallback to mock audit logs:', err);
      setLogs(mockAuditLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [isDemoMode, selectedAction]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        (log.adminEmail && log.adminEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.ip && log.ip.includes(searchQuery)) ||
        (log.targetType && log.targetType.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.action && log.action.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesAction =
        selectedAction === 'ALL' || log.action === selectedAction;

      return matchesSearch && matchesAction;
    });
  }, [logs, searchQuery, selectedAction]);

  const getActionBadgeVariant = (action) => {
    if (action?.includes('CREATE')) return 'success';
    if (action?.includes('UPDATE')) return 'primary';
    if (action?.includes('DELETE')) return 'danger';
    if (action?.includes('LOGIN') || action?.includes('TFA')) return 'purple';
    return 'default';
  };

  const handleInspectLog = (log) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-slate-100">
            Security & Audit Logs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Immutable timeline of administrative operations, catalog changes, and security authentications
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={loadAuditLogs}
          isLoading={loading}
        >
          Refresh Logs
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="space-y-1 sm:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Search Audit Logs
          </label>
          <Input
            icon={Search}
            placeholder="Search by admin email, IP address, action, or target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Action Type Filter */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Filter by Action
          </label>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full rounded-xl py-2.5 px-3.5 text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          >
            {actionTypes.map((act) => (
              <option key={act} value={act}>
                {act === 'ALL' ? 'All Operations' : act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No Audit Logs Found"
          description="Try broadening your filter criteria."
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell isHeader>Action</TableCell>
              <TableCell isHeader>Admin Email</TableCell>
              <TableCell isHeader>Target Type</TableCell>
              <TableCell isHeader>IP Address</TableCell>
              <TableCell isHeader>Timestamp</TableCell>
              <TableCell isHeader className="text-right">
                Inspect
              </TableCell>
            </TableRow>
          </TableHead>
          <tbody>
            {filteredLogs.map((log, idx) => (
              <TableRow key={log._id || idx}>
                <TableCell>
                  <Badge variant={getActionBadgeVariant(log.action)} size="sm">
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                    {log.adminEmail || 'Unknown'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    ID: {log.adminId ? log.adminId.substring(0, 12) + '...' : 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {log.targetType || 'System'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                    {log.ip || '127.0.0.1'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300 block">
                      {formatRelativeTime(log.createdAt)}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <button
                    onClick={() => handleInspectLog(log)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                    title="Inspect Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      {/* INSPECT LOG MODAL */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Audit Event Details"
        description={selectedLog ? `${selectedLog.action} by ${selectedLog.adminEmail}` : ''}
        maxWidth="max-w-2xl"
        footer={
          <Button onClick={() => setIsDetailOpen(false)} size="sm">
            Close Inspector
          </Button>
        }
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            {/* Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block mb-1">Action</span>
                <Badge variant={getActionBadgeVariant(selectedLog.action)} size="sm">
                  {selectedLog.action}
                </Badge>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block mb-1">Target Type</span>
                <span className="font-mono font-semibold uppercase text-slate-800 dark:text-slate-200">
                  {selectedLog.targetType || 'N/A'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block mb-1">IP Address</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {selectedLog.ip || '127.0.0.1'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block mb-1">Timestamp</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(selectedLog.createdAt)}
                </span>
              </div>
            </div>

            {/* Client User Agent */}
            {selectedLog.userAgent && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-semibold uppercase flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5" /> Client User Agent
                </span>
                <p className="font-mono text-[11px] text-slate-600 dark:text-slate-300 break-all">
                  {selectedLog.userAgent}
                </p>
              </div>
            )}

            {/* JSON Payload Details */}
            <div className="space-y-1.5">
              <span className="text-slate-400 font-semibold uppercase flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5" /> Event Payload Data
              </span>
              <pre className="p-4 rounded-xl bg-slate-950 text-indigo-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
                {JSON.stringify(selectedLog.details || {}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
