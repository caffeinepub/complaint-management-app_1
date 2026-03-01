import { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { ComplaintStatus } from '../backend';
import {
  useGetComplaint,
  useAssignOfficer,
  useListOfficers,
  useRecordAttendance,
  useUpdateComplaintStatus,
} from '../hooks/useQueries';
import { formatComplaintNumber, formatTimestamp, getStatusLabel, getStatusColor } from '../lib/utils';
import { generateComplaintPDF } from '../lib/pdfGenerator';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  ClipboardCheck,
  FileBadge,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ComplaintDetail() {
  const { complaintNumber } = useParams({ from: '/layout/complaint/$complaintNumber' });
  const complaintNum = BigInt(complaintNumber);
  const { session } = useAuth();
  const isAdmin = session?.role === 'admin';

  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');

  // Attendance form state
  const [attendedBy, setAttendedBy] = useState('');
  const [attendanceDate, setAttendanceDate] = useState('');
  const [attendanceTime, setAttendanceTime] = useState('');
  const [attendanceRemarks, setAttendanceRemarks] = useState('');
  const [attendanceErrors, setAttendanceErrors] = useState<Record<string, string>>({});

  // Status update form state
  const [statusUpdateStatus, setStatusUpdateStatus] = useState<ComplaintStatus | ''>('');
  const [statusUpdatedBy, setStatusUpdatedBy] = useState('');
  const [statusDetails, setStatusDetails] = useState('');
  const [statusErrors, setStatusErrors] = useState<Record<string, string>>({});

  const { data: complaint, isLoading, isError, refetch } = useGetComplaint(complaintNum);
  const { data: officers } = useListOfficers();
  const assignMutation = useAssignOfficer();
  const recordAttendanceMutation = useRecordAttendance();
  const updateStatusMutation = useUpdateComplaintStatus();

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
      const url = complaint.attachedFile.getDirectURL();
      window.open(url, '_blank');
    }
  };

  const handleDownloadPDF = () => {
    if (!complaint) return;
    const officerName = assignedOfficer?.name;
    generateComplaintPDF(complaint, officerName);
  };

  const validateAttendance = (): boolean => {
    const errs: Record<string, string> = {};
    if (!attendedBy.trim()) errs.attendedBy = 'Attended by is required';
    if (!attendanceDate) errs.attendanceDate = 'Date is required';
    if (!attendanceTime) errs.attendanceTime = 'Time is required';
    setAttendanceErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRecordAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAttendance()) return;
    try {
      await recordAttendanceMutation.mutateAsync({
        complaintNumber: complaintNum,
        attendedBy: attendedBy.trim(),
        attendanceDate,
        attendanceTime,
        remarks: attendanceRemarks.trim() || null,
      });
      toast.success('Attendance recorded successfully!');
      setAttendedBy('');
      setAttendanceDate('');
      setAttendanceTime('');
      setAttendanceRemarks('');
      setAttendanceErrors({});
    } catch (err) {
      toast.error('Failed to record attendance. Please try again.');
      console.error(err);
    }
  };

  const validateStatusUpdate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!statusUpdateStatus) errs.status = 'Status is required';
    if (!statusUpdatedBy.trim()) errs.updatedBy = 'Updated by is required';
    if (!statusDetails.trim()) errs.details = 'Details / Remarks are required';
    setStatusErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStatusUpdate()) return;
    try {
      await updateStatusMutation.mutateAsync({
        complaintNumber: complaintNum,
        newStatus: statusUpdateStatus as ComplaintStatus,
        updatedBy: statusUpdatedBy.trim(),
        details: statusDetails.trim(),
      });
      toast.success('Complaint status updated successfully!');
      setStatusUpdateStatus('');
      setStatusUpdatedBy('');
      setStatusDetails('');
      setStatusErrors({});
    } catch (err) {
      toast.error('Failed to update status. Please try again.');
      console.error(err);
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
  const sortedStatusLog = complaint.statusLog ? [...complaint.statusLog].reverse() : [];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Back + Header */}
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
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
          <div className="flex gap-2 flex-wrap">
            {complaint.attachedFile && (
              <Button variant="outline" size="sm" onClick={handleDownloadFile} className="flex-shrink-0">
                <Download size={14} className="mr-1.5" />
                Attachment
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="flex-shrink-0">
              <FileBadge size={14} className="mr-1.5" />
              Download PDF
            </Button>
          </div>
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

      {/* Officer Assignment (admin only) */}
      {isAdmin && (
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
                  <SelectValue
                    placeholder={
                      assignedOfficer ? 'Reassign to another officer...' : 'Select an officer...'
                    }
                  />
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
      )}

      {/* Update Status (admin only) */}
      {isAdmin && (
        <Card className="shadow-card mb-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity size={16} className="text-primary" />
              Update Status
            </CardTitle>
            <CardDescription>
              Update the complaint status and record progress or resolution details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Status Log History */}
            {sortedStatusLog.length > 0 ? (
              <div className="mb-5 rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Updated By</TableHead>
                      <TableHead className="text-xs">Date & Time</TableHead>
                      <TableHead className="text-xs">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedStatusLog.map((entry, idx) => {
                      const entryStatusStr = getStatusStr(entry.status);
                      return (
                        <TableRow key={idx}>
                          <TableCell>
                            <span
                              className={cn(
                                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
                                getStatusColor(entryStatusStr)
                              )}
                            >
                              {getStatusLabel(entryStatusStr)}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm font-medium">{entry.updatedBy}</TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatTimestamp(entry.updatedAt)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">
                            {entry.details || '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6 mb-4 bg-muted/20 rounded-lg border border-dashed border-border">
                <Activity size={28} className="mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No status updates recorded yet</p>
              </div>
            )}

            <Separator className="mb-4" />

            {/* Status Update Form */}
            <p className="text-sm font-semibold text-foreground mb-3">Record Status Update</p>
            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="statusSelect" className="text-xs font-medium">
                  New Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={statusUpdateStatus}
                  onValueChange={(val) => {
                    setStatusUpdateStatus(val as ComplaintStatus);
                    setStatusErrors((p) => ({ ...p, status: '' }));
                  }}
                >
                  <SelectTrigger
                    id="statusSelect"
                    className={cn('h-9', statusErrors.status ? 'border-destructive' : '')}
                  >
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ComplaintStatus.pending}>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-warning inline-block" />
                        Pending
                      </span>
                    </SelectItem>
                    <SelectItem value={ComplaintStatus.inProgress}>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                        In Progress
                      </span>
                    </SelectItem>
                    <SelectItem value={ComplaintStatus.resolved}>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success inline-block" />
                        Resolved
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {statusErrors.status && (
                  <p className="text-xs text-destructive">{statusErrors.status}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="statusUpdatedBy" className="text-xs font-medium">
                  Updated By <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="statusUpdatedBy"
                  placeholder="Enter name of person updating status"
                  value={statusUpdatedBy}
                  onChange={(e) => {
                    setStatusUpdatedBy(e.target.value);
                    setStatusErrors((p) => ({ ...p, updatedBy: '' }));
                  }}
                  className={cn('h-9', statusErrors.updatedBy ? 'border-destructive' : '')}
                />
                {statusErrors.updatedBy && (
                  <p className="text-xs text-destructive">{statusErrors.updatedBy}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="statusDetails" className="text-xs font-medium">
                  Details / Remarks <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="statusDetails"
                  placeholder="Enter details about the status update, actions taken, or resolution notes..."
                  value={statusDetails}
                  onChange={(e) => {
                    setStatusDetails(e.target.value);
                    setStatusErrors((p) => ({ ...p, details: '' }));
                  }}
                  rows={3}
                  className={cn(statusErrors.details ? 'border-destructive' : '')}
                />
                {statusErrors.details && (
                  <p className="text-xs text-destructive">{statusErrors.details}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={updateStatusMutation.isPending}
                className="w-full sm:w-auto"
              >
                {updateStatusMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <RefreshCw size={16} className="mr-2" />
                )}
                Update Status
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Attendance Log (admin only) */}
      {isAdmin && (
        <Card className="shadow-card mb-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardCheck size={16} className="text-primary" />
              Attendance Log
            </CardTitle>
            <CardDescription>
              Record and view attendance for this complaint
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Attendance Table */}
            {complaint.attendanceLog && complaint.attendanceLog.length > 0 ? (
              <div className="mb-5 rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs">Attended By</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Time</TableHead>
                      <TableHead className="text-xs">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaint.attendanceLog.map((log, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm font-medium">{log.attendedBy}</TableCell>
                        <TableCell className="text-sm">{log.attendanceDate}</TableCell>
                        <TableCell className="text-sm">{log.attendanceTime}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.remarks ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6 mb-4 bg-muted/20 rounded-lg border border-dashed border-border">
                <ClipboardCheck size={28} className="mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No attendance records yet</p>
              </div>
            )}

            <Separator className="mb-4" />

            {/* Record Attendance Form */}
            <p className="text-sm font-semibold text-foreground mb-3">Record Attendance</p>
            <form onSubmit={handleRecordAttendance} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="attendedBy" className="text-xs font-medium">
                  Attended By <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="attendedBy"
                  placeholder="Enter name of person attending"
                  value={attendedBy}
                  onChange={(e) => {
                    setAttendedBy(e.target.value);
                    setAttendanceErrors((p) => ({ ...p, attendedBy: '' }));
                  }}
                  className={cn('h-9', attendanceErrors.attendedBy ? 'border-destructive' : '')}
                />
                {attendanceErrors.attendedBy && (
                  <p className="text-xs text-destructive">{attendanceErrors.attendedBy}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="attendanceDate" className="text-xs font-medium">
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="attendanceDate"
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => {
                      setAttendanceDate(e.target.value);
                      setAttendanceErrors((p) => ({ ...p, attendanceDate: '' }));
                    }}
                    className={cn('h-9', attendanceErrors.attendanceDate ? 'border-destructive' : '')}
                  />
                  {attendanceErrors.attendanceDate && (
                    <p className="text-xs text-destructive">{attendanceErrors.attendanceDate}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="attendanceTime" className="text-xs font-medium">
                    Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="attendanceTime"
                    type="time"
                    value={attendanceTime}
                    onChange={(e) => {
                      setAttendanceTime(e.target.value);
                      setAttendanceErrors((p) => ({ ...p, attendanceTime: '' }));
                    }}
                    className={cn('h-9', attendanceErrors.attendanceTime ? 'border-destructive' : '')}
                  />
                  {attendanceErrors.attendanceTime && (
                    <p className="text-xs text-destructive">{attendanceErrors.attendanceTime}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="attendanceRemarks" className="text-xs font-medium">
                  Remarks
                </Label>
                <Textarea
                  id="attendanceRemarks"
                  placeholder="Optional remarks about the attendance..."
                  value={attendanceRemarks}
                  onChange={(e) => setAttendanceRemarks(e.target.value)}
                  rows={2}
                />
              </div>

              <Button
                type="submit"
                disabled={recordAttendanceMutation.isPending}
                className="w-full sm:w-auto"
              >
                {recordAttendanceMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <ClipboardCheck size={16} className="mr-2" />
                )}
                Record Attendance
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Notification Timeline */}
      {complaint.notificationLog && complaint.notificationLog.length > 0 && (
        <Card className="shadow-card mb-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell size={16} className="text-primary" />
              Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...complaint.notificationLog].reverse().map((notif, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock size={12} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatTimestamp(notif.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────

interface InfoFieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
}

function InfoField({ label, value, icon, className }: InfoFieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value || '—'}</p>
    </div>
  );
}
