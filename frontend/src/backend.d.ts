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
export interface AttendanceLog {
    attendanceDate: string;
    attendanceTime: string;
    attendedBy: string;
    remarks?: string;
}
export type Time = bigint;
export interface StatusLogEntry {
    status: ComplaintStatus;
    updatedAt: Time;
    updatedBy: string;
    details: string;
}
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
    attendanceLog: Array<AttendanceLog>;
    statusLog: Array<StatusLogEntry>;
    notificationLog: Array<Notification>;
    complaintNumber: bigint;
    attachedFile?: ExternalBlob;
    fatherName: string;
    address: string;
    assignedOfficerId?: string;
}
export interface UserProfile {
    name: string;
}
export enum ComplaintStatus {
    resolved = "resolved",
    pending = "pending",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addOfficer(officerId: string, name: string, mobileNumber: string, designation: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignOfficer(complaintNumber: bigint, officerId: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComplaint(complaintNumber: bigint): Promise<Complaint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listComplaints(statusFilter: ComplaintStatus | null): Promise<Array<Complaint>>;
    listOfficers(): Promise<Array<Officer>>;
    recordAttendance(complaintNumber: bigint, attendedBy: string, attendanceDate: string, attendanceTime: string, remarks: string | null): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitComplaint(applicantName: string, fatherName: string, address: string, mobileNumber: string, complaintDetail: string, attachedFile: ExternalBlob | null): Promise<bigint>;
    updateComplaintStatus(complaintNumber: bigint, newStatus: ComplaintStatus, updatedBy: string, details: string): Promise<void>;
}
