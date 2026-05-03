import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTransactions, createTransaction } from '../api/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

const statusOptions = ['ALL', 'FAILED', 'UNDER_REVIEW', 'ESCALATED', 'RESOLVED', 'CLOSED'];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const addToast = useToast();

  useEffect(() => { fetchTransactions(); }, [filter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getAllTransactions(filter === 'ALL' ? '' : filter);
      setTransactions(data);
    } catch { addToast('Failed to load transactions', 'error'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (formData) => {
    try {
      await createTransaction(formData);
      addToast('Transaction created successfully', 'success');
      setShowModal(false);
      fetchTransactions();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create transaction', 'error');
    }
  };

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transactions</h1>
          <p className="text-[13px] text-dark-500 mt-1">Track and manage failed UPI transactions</p>
        </div>
        <button id="create-transaction-btn" onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-accent hover:bg-accent-dark text-white text-[13px] font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent/20 active:scale-[0.97] flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1">
        {statusOptions.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-200 whitespace-nowrap ${
              filter === s
                ? 'bg-accent/15 text-accent-light border border-accent/20'
                : 'text-dark-400 hover:text-dark-200 hover:bg-white/[0.03] border border-transparent'
            }`}>
            {s === 'ALL' ? 'All' : s === 'UNDER_REVIEW' ? 'Under Review' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner text="Loading transactions..." /> : transactions.length === 0 ? (
        <div className="glass rounded-2xl px-6 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-dark-800 border border-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-dark-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
            </svg>
          </div>
          <p className="text-[14px] font-semibold text-dark-300">No transactions found</p>
          <p className="text-[12px] text-dark-500 mt-1">
            {filter !== 'ALL' ? `No transactions with status "${filter.replace('_', ' ')}"` : 'Create your first failed transaction to get started'}
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-dark-500 uppercase tracking-[0.1em]">Transaction ID</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-dark-500 uppercase tracking-[0.1em]">Amount</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-dark-500 uppercase tracking-[0.1em]">Sender</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-dark-500 uppercase tracking-[0.1em]">Receiver</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-dark-500 uppercase tracking-[0.1em]">Status</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-dark-500 uppercase tracking-[0.1em]">Reason</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-semibold text-dark-500 uppercase tracking-[0.1em]">Created</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.transactionId} onClick={() => navigate(`/transactions/${txn.transactionId}`)}
                    className="table-row-hover cursor-pointer border-b border-white/[0.02] last:border-0">
                    <td className="px-6 py-3.5 text-[13px] font-mono text-accent-light font-medium">{txn.transactionId}</td>
                    <td className="px-6 py-3.5 text-[13px] font-semibold text-white tabular-nums">₹{txn.amount?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-3.5 text-[13px] text-dark-300">{txn.senderUpi}</td>
                    <td className="px-6 py-3.5 text-[13px] text-dark-300">{txn.receiverUpi}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={txn.status} /></td>
                    <td className="px-6 py-3.5 text-[13px] text-dark-400 max-w-[180px] truncate">{txn.failureReason}</td>
                    <td className="px-6 py-3.5 text-[12px] text-dark-500 whitespace-nowrap">
                      {new Date(txn.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && <CreateModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />}
    </div>
  );
}

function CreateModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ transactionId: '', amount: '', senderUpi: '', receiverUpi: '', failureReason: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ ...form, amount: parseFloat(form.amount) });
    setSubmitting(false);
  };

  const Field = ({ label, name, type = 'text', placeholder, ...props }) => (
    <div>
      <label className="block text-[12px] font-semibold text-dark-300 mb-1.5 tracking-wide">{label}</label>
      <input type={type} placeholder={placeholder} value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })} required
        className="w-full px-4 py-2.5 bg-dark-950 border border-white/[0.06] rounded-xl text-dark-200 text-[13px] placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all"
        {...props} />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-dark-950/80 backdrop-blur-md" onClick={onClose}>
      <div className="glass-strong rounded-2xl w-full max-w-lg mx-4 p-7 animate-fade-up shadow-2xl shadow-dark-950/50 border-gradient" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[17px] font-bold text-white">New Failed Transaction</h2>
            <p className="text-[11px] text-dark-500 mt-0.5">Log a new UPI failure for tracking</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-white transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Transaction ID" name="transactionId" placeholder="e.g. UPI1234567890" />
          <Field label="Amount (₹)" name="amount" type="number" placeholder="1500.00" min="0.01" step="0.01" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sender UPI" name="senderUpi" placeholder="user@paytm" />
            <Field label="Receiver UPI" name="receiverUpi" placeholder="shop@ybl" />
          </div>
          <Field label="Failure Reason" name="failureReason" placeholder="e.g. Bank Server Down, Timeout" />
          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-dark-800 text-dark-300 rounded-xl text-[13px] font-semibold hover:bg-dark-700 transition-all border border-white/[0.04]">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-accent text-white rounded-xl text-[13px] font-semibold hover:bg-accent-dark transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-accent/20">
              {submitting ? 'Creating...' : 'Create Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
