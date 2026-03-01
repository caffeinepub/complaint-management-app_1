import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatComplaintNumber(num: bigint | number): string {
  const n = typeof num === 'bigint' ? Number(num) : num;
  return `CMP-${new Date().getFullYear()}-${String(n).padStart(4, '0')}`;
}

export function formatTimestamp(timestamp: bigint): string {
  // Motoko Time.now() returns nanoseconds
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending': return 'Pending';
    case 'inProgress': return 'In Progress';
    case 'resolved': return 'Resolved';
    default: return status;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'bg-warning/15 text-warning border-warning/30';
    case 'inProgress': return 'bg-primary/10 text-primary border-primary/30';
    case 'resolved': return 'bg-success/15 text-success border-success/30';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}
