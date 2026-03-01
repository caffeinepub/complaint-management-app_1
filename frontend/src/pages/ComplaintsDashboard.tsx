import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useListComplaints, useListOfficers } from '../hooks/useQueries';
import { ComplaintStatus } from '../backend';
import { formatComplaintNumber, formatTimestamp, getStatusLabel, getStatusColor } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Users, Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react';

export default function ComplaintsDashboard() {
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const navigate = useNavigate();

  const { data: complaints, isLoading, isError } = useListComplaints(
    statusFilter === 'all' ? null : statusFilter
  );
  const { data: officers } = useListOfficers();

  const getOfficerName = (officerId?: string) => {
    if (!officerId) return null;
    return officers?.find((o) => o.officerId === officerId)?.name || officerId;
  };

  const allComplaints = useListComplaints(null);
  const total = allComplaints.data?.length || 0;
  const pendingCount = allComplaints.data?.filter((c) => String(c.status) === 'pending').length || 0;
  const inProgressCount = allComplaints.data?.filter((c) => String(c.status) === 'inProgress').length || 0;
  const resolvedCount = allComplaints.data?.filter((c) => String(c.status) === 'resolved').length || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="govt-header rounded-lg px-6 py-4 flex items-center gap-3">
        <img src="/logo.png" alt="UP Police" className="h-10 w-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <div>
          <h1 className="text-white font-bold text-xl">Complaints Dashboard / शिकायत डैशबोर्ड</h1>
          <p className="text-saffron-400 text-sm">PS Sadar Bazar Application Box - UP Police</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-card border-0 border-l-4 border-l-navy-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-navy-700" />
              <div>
                <p className="text-xs text-gray-500">Total / कुल</p>
                <p className="text-2xl font-bold text-navy-800">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0 border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock size={24} className="text-yellow-600" />
              <div>
                <p className="text-xs text-gray-500">Pending / लंबित</p>
                <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0 border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} className="text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">In Progress / प्रगति में</p>
                <p className="text-2xl font-bold text-blue-700">{inProgressCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0 border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Resolved / हल</p>
                <p className="text-2xl font-bold text-green-700">{resolvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Table */}
      <Card className="shadow-card border-0">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 rounded-t-lg">
            <h2 className="font-semibold text-navy-800">All Complaints / सभी शिकायतें</h2>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-44 text-sm">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All / सभी</SelectItem>
                <SelectItem value={ComplaintStatus.pending}>Pending / लंबित</SelectItem>
                <SelectItem value={ComplaintStatus.inProgress}>In Progress / प्रगति में</SelectItem>
                <SelectItem value={ComplaintStatus.resolved}>Resolved / हल</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-600">
              <AlertCircle size={32} className="mx-auto mb-2" />
              <p>Failed to load complaints / शिकायतें लोड करने में विफल</p>
            </div>
          ) : !complaints?.length ? (
            <div className="p-8 text-center text-gray-500">
              <FileText size={40} className="mx-auto mb-2 opacity-30" />
              <p>No complaints found / कोई शिकायत नहीं मिली</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy-50 text-navy-800">
                    <th className="text-left px-4 py-3 font-semibold">Complaint No.</th>
                    <th className="text-left px-4 py-3 font-semibold">Applicant / आवेदक</th>
                    <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Mobile</th>
                    <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Submitted / दर्ज तिथि</th>
                    <th className="text-left px-4 py-3 font-semibold">Status / स्थिति</th>
                    <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Officer / अधिकारी</th>
                    <th className="text-left px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint, idx) => (
                    <tr key={complaint.complaintNumber.toString()} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-mono font-semibold text-navy-700 text-xs">
                        {formatComplaintNumber(complaint.complaintNumber)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{complaint.applicantName}</div>
                        <div className="text-xs text-gray-500">{complaint.address.slice(0, 30)}{complaint.address.length > 30 ? '...' : ''}</div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-gray-600">{complaint.mobileNumber}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                        {formatTimestamp(complaint.submissionTimestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(String(complaint.status))}`}>
                          {getStatusLabel(String(complaint.status))}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-600 text-xs">
                        {getOfficerName(complaint.assignedOfficerId) || <span className="text-gray-400 italic">Not assigned</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate({ to: `/complaint/${complaint.complaintNumber}` })}
                          className="text-navy-700 border-navy-300 hover:bg-navy-50 flex items-center gap-1"
                        >
                          <Eye size={13} />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
