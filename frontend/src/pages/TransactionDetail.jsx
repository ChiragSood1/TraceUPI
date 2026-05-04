import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransaction, updateTransactionStatus, getEscalationLogs, getTransactionNotifications } from '../api/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

const STATUS_ORDER = ['FAILED', 'UNDER_REVIEW', 'ESCALATED', 'RESOLVED', 'CLOSED'];
const getNextStatuses = (current) => {
  const idx = STATUS_ORDER.indexOf(current);
  return idx >= 0 ? STATUS_ORDER.slice(idx + 1) : [];
};

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const [txn, setTxn] = useState(null);
  const [logs, setLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [t, l, n] = await Promise.all([getTransaction(id), getEscalationLogs(id), getTransactionNotifications(id)]);
      setTxn(t); setLogs(l); setNotifications(n);
      const next = getNextStatuses(t.status);
      if (next.length > 0) setSelectedStatus(next[0]);
    } catch { addToast('Failed to load transaction details', 'error'); }
    finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    if (!selectedStatus) return;
    try {
      setUpdating(true);
      await updateTransactionStatus(id, selectedStatus);
      addToast(`Status updated to ${selectedStatus.replace('_', ' ')}`, 'success');
      fetchAll();
    } catch (err) { addToast(err.response?.data?.message || 'Status update failed', 'error'); }
    finally { setUpdating(false); }
  };

  if (loading) return <LoadingSpinner text="Loading transaction..." />;
  if (!txn) return (
    <div className="text-center py-20 animate-fade-in">
      <p className="text-dark-400 text-[14px]">Transaction not found</p>
    </div>
  );

  const nextStatuses = getNextStatuses(txn.status);
  const fmt = (dt) => dt ? new Date(dt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="animate-fade-up max-w-5xl">
      {/* Back */}
      <button onClick={() => navigate('/transactions')}
        className="text-dark-500 hover:text-accent-light text-[12px] mb-6 inline-flex items-center gap-1.5 transition-colors font-medium group">
        <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to Transactions
      </button>

      {/* Header Card */}
      <div className="glass rounded-2xl p-6 mb-4 border-gradient">
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[11px] text-dark-500 font-semibold uppercase tracking-[0.1em] mb-1">Transaction</p>
            <h1 className="text-xl font-bold font-mono text-gradient">{txn.transactionId}</h1>
            <p className="text-[24px] font-bold text-white mt-2 tabular-nums">₹{txn.amount?.toLocaleString('en-IN')}</p>
          </div>
          <StatusBadge status={txn.status} size="lg" />
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Sender UPI', value: txn.senderUpi, icon: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z' },
          { label: 'Receiver UPI', value: txn.receiverUpi, icon: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z' },
          { label: 'Failure Reason', value: txn.failureReason, icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z' },
          { label: 'Created', value: fmt(txn.createdAt), icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
        ].map((item, i) => (
          <div key={i} className="glass rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <svg className="w-3.5 h-3.5 text-dark-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <p className="text-[10px] text-dark-500 font-semibold uppercase tracking-[0.1em]">{item.label}</p>
            </div>
            <p className="text-[13px] font-medium text-dark-200 truncate">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Timestamps Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass rounded-xl p-4">
          <p className="text-[10px] text-dark-500 font-semibold uppercase tracking-[0.1em] mb-1">Updated At</p>
          <p className="text-[12px] text-dark-300">{fmt(txn.updatedAt)}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-[10px] text-dark-500 font-semibold uppercase tracking-[0.1em] mb-1">Escalated At</p>
          <p className="text-[12px] text-dark-300">{fmt(txn.escalatedAt)}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-[10px] text-dark-500 font-semibold uppercase tracking-[0.1em] mb-1">Resolved At</p>
          <p className="text-[12px] text-dark-300">{fmt(txn.resolvedAt)}</p>
        </div>
      </div>

      {/* Status Update */}
      {nextStatuses.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-[14px] font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-accent-light" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
            Update Status
          </h2>
          <div className="flex items-center gap-3">
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 max-w-xs px-4 py-2.5 bg-dark-950 border border-white/[0.06] rounded-xl text-dark-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer">
              {nextStatuses.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
            <button onClick={handleUpdate} disabled={updating}
              className="px-5 py-2.5 bg-accent text-white text-[13px] font-semibold rounded-xl hover:bg-accent-dark transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-accent/20 active:scale-[0.97]">
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Escalation Timeline */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-[14px] font-semibold text-white mb-5 flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Escalation Timeline
          </h2>
          {logs.length === 0 ? (
            <p className="text-dark-500 text-[12px]">No escalation events yet</p>
          ) : (
            <div className="space-y-0">
              {logs.map((log, i) => (
                <div key={log.id || i} className="flex gap-3.5 animate-slide-left" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-accent/10 mt-1"></div>
                    {i < logs.length - 1 && <div className="w-px flex-1 bg-gradient-to-b from-accent/20 to-transparent my-1"></div>}
                  </div>
                  <div className="pb-5">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <StatusBadge status={log.previousStatus} />
                      <svg className="w-3 h-3 text-dark-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                      <StatusBadge status={log.newStatus} />
                    </div>
                    <p className="text-[12px] text-dark-300">{log.reason}</p>
                    <p className="text-[11px] text-dark-500 mt-1">{fmt(log.escalatedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-[14px] font-semibold text-white mb-5 flex items-center gap-2">
            <svg className="w-4 h-4 text-status-under-review" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            Notifications Sent
          </h2>
          {notifications.length === 0 ? (
            <p className="text-dark-500 text-[12px]">No notifications sent yet</p>
          ) : (
            <div className="space-y-2.5">
              {notifications.map((n, i) => (
                <div key={n.id || i} className="flex items-start gap-3 p-3 rounded-xl bg-dark-950/50 border border-white/[0.03]">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.type === 'SMS' ? 'bg-cyan/10 text-cyan' : 'bg-accent/10 text-accent-light'}`}>
                    {n.type === 'SMS' ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-dark-300">{n.type}</span>
                      <span className={`text-[10px] font-semibold ${n.success ? 'text-status-resolved' : 'text-status-failed'}`}>
                        {n.success ? '✓ Delivered' : '✕ Failed'}
                      </span>
                    </div>
                    <p className="text-[11px] text-dark-400 mt-0.5 truncate">{n.recipient}</p>
                    <p className="text-[11px] text-dark-500 mt-0.5">{fmt(n.sentAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
