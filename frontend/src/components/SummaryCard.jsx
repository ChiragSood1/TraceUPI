const cardConfig = {
  FAILED: {
    iconColor: 'text-status-failed',
    glowColor: 'bg-status-failed/8',
    countColor: 'text-status-failed',
    borderColor: 'border-status-failed/10',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
      </svg>
    ),
  },
  UNDER_REVIEW: {
    iconColor: 'text-status-under-review',
    glowColor: 'bg-status-under-review/8',
    countColor: 'text-status-under-review',
    borderColor: 'border-status-under-review/10',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
  ESCALATED: {
    iconColor: 'text-status-escalated',
    glowColor: 'bg-status-escalated/8',
    countColor: 'text-status-escalated',
    borderColor: 'border-status-escalated/10',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z" />
      </svg>
    ),
  },
  RESOLVED: {
    iconColor: 'text-status-resolved',
    glowColor: 'bg-status-resolved/8',
    countColor: 'text-status-resolved',
    borderColor: 'border-status-resolved/10',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  CLOSED: {
    iconColor: 'text-status-closed',
    glowColor: 'bg-status-closed/8',
    countColor: 'text-status-closed',
    borderColor: 'border-status-closed/10',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
};

export default function SummaryCard({ status, count, label }) {
  const config = cardConfig[status] || cardConfig.CLOSED;

  return (
    <div className={`group relative overflow-hidden rounded-2xl glass border ${config.borderColor} p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-dark-950/30 cursor-default`}>
      {/* Background glow orb */}
      <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full ${config.glowColor} blur-2xl transition-all duration-500 group-hover:w-32 group-hover:h-32 group-hover:-top-8 group-hover:-right-8`}></div>

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-dark-400 text-[11px] font-semibold uppercase tracking-[0.1em] mb-2">{label}</p>
          <p className={`text-3xl font-bold ${config.countColor} tracking-tight tabular-nums`}>
            {count}
          </p>
        </div>
        <div className={`w-10 h-10 rounded-xl ${config.glowColor} flex items-center justify-center ${config.iconColor} transition-transform duration-300 group-hover:scale-110`}>
          {config.icon}
        </div>
      </div>
    </div>
  );
}
