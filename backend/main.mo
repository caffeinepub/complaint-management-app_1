import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import List "mo:core/List";
import Order "mo:core/Order";
import Principal "mo:core/Principal";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type ComplaintStatus = {
    #pending;
    #inProgress;
    #resolved;
  };

  public type StatusLogEntry = {
    status : ComplaintStatus;
    updatedAt : Time.Time;
    updatedBy : Text;
    details : Text;
  };

  public type Officer = {
    officerId : Text;
    name : Text;
    mobileNumber : Text;
    designation : Text;
  };

  public type Notification = {
    timestamp : Time.Time;
    message : Text;
  };

  public type AttendanceLog = {
    attendedBy : Text;
    attendanceDate : Text;
    attendanceTime : Text;
    remarks : ?Text;
  };

  public type Complaint = {
    complaintNumber : Nat;
    applicantName : Text;
    fatherName : Text;
    address : Text;
    mobileNumber : Text;
    complaintDetail : Text;
    status : ComplaintStatus;
    statusLog : [StatusLogEntry];
    assignedOfficerId : ?Text;
    attachedFile : ?Storage.ExternalBlob;
    submissionTimestamp : Time.Time;
    notificationLog : [Notification];
    attendanceLog : [AttendanceLog];
  };

  module Complaint {
    public func compare(a : Complaint, b : Complaint) : Order.Order {
      Nat.compare(a.complaintNumber, b.complaintNumber);
    };

    public func addNotification(complaint : Complaint, message : Text) : Complaint {
      let newNotification : Notification = {
        timestamp = Time.now();
        message;
      };

      let updatedLog = List.empty<Notification>();
      updatedLog.add(newNotification);

      let updatedNotifications = if (complaint.notificationLog.size() > 0) {
        let existingNotifications = List.fromArray<Notification>(complaint.notificationLog);
        existingNotifications.addAll(existingNotifications.values());
        updatedLog;
      } else {
        updatedLog;
      };

      {
        complaint with
        notificationLog = updatedNotifications.toArray()
      };
    };
  };

  let complaints = Map.empty<Nat, Complaint>();
  let officers = Map.empty<Text, Officer>();
  var nextComplaintNumber = 1;

  // Anyone (including guests) can submit a complaint
  public shared ({ caller }) func submitComplaint(
    applicantName : Text,
    fatherName : Text,
    address : Text,
    mobileNumber : Text,
    complaintDetail : Text,
    attachedFile : ?Storage.ExternalBlob,
  ) : async Nat {
    let complaintNumber = nextComplaintNumber;
    nextComplaintNumber += 1;

    let newComplaint : Complaint = {
      complaintNumber;
      applicantName;
      fatherName;
      address;
      mobileNumber;
      complaintDetail;
      status = #pending;
      statusLog = [{
        status = #pending;
        updatedAt = Time.now();
        updatedBy = "System";
        details = "Complaint submitted";
      }];
      assignedOfficerId = null;
      attachedFile;
      submissionTimestamp = Time.now();
      notificationLog = [];
      attendanceLog = [];
    };
    complaints.add(complaintNumber, Complaint.addNotification(newComplaint, "Complaint submitted successfully. Your complaint number is: " # complaintNumber.toText()));

    complaintNumber;
  };

  // Admin-only: assigning officers is an administrative action
  public shared ({ caller }) func assignOfficer(
    complaintNumber : Nat,
    officerId : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can assign officers");
    };

    let complaint = switch (complaints.get(complaintNumber)) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?complaint) { complaint };
    };

    switch (officers.get(officerId)) {
      case (null) { Runtime.trap("Officer not found") };
      case (?_) {};
    };

    let updatedComplaint = {
      complaint with assignedOfficerId = ?officerId;
    };
    complaints.add(complaintNumber, Complaint.addNotification(updatedComplaint, "Officer assigned successfully: " # officerId));
  };

  // Anyone can view a complaint
  public query ({ caller }) func getComplaint(complaintNumber : Nat) : async Complaint {
    switch (complaints.get(complaintNumber)) {
      case (null) { Runtime.trap("No submission found for guest") };
      case (?complaint) { complaint };
    };
  };

  // Anyone can list complaints
  public query ({ caller }) func listComplaints(statusFilter : ?ComplaintStatus) : async [Complaint] {
    let iter = complaints.values();
    let complaintsArray = iter.toArray().sort();

    switch (statusFilter) {
      case (null) { complaintsArray };
      case (?status) {
        complaintsArray.filter(
          func(c) {
            c.status == status;
          }
        );
      };
    };
  };

  // Admin-only: managing officers is an administrative action
  public shared ({ caller }) func addOfficer(
    officerId : Text,
    name : Text,
    mobileNumber : Text,
    designation : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add officers");
    };

    let officer : Officer = {
      officerId;
      name;
      mobileNumber;
      designation;
    };
    officers.add(officerId, officer);
  };

  // Anyone can list officers
  public query ({ caller }) func listOfficers() : async [Officer] {
    let officersArray = officers.values().toArray();
    officersArray;
  };

  // Admin-only: recording attendance is an administrative action
  public shared ({ caller }) func recordAttendance(
    complaintNumber : Nat,
    attendedBy : Text,
    attendanceDate : Text,
    attendanceTime : Text,
    remarks : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can record attendance");
    };

    let complaint = switch (complaints.get(complaintNumber)) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?complaint) { complaint };
    };

    let newAttendance : AttendanceLog = {
      attendedBy;
      attendanceDate;
      attendanceTime;
      remarks;
    };

    let updatedAttendanceLog = Array.tabulate(
      complaint.attendanceLog.size() + 1,
      func(i) {
        if (i < complaint.attendanceLog.size()) {
          complaint.attendanceLog[i];
        } else {
          newAttendance;
        };
      },
    );

    let updatedComplaint = { complaint with attendanceLog = updatedAttendanceLog };
    complaints.add(complaintNumber, Complaint.addNotification(updatedComplaint, "Attendance record added successfully."));
  };

  // Admin-only: updating complaint status is an administrative action
  public shared ({ caller }) func updateComplaintStatus(
    complaintNumber : Nat,
    newStatus : ComplaintStatus,
    updatedBy : Text,
    details : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update complaint status");
    };

    let complaint = switch (complaints.get(complaintNumber)) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?complaint) { complaint };
    };

    let newStatusEntry : StatusLogEntry = {
      status = newStatus;
      updatedAt = Time.now();
      updatedBy;
      details;
    };

    let updatedStatusLog = Array.tabulate(
      complaint.statusLog.size() + 1,
      func(i) {
        if (i < complaint.statusLog.size()) {
          complaint.statusLog[i];
        } else { newStatusEntry };
      },
    );

    let updatedComplaint = {
      complaint with
      status = newStatus;
      statusLog = updatedStatusLog;
    };
    complaints.add(complaintNumber, updatedComplaint);
  };
};
