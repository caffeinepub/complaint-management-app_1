import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  type ComplaintStatus = {
    #pending;
    #inProgress;
    #resolved;
  };

  type StatusLogEntry = {
    status : ComplaintStatus;
    updatedAt : Time.Time;
    updatedBy : Text;
    details : Text;
  };

  type Notification = {
    timestamp : Time.Time;
    message : Text;
  };

  type AttendanceLog = {
    attendedBy : Text;
    attendanceDate : Text;
    attendanceTime : Text;
    remarks : ?Text;
  };

  type OldComplaint = {
    complaintNumber : Nat;
    applicantName : Text;
    fatherName : Text;
    address : Text;
    mobileNumber : Text;
    complaintDetail : Text;
    status : ComplaintStatus;
    notificationLog : [Notification];
    attendanceLog : [AttendanceLog];
    assignedOfficerId : ?Text;
    attachedFile : ?Storage.ExternalBlob;
    submissionTimestamp : Time.Time;
  };

  type NewComplaint = {
    complaintNumber : Nat;
    applicantName : Text;
    fatherName : Text;
    address : Text;
    mobileNumber : Text;
    complaintDetail : Text;
    status : ComplaintStatus;
    statusLog : [StatusLogEntry];
    notificationLog : [Notification];
    attendanceLog : [AttendanceLog];
    assignedOfficerId : ?Text;
    attachedFile : ?Storage.ExternalBlob;
    submissionTimestamp : Time.Time;
  };

  type OldActor = {
    complaints : Map.Map<Nat, OldComplaint>;
  };

  type NewActor = {
    complaints : Map.Map<Nat, NewComplaint>;
  };

  public func run(old : OldActor) : NewActor {
    let newComplaints = old.complaints.map<Nat, OldComplaint, NewComplaint>(
      func(_complaintNumber, oldComplaint) {
        {
          oldComplaint with
          statusLog = []
        };
      }
    );
    { complaints = newComplaints };
  };
};
