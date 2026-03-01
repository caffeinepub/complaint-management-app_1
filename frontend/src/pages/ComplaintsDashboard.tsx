import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ComplaintStatus } from '../backend';
import { useListComplaints, useListOfficers } from '../hooks/useQueries';
import { formatComplaintNumber, formatTimestamp, getStatusLabel, getStatusColor } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LayoutDashboard,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterValue = 'all' | 'pending' | 'inProgress' | 'resolved';

const statusOptions: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All Complaints' },
  { value: 'pending', label: 'Pending' },
  { value: 'inProgress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

function toComplaintStatus(filter: FilterValue): ComplaintStatus | null {
  if (filter === 'all') return null;
  if (filter === 'pending') return ComplaintStatus.pending;
  if (filter === 'inProgress') return ComplaintStatus.inProgress;
  if (filter === 'resolved') return ComplaintStatus.resolved;
  return null;
}

export default function ComplaintsDashboard() {
  const [statusFilter, setStatusFilter] = useState<FilterValue>('all');

  const { data: complaints, isLoading, isError, refetch, isFetching } = useListComplaints(
    toComplaintStatus(statusFilter)
  );
  const { data: officers } = useListOfficers();

  const officerMap = new Map(officers?.map((o) => [o.officerId, o]) ?? []);

  const stats = {
    total: complaints?.length ?? 0,
    pending: complaints?.filter((c) => c.status === ComplaintStatus.pending).length ?? 0,
    inProgress: complaints?.filter((c) => c.status === ComplaintStatus.inProgress).length ?? 0,
    resolved: complaints?.filter((c) => c.status === ComplaintStatus.resolved).length ?? 0,
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <LayoutDashboard size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Complaints Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage and track all registered complaints</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw size={14} className={cn('mr-1.5', isFetching && 'animate-spin')} />
            Refresh
          </Button>
          <Link to="/submit-complaint">
            <Button size="sm">
              <Plus size={14} className="mr-1.5" />
              New Complaint
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total"
          value={stats.total}
          icon={<FileText size={18} className="text-primary" />}
          color="bg-primary/10"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={<Clock size={18} className="text-warning" />}
          color="bg-warning/10"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={<AlertCircle size={18} className="text-primary" />}
          color="bg-primary/10"
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          icon={<CheckCircle2 size={18} className="text-success" />}
          color="bg-success/10"
        />
      </div>

      {/* Complaints Table */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText size={16} className="text-primary" />
              Complaint Records
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as FilterValue)}
              >
                <SelectTrigger className="w-44 h-8 text-sm">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-12 text-center">
              <AlertCircle size={40} className="mx-auto mb-3 text-destructive/50" />
              <p className="text-muted-foreground">Failed to load complaints. Please try again.</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : !complaints || complaints.length === 0 ? (
            <div className="p-12 text-center">
              <FileText size={40} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-medium text-foreground mb-1">No complaints found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {statusFilter !== 'all'
                  ? `No ${getStatusLabel(statusFilter)} complaints at this time.`
                  : 'No complaints have been submitted yet.'}
              </p>
              <Link to="/submit-complaint">
                <Button size="sm">
                  <Plus size={14} className="mr-1.5" />
                  Submit First Complaint
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="font-semibold text-foreground">Complaint No.</TableHead>
                    <TableHead className="font-semibold text-foreground">Applicant</TableHead>
                    <TableHead className="font-semibold text-foreground hidden sm:table-cell">Mobile</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-foreground hidden md:table-cell">
                      <span className="flex items-center gap-1">
                        <Users size={13} />
                        Assigned Officer
                      </span>
                    </TableHead>
                    <TableHead className="font-semibold text-foreground hidden lg:table-cell">Date</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => {
                    const officer = complaint.assignedOfficerId
                      ? officerMap.get(complaint.assignedOfficerId)
                      : null;
                    return (
                      <TableRow key={complaint.complaintNumber.toString()} className="hover:bg-accent/30">
                        <TableCell className="font-mono font-semibold text-primary text-sm">
                          {formatComplaintNumber(complaint.complaintNumber)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm text-foreground">{complaint.applicantName}</p>
                            <p className="text-xs text-muted-foreground">{complaint.fatherName}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm hidden sm:table-cell text-muted-foreground">
                          {complaint.mobileNumber}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
                              getStatusColor(
                                complaint.status === ComplaintStatus.pending
                                  ? 'pending'
                                  : complaint.status === ComplaintStatus.inProgress
                                  ? 'inProgress'
                                  : 'resolved'
                              )
                            )}
                          >
                            {getStatusLabel(
                              complaint.status === ComplaintStatus.pending
                                ? 'pending'
                                : complaint.status === ComplaintStatus.inProgress
                                ? 'inProgress'
                                : 'resolved'
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {officer ? (
                            <div>
                              <p className="font-medium text-foreground">{officer.name}</p>
                              <p className="text-xs text-muted-foreground">{officer.designation}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          {formatTimestamp(complaint.submissionTimestamp)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to="/complaint/$complaintNumber" params={{ complaintNumber: complaint.complaintNumber.toString() }}>
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                              <Eye size={12} />
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <div className={cn('w-8 h-8 rounded-md flex items-center justify-center', color)}>
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
