import { AlertTriangle } from 'lucide-react';
import { Chip } from '../ui/primitives';
import { STATUS_LABEL, URGENCY_LABEL, type CaseStatus, type Urgency } from '../../domain/personaPortal/types';
import { cn } from '../../lib/cn';

export function UrgencyBadge({ urgency, className }: { urgency: Urgency; className?: string }) {
  if (urgency === 'crisis_review') {
    return (
      <span className={cn('inline-flex items-center gap-1 rounded-pill bg-rose px-3 py-1 text-xs font-bold text-white', className)}>
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> {URGENCY_LABEL[urgency]}
      </span>
    );
  }
  return (
    <Chip tone={urgency === 'priority' ? 'butter' : 'neutral'} className={className}>
      {URGENCY_LABEL[urgency]}
    </Chip>
  );
}

const STATUS_TONE: Record<CaseStatus, 'sky' | 'lavender' | 'sage' | 'neutral'> = {
  awaiting_review: 'sky',
  in_progress: 'lavender',
  counsellor_replied: 'sage',
  closed: 'neutral',
};

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  return <Chip tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Chip>;
}

