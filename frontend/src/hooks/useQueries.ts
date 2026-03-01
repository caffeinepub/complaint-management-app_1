import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Complaint, Officer, ComplaintStatus, ExternalBlob } from '../backend';

export function useListComplaints(statusFilter?: ComplaintStatus | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Complaint[]>({
    queryKey: ['complaints', statusFilter ?? 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listComplaints(statusFilter ?? null);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetComplaint(complaintNumber: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Complaint>({
    queryKey: ['complaint', complaintNumber?.toString()],
    queryFn: async () => {
      if (!actor || complaintNumber === null) throw new Error('No complaint number');
      return actor.getComplaint(complaintNumber);
    },
    enabled: !!actor && !isFetching && complaintNumber !== null,
  });
}

export function useListOfficers() {
  const { actor, isFetching } = useActor();
  return useQuery<Officer[]>({
    queryKey: ['officers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listOfficers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitComplaint() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      applicantName: string;
      fatherName: string;
      address: string;
      mobileNumber: string;
      complaintDetail: string;
      attachedFile: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitComplaint(
        data.applicantName,
        data.fatherName,
        data.address,
        data.mobileNumber,
        data.complaintDetail,
        data.attachedFile
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });
}

export function useAddOfficer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      officerId: string;
      name: string;
      mobileNumber: string;
      designation: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addOfficer(data.officerId, data.name, data.mobileNumber, data.designation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officers'] });
    },
  });
}

export function useAssignOfficer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { complaintNumber: bigint; officerId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignOfficer(data.complaintNumber, data.officerId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complaint', variables.complaintNumber.toString()] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });
}

export function useUpdateComplaintStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      complaintNumber: bigint;
      newStatus: ComplaintStatus;
      updatedBy: string;
      details: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateComplaintStatus(data.complaintNumber, data.newStatus, data.updatedBy, data.details);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complaint', variables.complaintNumber.toString()] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });
}

export function useRecordAttendance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      complaintNumber: bigint;
      attendedBy: string;
      attendanceDate: string;
      attendanceTime: string;
      remarks: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordAttendance(
        data.complaintNumber,
        data.attendedBy,
        data.attendanceDate,
        data.attendanceTime,
        data.remarks
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complaint', variables.complaintNumber.toString()] });
    },
  });
}
