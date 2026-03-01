import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ComplaintStatus, ExternalBlob } from '../backend';

// ─── Complaints ───────────────────────────────────────────────────────────────

export function useListComplaints(statusFilter: ComplaintStatus | null = null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['complaints', statusFilter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listComplaints(statusFilter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetComplaint(complaintNumber: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['complaint', complaintNumber?.toString()],
    queryFn: async () => {
      if (!actor || complaintNumber === null) throw new Error('No complaint number');
      return actor.getComplaint(complaintNumber);
    },
    enabled: !!actor && !isFetching && complaintNumber !== null,
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
      if (!actor) throw new Error('Actor not initialized');
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

export function useAssignOfficer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { complaintNumber: bigint; officerId: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.assignOfficer(data.complaintNumber, data.officerId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complaint', variables.complaintNumber.toString()] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });
}

// ─── Officers ─────────────────────────────────────────────────────────────────

export function useListOfficers() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['officers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listOfficers();
    },
    enabled: !!actor && !isFetching,
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
      if (!actor) throw new Error('Actor not initialized');
      return actor.addOfficer(data.officerId, data.name, data.mobileNumber, data.designation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officers'] });
    },
  });
}
