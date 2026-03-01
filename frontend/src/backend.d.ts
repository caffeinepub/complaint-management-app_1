import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Officer {
    officerId: string;
    name: string;
    designation: string;
    mobileNumber: string;
}
export interface Notification {
    message: string;
    timestamp: Time;
}
export interface Complaint {
    status: ComplaintStatus;
    applicantName: string;
    submissionTimestamp: Time;
    complaintDetail: string;
    mobileNumber: string;
    notificationLog: Array<Notification>;
    complaintNumber: bigint;
    attachedFile?: ExternalBlob;
    fatherName: string;
    address: string;
    assignedOfficerId?: string;
}
export enum ComplaintStatus {
    resolved = "resolved",
    pending = "pending",
    inProgress = "inProgress"
}
export interface backendInterface {
    addOfficer(officerId: string, name: string, mobileNumber: string, designation: string): Promise<void>;
    assignOfficer(complaintNumber: bigint, officerId: string): Promise<void>;
    getComplaint(complaintNumber: bigint): Promise<Complaint>;
    listComplaints(statusFilter: ComplaintStatus | null): Promise<Array<Complaint>>;
    listOfficers(): Promise<Array<Officer>>;
    submitComplaint(applicantName: string, fatherName: string, address: string, mobileNumber: string, complaintDetail: string, attachedFile: ExternalBlob | null): Promise<bigint>;
}
