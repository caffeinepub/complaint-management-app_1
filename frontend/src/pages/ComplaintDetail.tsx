import { useState } from 'react';
import { useParams, Link, useNavigate } from '@tanstack/react-router';
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
import { generateReceiptPDF } from '../lib/pdfGenerator';
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
  FileBadge,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <p className="text-xs text-muted-foreground flex items-center gap-1 uppercase tracking-wide font-medium">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value || '—'}</p>
    </div>
  );
}

export default function ComplaintDetail() {
  const { complaintNumber } = useParams({ from: '/complaint/$complaintNumber' });
  const complaintNum = BigInt(complaintNumber);
  const { session } = useAuth();
  const isAdmin = session?.role === 'admin';
  const navigate = useNavigate();

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
  const [hearingDate, setHearingDate] = useState('');
  const [hearingTime, setHearingTime] = useState('');
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
      toast.success('Officer assigned successfully! / अधिकारी सफलतापूर्वक नियुक्त किया गया।');
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
    const officer = complaint.assignedOfficerId
      ? officers?.find((o) => o.officerId === complaint.assignedOfficerId) || null
      : null;
    generateReceiptPDF(complaint, officer);
  };

  const validateAttendance = (): boolean => {
    const errs: Record<string, string> = {};
    if (!attendedBy.trim()) errs.attendedBy = 'Attended by is required / उपस्थित व्यक्ति आवश्यक है';
    if (!attendanceDate) errs.attendanceDate = 'Date is required / तिथि आवश्यक है';
    if (!attendanceTime) errs.attendanceTime = 'Time is required / समय आवश्यक है';
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
      toast.success('Attendance recorded successfully! / उपस्थिति सफलतापूर्वक दर्ज की गई!');
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
    if (!statusUpdateStatus) errs.status = 'Status is required / स्थिति आवश्यक है';
    if (!statusUpdatedBy.trim()) errs.updatedBy = 'Updated by is required / अपडेट किया गया आवश्यक है';
    if (!statusDetails.trim()) errs.details = 'Details are required / विवरण आवश्यक है';
    setStatusErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStatusUpdate()) return;
    const combinedDetails = [
      statusDetails.trim(),
      hearingDate ? `Hearing Date / सुनवाई तिथि: ${hearingDate}` : '',
      hearingTime ? `Hearing Time / सुनवाई समय: ${hearingTime}` : '',
    ].filter(Boolean).join(' | ');

    try {
      await updateStatusMutation.mutateAsync({
        complaintNumber: complaintNum,
        newStatus: statusUpdateStatus as ComplaintStatus,
        updatedBy: statusUpdatedBy.trim(),
        details: combinedDetails,
      });
      toast.success('Complaint status updated successfully! / शिकायत स्थिति सफलतापूर्वक अपडेट की गई!');
      setStatusUpdateStatus('');
      setStatusUpdatedBy('');
      setStatusDetails('');
      setHearingDate('');
      setHearingTime('');
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
        <h2 className="text-xl font-semibold mb-2">Complaint Not Found / शिकायत नहीं मिली</h2>
        <p className="text-muted-foreground mb-6">
          The complaint with number {formatComplaintNumber(complaintNum)} could not be found.
        </p>
        <Button variant="outline" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard / डैशबोर्ड पर वापस जाएं
        </Button>
      </div>
    );
  }

  const statusStr = getStatusStr(complaint.status);
  const sortedStatusLog = complaint.statusLog ? [...complaint.statusLog].reverse() : [];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Back + Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate({ to: '/' })}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to Dashboard / डैशबोर्ड पर वापस जाएं
        </button>

        <div className="govt-header rounded-lg px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="UP Police"
              className="h-10 w-10 object-contain flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div>
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-saffron-400" />
                <h1 className="text-white font-bold text-lg font-mono">
                  {formatComplaintNumber(complaint.complaintNumber)}
                </h1>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                    getStatusColor(statusStr)
                  )}
                >
                  {getStatusLabel(statusStr)}
                </span>
                <span className="text-white/70 text-xs flex items-center gap-1">
                  <Calendar size={11} />
                  {formatTimestamp(complaint.submissionTimestamp)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {complaint.attachedFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadFile}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 flex-shrink-0"
              >
                <Download size={14} className="mr-1.5" />
                Attachment
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="bg-saffron-500 border-saffron-400 text-navy-900 hover:bg-saffron-400 flex-shrink-0 font-semibold"
            >
              <FileBadge size={14} className="mr-1.5" />
              Download PDF / रसीद
            </Button>
          </div>
        </div>
      </div>

      {/* Applicant Info */}
      <Card className="shadow-card mb-5 border-0">
        <CardHeader className="pb-3 bg-navy-50 rounded-t-lg border-b">
          <CardTitle className="text-base flex items-center gap-2 text-navy-800">
            <User size={16} className="text-navy-700" />
            Applicant Information / आवेदक की जानकारी
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField label="Applicant Name / नाम" value={complaint.applicantName} icon={<User size={13} />} />
            <InfoField label="Father's Name / पिता का नाम" value={complaint.fatherName} icon={<Users size={13} />} />
            <InfoField label="Mobile Number / मोबाइल" value={complaint.mobileNumber} icon={<Phone size={13} />} />
            <InfoField
              label="Address / पता"
              value={complaint.address}
              icon={<MapPin size={13} />}
              className="sm:col-span-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Complaint Detail */}
      <Card className="shadow-card mb-5 border-0">
        <CardHeader className="pb-3 bg-navy-50 rounded-t-lg border-b">
          <CardTitle className="text-base flex items-center gap-2 text-navy-800">
            <FileText size={16} className="text-navy-700" />
            Complaint Description / शिकायत विवरण
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 rounded-lg p-4 border border-border">
            {complaint.complaintDetail}
          </p>
          {complaint.attachedFile && (
            <div className="mt-3 flex items-center gap-2 text-sm text-navy-700 bg-blue-50 border border-blue-200 rounded px-3 py-2">
              <FileText size={14} />
              <span>File attached / फ़ाइल संलग्न है</span>
              <Button variant="ghost" size="sm" onClick={handleDownloadFile} className="ml-auto h-6 text-xs text-navy-700">
                <Download size={12} className="mr-1" /> Download
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Officer Assignment (admin only) */}
      {isAdmin && (
        <Card className="shadow-card mb-5 border-0">
          <CardHeader className="pb-3 bg-navy-50 rounded-t-lg border-b">
            <CardTitle className="text-base flex items-center gap-2 text-navy-800">
              <UserCheck size={16} className="text-navy-700" />
              Assign Officer / अधिकारी नियुक्त करें
            </CardTitle>
            <CardDescription>
              {assignedOfficer
                ? 'An officer has been assigned / अधिकारी नियुक्त किया गया है'
                : 'Assign an officer to handle this complaint / इस शिकायत के लिए अधिकारी नियुक्त करें'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {assignedOfficer && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <UserCheck size={18} className="text-green-700" />
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
                      assignedOfficer
                        ? 'Reassign to another officer... / दूसरे अधिकारी को नियुक्त करें...'
                        : 'Select an officer... / अधिकारी चुनें...'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {!officers || officers.length === 0 ? (
                    <SelectItem value="__none__" disabled>
                      No officers available / कोई अधिकारी उपलब्ध नहीं
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
                className="flex-shrink-0 bg-navy-700 hover:bg-navy-800 text-white"
              >
                {assignMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <UserCheck size={16} className="mr-2" />
                )}
                {assignedOfficer ? 'Reassign / पुनः नियुक्त' : 'Assign / नियुक्त करें'}
              </Button>
            </div>

            {(!officers || officers.length === 0) && (
              <p className="text-xs text-muted-foreground mt-2">
                No officers registered.{' '}
                <Link to="/officers" className="text-primary hover:underline">
                  Add officers first / पहले अधिकारी जोड़ें
                </Link>
                .
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Update Status (admin only) */}
      {isAdmin && (
        <Card className="shadow-card mb-5 border-0">
          <CardHeader className="pb-3 bg-navy-50 rounded-t-lg border-b">
            <CardTitle className="text-base flex items-center gap-2 text-navy-800">
              <Activity size={16} className="text-navy-700" />
              Update Status / स्थिति अपडेट करें
            </CardTitle>
            <CardDescription>
              Update the complaint status and record progress or resolution details / शिकायत की स्थिति अपडेट करें
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Status Log History */}
            {sortedStatusLog.length > 0 ? (
              <div className="mb-5 rounded-lg border border-border overflow-hidden">
                <div className="bg-navy-50 px-3 py-2 text-xs font-semibold text-navy-800 border-b">
                  Status History / स्थिति इतिहास
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs">Status / स्थिति</TableHead>
                      <TableHead className="text-xs">Updated By / अपडेट किया</TableHead>
                      <TableHead className="text-xs">Date & Time / तिथि</TableHead>
                      <TableHead className="text-xs">Details / विवरण</TableHead>
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
                <p className="text-sm text-muted-foreground">No status updates recorded yet / अभी तक कोई स्थिति अपडेट नहीं</p>
              </div>
            )}

            <Separator className="mb-4" />

            {/* Status Update Form */}
            <p className="text-sm font-semibold text-navy-800 mb-3">
              Record Status Update / स्थिति अपडेट दर्ज करें
            </p>
            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="statusSelect" className="text-xs font-medium">
                  New Status / नई स्थिति <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={statusUpdateStatus}
                  onValueChange={(val) => {
                    setStatusUpdateStatus(val as ComplaintStatus);
                    if (statusErrors.status) setStatusErrors((p) => ({ ...p, status: '' }));
                  }}
                >
                  <SelectTrigger id="statusSelect" className={statusErrors.status ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select new status / नई स्थिति चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ComplaintStatus.pending}>
                      Pending / लंबित
                    </SelectItem>
                    <SelectItem value={ComplaintStatus.inProgress}>
                      In Progress / प्रगति में
                    </SelectItem>
                    <SelectItem value={ComplaintStatus.resolved}>
                      Resolved / हल किया गया
                    </SelectItem>
                  </SelectContent>
                </Select>
                {statusErrors.status && (
                  <p className="text-xs text-destructive">{statusErrors.status}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="updatedBy" className="text-xs font-medium">
                  Updated By / अपडेट किया गया <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="updatedBy"
                  value={statusUpdatedBy}
                  onChange={(e) => {
                    setStatusUpdatedBy(e.target.value);
                    if (statusErrors.updatedBy) setStatusErrors((p) => ({ ...p, updatedBy: '' }));
                  }}
                  placeholder="Officer / Admin name"
                  className={statusErrors.updatedBy ? 'border-destructive' : ''}
                />
                {statusErrors.updatedBy && (
                  <p className="text-xs text-destructive">{statusErrors.updatedBy}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="statusDetails" className="text-xs font-medium">
                  Resolution Details / समाधान विवरण <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="statusDetails"
                  value={statusDetails}
                  onChange={(e) => {
                    setStatusDetails(e.target.value);
                    if (statusErrors.details) setStatusErrors((p) => ({ ...p, details: '' }));
                  }}
                  placeholder="Enter resolution or progress details / समाधान या प्रगति विवरण दर्ज करें"
                  rows={3}
                  className={statusErrors.details ? 'border-destructive' : ''}
                />
                {statusErrors.details && (
                  <p className="text-xs text-destructive">{statusErrors.details}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="hearingDate" className="text-xs font-medium">
                    Hearing Date / सुनवाई तिथि
                  </Label>
                  <Input
                    id="hearingDate"
                    type="date"
                    value={hearingDate}
                    onChange={(e) => setHearingDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hearingTime" className="text-xs font-medium">
                    Hearing Time / सुनवाई समय
                  </Label>
                  <Input
                    id="hearingTime"
                    type="time"
                    value={hearingTime}
                    onChange={(e) => setHearingTime(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={updateStatusMutation.isPending}
                className="w-full bg-navy-700 hover:bg-navy-800 text-white"
              >
                {updateStatusMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <CheckCircle2 size={16} className="mr-2" />
                )}
                Update Status / स्थिति अपडेट करें
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Record Attendance (admin only) */}
      {isAdmin && (
        <Card className="shadow-card mb-5 border-0">
          <CardHeader className="pb-3 bg-navy-50 rounded-t-lg border-b">
            <CardTitle className="text-base flex items-center gap-2 text-navy-800">
              <Clock size={16} className="text-navy-700" />
              Record Attendance / उपस्थिति दर्ज करें
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Attendance Log */}
            {complaint.attendanceLog && complaint.attendanceLog.length > 0 && (
              <div className="mb-5 rounded-lg border border-border overflow-hidden">
                <div className="bg-navy-50 px-3 py-2 text-xs font-semibold text-navy-800 border-b">
                  Attendance Log / उपस्थिति लॉग
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs">Attended By / उपस्थित</TableHead>
                      <TableHead className="text-xs">Date / तिथि</TableHead>
                      <TableHead className="text-xs">Time / समय</TableHead>
                      <TableHead className="text-xs">Remarks / टिप्पणी</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaint.attendanceLog.map((entry, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm font-medium">{entry.attendedBy}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{entry.attendanceDate}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{entry.attendanceTime}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{entry.remarks ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <Separator className="mb-4" />

            <p className="text-sm font-semibold text-navy-800 mb-3">
              Add Attendance Record / उपस्थिति रिकॉर्ड जोड़ें
            </p>
            <form onSubmit={handleRecordAttendance} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Attended By / उपस्थित व्यक्ति <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={attendedBy}
                  onChange={(e) => {
                    setAttendedBy(e.target.value);
                    if (attendanceErrors.attendedBy) setAttendanceErrors((p) => ({ ...p, attendedBy: '' }));
                  }}
                  placeholder="Officer / person name"
                  className={attendanceErrors.attendedBy ? 'border-destructive' : ''}
                />
                {attendanceErrors.attendedBy && (
                  <p className="text-xs text-destructive">{attendanceErrors.attendedBy}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Date / तिथि <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => {
                      setAttendanceDate(e.target.value);
                      if (attendanceErrors.attendanceDate) setAttendanceErrors((p) => ({ ...p, attendanceDate: '' }));
                    }}
                    className={attendanceErrors.attendanceDate ? 'border-destructive' : ''}
                  />
                  {attendanceErrors.attendanceDate && (
                    <p className="text-xs text-destructive">{attendanceErrors.attendanceDate}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Time / समय <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="time"
                    value={attendanceTime}
                    onChange={(e) => {
                      setAttendanceTime(e.target.value);
                      if (attendanceErrors.attendanceTime) setAttendanceErrors((p) => ({ ...p, attendanceTime: '' }));
                    }}
                    className={attendanceErrors.attendanceTime ? 'border-destructive' : ''}
                  />
                  {attendanceErrors.attendanceTime && (
                    <p className="text-xs text-destructive">{attendanceErrors.attendanceTime}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Remarks / टिप्पणी (Optional)</Label>
                <Textarea
                  value={attendanceRemarks}
                  onChange={(e) => setAttendanceRemarks(e.target.value)}
                  placeholder="Any remarks / कोई टिप्पणी"
                  rows={2}
                />
              </div>

              <Button
                type="submit"
                disabled={recordAttendanceMutation.isPending}
                className="w-full bg-navy-700 hover:bg-navy-800 text-white"
              >
                {recordAttendanceMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <Clock size={16} className="mr-2" />
                )}
                Record Attendance / उपस्थिति दर्ज करें
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Notification Log */}
      {complaint.notificationLog && complaint.notificationLog.length > 0 && (
        <Card className="shadow-card mb-5 border-0">
          <CardHeader className="pb-3 bg-navy-50 rounded-t-lg border-b">
            <CardTitle className="text-base flex items-center gap-2 text-navy-800">
              <Bell size={16} className="text-navy-700" />
              Notification Log / सूचना लॉग
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {[...complaint.notificationLog].reverse().map((notif, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <Bell size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-foreground">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatTimestamp(notif.timestamp)}</p>
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
