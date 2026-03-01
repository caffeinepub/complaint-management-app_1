import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  public type ComplaintStatus = {
    #pending;
    #inProgress;
    #resolved;
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

  public type Complaint = {
    complaintNumber : Nat;
    applicantName : Text;
    fatherName : Text;
    address : Text;
    mobileNumber : Text;
    complaintDetail : Text;
    status : ComplaintStatus;
    assignedOfficerId : ?Text;
    attachedFile : ?Storage.ExternalBlob;
    submissionTimestamp : Time.Time;
    notificationLog : [Notification];
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
      assignedOfficerId = null;
      attachedFile;
      submissionTimestamp = Time.now();
      notificationLog = [];
    };
    complaints.add(complaintNumber, Complaint.addNotification(newComplaint, "Complaint submitted successfully. Your complaint number is: " # complaintNumber.toText()));

    complaintNumber;
  };

  public shared ({ caller }) func assignOfficer(
    complaintNumber : Nat,
    officerId : Text,
  ) : async () {
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

  public query ({ caller }) func getComplaint(complaintNumber : Nat) : async Complaint {
    switch (complaints.get(complaintNumber)) {
      case (null) { Runtime.trap("No submission found for guest") };
      case (?complaint) { complaint };
    };
  };

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

  public shared ({ caller }) func addOfficer(
    officerId : Text,
    name : Text,
    mobileNumber : Text,
    designation : Text,
  ) : async () {
    let officer : Officer = {
      officerId;
      name;
      mobileNumber;
      designation;
    };
    officers.add(officerId, officer);
  };

  public query ({ caller }) func listOfficers() : async [Officer] {
    let officersArray = officers.values().toArray();
    officersArray;
  };
};
