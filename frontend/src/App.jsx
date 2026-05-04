import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { ToastProvider } from './components/Toast';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import Notifications from './pages/Notifications';

export default function App() {
  return (
    <ToastProvider>
      <div className="relative min-h-screen bg-dark-950">
        {/* Ambient background orbs */}
        <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-accent/[0.03] rounded-full blur-[150px] pointer-events-none"></div>
        <div className="fixed bottom-0 left-1/3 w-[500px] h-[500px] bg-cyan/[0.02] rounded-full blur-[120px] pointer-events-none"></div>

        <Sidebar />
        <main className="relative z-10 ml-[260px] py-8 px-10 min-h-screen overflow-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/:id" element={<TransactionDetail />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}
