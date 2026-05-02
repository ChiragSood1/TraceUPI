const statusConfig = {
  FAILED: {
    bg: 'bg-status-failed/10',
    border: 'border-status-failed/20',
    text: 'text-status-failed',
    dot: 'bg-status-failed',
    label: 'Failed',
  },
  UNDER_REVIEW: {
    bg: 'bg-status-under-review/10',
    border: 'border-status-under-review/20',
    text: 'text-status-under-review',
    dot: 'bg-status-under-review',
    label: 'Under Review',
  },
  ESCALATED: {
    bg: 'bg-status-escalated/10',
    border: 'border-status-escalated/20',
    text: 'text-status-escalated',
    dot: 'bg-status-escalated',
    label: 'Escalated',
  },
  RESOLVED: {
    bg: 'bg-status-resolved/10',
    border: 'border-status-resolved/20',
    text: 'text-status-resolved',
    dot: 'bg-status-resolved',
    label: 'Resolved',
  },
  CLOSED: {
    bg: 'bg-status-closed/10',
    border: 'border-status-closed/20',
    text: 'text-status-closed',
    dot: 'bg-status-closed',
    label: 'Closed',
  },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const config = statusConfig[status] || statusConfig.CLOSED;
  const sizeClasses = size === 'lg'
    ? 'px-3.5 py-1.5 text-xs gap-2'
    : 'px-2.5 py-1 text-[11px] gap-1.5';

  return (
    <span
      className={`inline-flex items-center ${sizeClasses} rounded-lg font-semibold border ${config.bg} ${config.border} ${config.text} tracking-wide`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shadow-sm`}></span>
      {config.label}
    </span>
  );
}
