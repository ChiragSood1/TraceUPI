import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTransactions } from '../api/api';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

const statuses = ['FAILED', 'UNDER_REVIEW', 'ESCALATED', 'RESOLVED', 'CLOSED'];
const statusLabels = {
  FAILED: 'Failed',
  UNDER_REVIEW: 'Under Review',
  ESCALATED: 'Escalated',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const addToast = useToast();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllTransactions();
      setTransactions(data);
    } catch { addToast('Failed to load dashboard data', 'error'); }
    finally { setLoading(false); }
  };

  const getCounts = () => {
    const counts = {};
    statuses.forEach((s) => { counts[s] = transactions.filter((t) => t.status === s).length; });
    return counts;
  };

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const counts = getCounts();
  const total = transactions.length;

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          {total > 0 && (
            <span className="text-[11px] font-semibold text-dark-400 bg-dark-800 px-2.5 py-1 rounded-md border border-white/[0.04]">
              {total} total
            </span>
          )}
        </div>
        <p className="text-[13px] text-dark-500">Monitor and manage UPI transaction failures in real-time</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8 stagger">
        {statuses.map((status) => (
          <SummaryCard key={status} status={status} count={counts[status]} label={statusLabels[status]} />
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-white">Recent Transactions</h2>
            <p className="text-[11px] text-dark-500 mt-0.5">Latest failed UPI transactions</p>
          </div>
          <button
            onClick={() => navigate('/transactions')}
            className="text-[12px] text-accent-light hover:text-accent font-semibold transition-colors flex items-center gap-1 group"
          >
            View All
            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-dark-800 border border-white/[0.04] flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-dark-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
              </svg>
            </div>
            <p className="text-[14px] font-semibold text-dark-300">No transactions yet</p>
            <p className="text-[12px] text-dark-500 mt-1">Create a failed transaction to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.03]">
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-dark-500 uppercase tracking-[0.1em]">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-dark-500 uppercase tracking-[0.1em]">Amount</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-dark-500 uppercase tracking-[0.1em]">Status</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-dark-500 uppercase tracking-[0.1em]">Failure Reason</th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold text-dark-500 uppercase tracking-[0.1em]">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((txn) => (
                  <tr
                    key={txn.transactionId}
                    onClick={() => navigate(`/transactions/${txn.transactionId}`)}
                    className="table-row-hover cursor-pointer border-b border-white/[0.02] last:border-0"
                  >
                    <td className="px-6 py-3.5 text-[13px] font-mono text-accent-light font-medium">{txn.transactionId}</td>
                    <td className="px-6 py-3.5 text-[13px] font-semibold text-white tabular-nums">₹{txn.amount?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={txn.status} /></td>
                    <td className="px-6 py-3.5 text-[13px] text-dark-300">{txn.failureReason}</td>
                    <td className="px-6 py-3.5 text-[12px] text-dark-500 whitespace-nowrap">
                      {new Date(txn.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
