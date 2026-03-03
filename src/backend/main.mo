import Text "mo:core/Text";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  type ScanRecord = {
    id : Nat;
    userId : Text;
    timestamp : Int;
    contentType : Text;
    inputSnippet : Text;
    aiScore : Nat;
    humanScore : Nat;
    verdict : Text;
    highlights : Text;
    explanation : Text;
  };

  module ScanRecord {
    public func compareByTimestampDescending(a : ScanRecord, b : ScanRecord) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let scanRecords = Map.empty<Text, [ScanRecord]>();
  var scanIdCounter = 0;

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
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

  // AI Content Detector functions
  public shared ({ caller }) func analyzeText(userId : Text, text : Text) : async ScanRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can analyze text");
    };

    let callerText = caller.toText();
    if (userId != callerText and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only analyze text for yourself");
    };

    let aiScore = heuristicAIScore(text);
    let verdict = if (aiScore >= 60) { "Likely AI-Generated" } else {
      "Likely Human-Written";
    };
    let highlights = findSuspiciousSentences(text);

    let record : ScanRecord = {
      id = scanIdCounter;
      userId;
      timestamp = Time.now();
      contentType = "text";
      inputSnippet = text;
      aiScore;
      humanScore = 100 - aiScore;
      verdict;
      highlights;
      explanation = buildExplanation(aiScore, highlights);
    };

    updateRecords(userId, record);
    scanIdCounter += 1;

    record;
  };

  public shared ({ caller }) func analyzeFile(userId : Text, contentType : Text, filename : Text, snippet : Text) : async ScanRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can analyze files");
    };

    let callerText = caller.toText();
    if (userId != callerText and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only analyze files for yourself");
    };

    let aiScore = heuristicAIScore(snippet);
    let verdict = if (aiScore >= 60) { "Likely AI-Generated" } else {
      "Likely Human-Written";
    };

    let record : ScanRecord = {
      id = scanIdCounter;
      userId;
      timestamp = Time.now();
      contentType;
      inputSnippet = snippet;
      aiScore;
      humanScore = 100 - aiScore;
      verdict;
      highlights = findSuspiciousSentences(snippet);
      explanation = buildExplanation(aiScore, findSuspiciousSentences(snippet));
    };

    updateRecords(userId, record);
    scanIdCounter += 1;

    record;
  };

  public query ({ caller }) func getHistory(userId : Text) : async [ScanRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view history");
    };

    let callerText = caller.toText();
    if (userId != callerText and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own history");
    };

    switch (scanRecords.get(userId)) {
      case (null) { [] };
      case (?records) {
        records.sort(ScanRecord.compareByTimestampDescending);
      };
    };
  };

  public query ({ caller }) func getDailyCount(userId : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view daily count");
    };

    let callerText = caller.toText();
    if (userId != callerText and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own daily count");
    };

    let today = Time.now();
    switch (scanRecords.get(userId)) {
      case (null) { 0 };
      case (?records) {
        records.foldLeft(
          0,
          func(count, record) {
            if (isToday(record.timestamp, today)) { count + 1 } else {
              count;
            };
          },
        );
      };
    };
  };

  public shared ({ caller }) func clearHistory(userId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear history");
    };

    let callerText = caller.toText();
    if (userId != callerText and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only clear your own history");
    };

    scanRecords.remove(userId);
  };

  public shared ({ caller }) func deleteScan(userId : Text, scanId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete scans");
    };

    let callerText = caller.toText();
    if (userId != callerText and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own scans");
    };

    switch (scanRecords.get(userId)) {
      case (null) { false };
      case (?records) {
        let updatedRecords = records.filter(
          func(record) { record.id != scanId }
        );
        if (updatedRecords.size() == records.size()) { false } else {
          if (updatedRecords.isEmpty()) {
            scanRecords.remove(userId);
          } else {
            scanRecords.add(userId, updatedRecords);
          };
          true;
        };
      };
    };
  };

  func updateRecords(userId : Text, newRecord : ScanRecord) {
    let currentRecords = switch (scanRecords.get(userId)) {
      case (null) { [] };
      case (?records) { records };
    };
    scanRecords.add(userId, [newRecord].concat(currentRecords));
  };

  func heuristicAIScore(_: Text) : Nat {
    50; // Placeholder - replace with actual logic
  };

  func findSuspiciousSentences(_: Text) : Text {
    "0,2,4"; // Placeholder - replace with logic
  };

  func buildExplanation(aiScore : Nat, highlights : Text) : Text {
    "AI Score: " # aiScore.toText() # ". Suspicious sentences: " # highlights;
  };

  func isToday(timestamp : Int, currentTime : Int) : Bool {
    let millisPerDay : Int = 86400000000000;
    let daysSinceEpoch = func(ts : Int) : Int {
      if (ts >= 0) { ts / millisPerDay } else {
        (ts - millisPerDay + 1) / millisPerDay;
      };
    };
    daysSinceEpoch(timestamp) == daysSinceEpoch(currentTime);
  };
};
