import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ScanRecord } from "../backend.d";
import { useActor } from "./useActor";

// ── Query Keys ──────────────────────────────────────────────────────────────
export const queryKeys = {
  history: (userId: string) => ["history", userId] as const,
  dailyCount: (userId: string) => ["dailyCount", userId] as const,
};

// ── useHistory ───────────────────────────────────────────────────────────────
export function useHistory(userId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ScanRecord[]>({
    queryKey: queryKeys.history(userId),
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHistory(userId);
    },
    enabled: !!actor && !isFetching,
  });
}

// ── useDailyCount ────────────────────────────────────────────────────────────
export function useDailyCount(userId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: queryKeys.dailyCount(userId),
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getDailyCount(userId);
    },
    enabled: !!actor && !isFetching,
  });
}

// ── useAnalyzeText ───────────────────────────────────────────────────────────
export function useAnalyzeText(userId: string) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation<ScanRecord, Error, { text: string }>({
    mutationFn: async ({ text }) => {
      if (isFetching)
        throw new Error(
          "Still connecting to the backend. Please try again in a moment.",
        );
      if (!actor)
        throw new Error(
          "Backend connection unavailable. Please refresh the page.",
        );
      return actor.analyzeText(userId, text);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.history(userId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dailyCount(userId),
      });
    },
  });
}

// ── useAnalyzeFile ───────────────────────────────────────────────────────────
export function useAnalyzeFile(userId: string) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation<
    ScanRecord,
    Error,
    { contentType: string; filename: string; snippet: string }
  >({
    mutationFn: async ({ contentType, filename, snippet }) => {
      if (isFetching)
        throw new Error(
          "Still connecting to the backend. Please try again in a moment.",
        );
      if (!actor)
        throw new Error(
          "Backend connection unavailable. Please refresh the page.",
        );
      return actor.analyzeFile(userId, contentType, filename, snippet);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.history(userId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dailyCount(userId),
      });
    },
  });
}

// ── useClearHistory ──────────────────────────────────────────────────────────
export function useClearHistory(userId: string) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (isFetching)
        throw new Error(
          "Still connecting to the backend. Please try again in a moment.",
        );
      if (!actor)
        throw new Error(
          "Backend connection unavailable. Please refresh the page.",
        );
      return actor.clearHistory(userId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.history(userId),
      });
    },
  });
}

// ── useDeleteScan ────────────────────────────────────────────────────────────
export function useDeleteScan(userId: string) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, { scanId: bigint }>({
    mutationFn: async ({ scanId }) => {
      if (isFetching)
        throw new Error(
          "Still connecting to the backend. Please try again in a moment.",
        );
      if (!actor)
        throw new Error(
          "Backend connection unavailable. Please refresh the page.",
        );
      return actor.deleteScan(userId, scanId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.history(userId),
      });
    },
  });
}
