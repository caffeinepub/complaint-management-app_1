import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatComplaintNumber(num: bigint | number): string {
  const year = new Date().getFullYear();
  const n = typeof num === 'bigint' ? Number(num) : num;
  return `PSSB-${year}-${String(n).padStart(4, '0')}`;
}

export function formatTimestamp(nanoseconds: bigint): string {
  const ms = Number(nanoseconds) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function getStatusLabel(status: string, lang: 'en' | 'hi' = 'en'): string {
  const labels: Record<string, { en: string; hi: string }> = {
    pending: { en: 'Pending', hi: 'लंबित' },
    inProgress: { en: 'In Progress', hi: 'प्रगति में' },
    resolved: { en: 'Resolved', hi: 'हल किया गया' },
  };
  return labels[status]?.[lang] || status;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'inProgress': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}
