import { useState, useEffect } from 'react';
import { getAllNotifications } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const addToast = useToast();

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getAllNotifications();
      setNotifications(data);
    } catch { addToast('Failed to load notifications', 'error'); }
    finally { setLoading(false); }
  };

  const fmt = (dt) => dt ? new Date(dt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
        <p className="text-[13px] text-dark-500 mt-1">SMS and email notification history</p>
      </div>

      {loading ? <LoadingSpinner text="Loading notifications..." /> : notifications.length === 0 ? (
        <div className="glass rounded-2xl px-6 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-dark-800 border border-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-dark-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.143 17.082a24.248 24.248 0 0 0 5.714 0m-5.714 0a1.5 1.5 0 0 1-1.488-1.32C7.52 14.822 7.5 14.076 7.5 12.75V12A4.5 4.5 0 0 1 12 7.5a4.5 4.5 0 0 1 4.5 4.5v.75c0 1.326-.02 2.072-.155 3.012A1.5 1.5 0 0 1 14.857 17.082ZM12 4.5V3m0 1.5a3.5 3.5 0 0 0-3.5 3.5" />
            </svg>
          </div>
          <p className="text-[14px] font-semibold text-dark-300">No notifications yet</p>
          <p className="text-[12px] text-dark-500 mt-1">Notifications appear here when transactions are escalated or resolved</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-dark-500 uppercase tracking-[0.1em]">Type</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-dark-500 uppercase tracking-[0.1em]">Transaction</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-dark-500 uppercase tracking-[0.1em]">Recipient</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-dark-500 uppercase tracking-[0.1em]">Message</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-dark-500 uppercase tracking-[0.1em]">Sent At</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-dark-500 uppercase tracking-[0.1em]">Status</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((n, i) => (
                  <tr key={n.id || i} className="table-row-hover border-b border-white/[0.02] last:border-0">
                    <td className="px-6 py-3.5">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                        n.type === 'SMS'
                          ? 'bg-cyan/8 border-cyan/15 text-cyan'
                          : 'bg-accent/8 border-accent/15 text-accent-light'
                      }`}>
                        {n.type === 'SMS' ? (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                          </svg>
                        )}
                        {n.type}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-[13px] font-mono text-accent-light font-medium">{n.transactionId}</td>
                    <td className="px-6 py-3.5 text-[13px] text-dark-300">{n.recipient}</td>
                    <td className="px-6 py-3.5 text-[12px] text-dark-400 max-w-[280px] truncate">{n.message}</td>
                    <td className="px-6 py-3.5 text-[12px] text-dark-500 whitespace-nowrap">{fmt(n.sentAt)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                        n.success
                          ? 'bg-status-resolved/8 border-status-resolved/15 text-status-resolved'
                          : 'bg-status-failed/8 border-status-failed/15 text-status-failed'
                      }`}>
                        {n.success ? '✓ Delivered' : '✕ Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
