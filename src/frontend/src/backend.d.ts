import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface ScanRecord {
    id: bigint;
    inputSnippet: string;
    contentType: string;
    userId: string;
    explanation: string;
    verdict: string;
    highlights: string;
    timestamp: bigint;
    humanScore: bigint;
    aiScore: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    analyzeFile(userId: string, contentType: string, filename: string, snippet: string): Promise<ScanRecord>;
    analyzeText(userId: string, text: string): Promise<ScanRecord>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearHistory(userId: string): Promise<void>;
    deleteScan(userId: string, scanId: bigint): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyCount(userId: string): Promise<bigint>;
    getHistory(userId: string): Promise<Array<ScanRecord>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
