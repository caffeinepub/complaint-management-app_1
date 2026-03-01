import { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { ComplaintStatus } from '../backend';
import { useGetComplaint, useAssignOfficer, useListOfficers } from '../hooks/useQueries';
import { formatComplaintNumber, formatTimestamp, getStatusLabel, getStatusColor } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  FileText,
  Users,
  Download,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
  Calendar,
  Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ComplaintDetail() {
  const { complaintNumber } = useParams({ from: '/complaint/$complaintNumber' });
  const complaintNum = BigInt(complaintNumber);

  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');

  const { data: complaint, isLoading, isError, refetch } = useGetComplaint(complaintNum);
  const { data: officers } = useListOfficers();
  const assignMutation = useAssignOfficer();

  const handleAssignOfficer = async () => {
    if (!selectedOfficerId) {
      toast.error('Please select an officer to assign.');
      return;
    }
    try {
      await assignMutation.mutateAsync({
        complaintNumber: complaintNum,
        officerId: selectedOfficerId,
      });
      toast.success('Officer assigned successfully! Notifications have been recorded.');
      setSelectedOfficerId('');
      refetch();
    } catch (err) {
      toast.error('Failed to assign officer. Please try again.');
      console.error(err);
    }
  };

  const handleDownloadFile = async () => {
    if (!complaint?.attachedFile) return;
    try {
      const bytes = await complaint.attachedFile.getBytes();
      const blob = new Blob([bytes]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'complaint-attachment';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Try direct URL as fallback
      const url = complaint.attachedFile.getDirectURL();
      window.open(url, '_blank');
    }
  };

  const getStatusStr = (status: ComplaintStatus): string => {
    if (status === ComplaintStatus.pending) return 'pending';
    if (status === ComplaintStatus.inProgress) return 'inProgress';
    return 'resolved';
  };

  const assignedOfficer = complaint?.assignedOfficerId
    ? officers?.find((o) => o.officerId === complaint.assignedOfficerId)
    : null;

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !complaint) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <AlertCircle size={48} className="mx-auto mb-4 text-destructive/50" />
        <h2 className="text-xl font-semibold mb-2">Complaint Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The complaint with number {formatComplaintNumber(complaintNum)} could not be found.
        </p>
        <Link to="/dashboard">
          <Button variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const statusStr = getStatusStr(complaint.status);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Back + Header */}
      <div className="mb-6">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Hash size={16} className="text-primary" />
              <h1 className="text-2xl font-serif font-bold text-foreground">
                {formatComplaintNumber(complaint.complaintNumber)}
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border',
                  getStatusColor(statusStr)
                )}
              >
                {getStatusLabel(statusStr)}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar size={12} />
                {formatTimestamp(complaint.submissionTimestamp)}
              </span>
            </div>
          </div>
          {complaint.attachedFile && (
            <Button variant="outline" size="sm" onClick={handleDownloadFile} className="flex-shrink-0">
              <Download size={14} className="mr-1.5" />
              Download Attachment
            </Button>
          )}
        </div>
      </div>

      {/* Applicant Info */}
      <Card className="shadow-card mb-5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User size={16} className="text-primary" />
            Applicant Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField label="Applicant Name" value={complaint.applicantName} icon={<User size={13} />} />
            <InfoField label="Father's Name" value={complaint.fatherName} icon={<Users size={13} />} />
            <InfoField label="Mobile Number" value={complaint.mobileNumber} icon={<Phone size={13} />} />
            <InfoField
              label="Address"
              value={complaint.address}
              icon={<MapPin size={13} />}
              className="sm:col-span-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Complaint Detail */}
      <Card className="shadow-card mb-5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            Complaint Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 rounded-lg p-4 border border-border">
            {complaint.complaintDetail}
          </p>
        </CardContent>
      </Card>

      {/* Officer Assignment */}
      <Card className="shadow-card mb-5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserCheck size={16} className="text-primary" />
            Officer Assignment
          </CardTitle>
          <CardDescription>
            {assignedOfficer
              ? 'An officer has been assigned to this complaint'
              : 'Assign an officer to handle this complaint'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignedOfficer && (
            <div className="flex items-start gap-3 p-4 bg-success/5 border border-success/20 rounded-lg mb-4">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <UserCheck size={18} className="text-success" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{assignedOfficer.name}</p>
                <p className="text-sm text-muted-foreground">{assignedOfficer.designation}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Phone size={11} />
                  {assignedOfficer.mobileNumber}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Select value={selectedOfficerId} onValueChange={setSelectedOfficerId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={assignedOfficer ? 'Reassign to another officer...' : 'Select an officer...'} />
              </SelectTrigger>
              <SelectContent>
                {!officers || officers.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    No officers available
                  </SelectItem>
                ) : (
                  officers.map((officer) => (
                    <SelectItem key={officer.officerId} value={officer.officerId}>
                      <div className="flex flex-col">
                        <span className="font-medium">{officer.name}</span>
                        <span className="text-xs text-muted-foreground">{officer.designation}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAssignOfficer}
              disabled={!selectedOfficerId || assignMutation.isPending}
              className="flex-shrink-0"
            >
              {assignMutation.isPending ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <UserCheck size={16} className="mr-2" />
              )}
              {assignedOfficer ? 'Reassign' : 'Assign'}
            </Button>
          </div>

          {!officers || officers.length === 0 ? (
            <p className="text-xs text-muted-foreground mt-2">
              No officers registered.{' '}
              <Link to="/officers" className="text-primary hover:underline">
                Add officers first
              </Link>
              .
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* Notification Log */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell size={16} className="text-primary" />
            Notification Log
          </CardTitle>
          <CardDescription>
            {complaint.notificationLog.length} notification{complaint.notificationLog.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {complaint.notificationLog.length === 0 ? (
            <div className="text-center py-6">
              <Bell size={28} className="mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-0">
              {[...complaint.notificationLog]
                .sort((a, b) => Number(b.timestamp - a.timestamp))
                .map((notification, index, arr) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {notification.message.toLowerCase().includes('assigned') ? (
                          <UserCheck size={14} className="text-primary" />
                        ) : (
                          <CheckCircle2 size={14} className="text-success" />
                        )}
                      </div>
                      {index < arr.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-1 mb-1 min-h-[16px]" />
                      )}
                    </div>
                    <div className="pb-4 flex-1">
                      <p className="text-sm text-foreground leading-relaxed">{notification.message}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock size={11} />
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoField({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value || '—'}</p>
    </div>
  );
}
