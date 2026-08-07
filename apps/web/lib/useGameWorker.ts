"use client";

import { useEffect, useRef } from "react";
import type {
  WorkerRequest,
  WorkerResponse,
  GeneratePuzzleResponse,
  SolveLettersResponse,
  SolveNumbersResponse,
  SolveConundrumResponse,
} from "./workerProtocol";
import type { Puzzle, LettersResult } from "@countdown/engine-core";

interface PendingPromise {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
}

export function useGameWorker() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<number, PendingPromise>>(new Map());
  const messageIdRef = useRef(0);

  useEffect(() => {
    // Initialize worker
    const worker = new Worker(new URL("../workers/game-engine.worker", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { id, error } = event.data;
      const pending = pendingRef.current.get(id);

      if (!pending) return;

      pendingRef.current.delete(id);

      if (error) {
        pending.reject(new Error(error));
      } else {
        pending.resolve(event.data);
      }
    };

    worker.onerror = (error) => {
      console.error("Worker error:", error);
      // Reject all pending promises
      for (const pending of pendingRef.current.values()) {
        pending.reject(new Error(error.message || "Worker error"));
      }
      pendingRef.current.clear();
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
      pendingRef.current.clear();
    };
  }, []);

  const sendMessage = <T extends WorkerResponse>(
    type: string,
    payload?: any
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      const worker = workerRef.current;
      if (!worker) {
        reject(new Error("Worker not initialized"));
        return;
      }

      const id = messageIdRef.current++;
      pendingRef.current.set(id, { resolve, reject });

      const message: WorkerRequest = {
        id,
        type,
        ...(payload && { payload }),
      } as WorkerRequest;

      worker.postMessage(message);
    });
  };

  return {
    async init(words: string[]): Promise<void> {
      await sendMessage("INIT", { words });
    },

    async generatePuzzle(playDate: string): Promise<Puzzle> {
      const response = await sendMessage<GeneratePuzzleResponse>(
        "GENERATE_PUZZLE",
        { playDate }
      );
      return (response.payload as any).puzzle;
    },

    async solveLetters(letters: string[]): Promise<LettersResult | null> {
      const response = await sendMessage<SolveLettersResponse>("SOLVE_LETTERS", {
        letters,
      });
      return (response.payload as any).result;
    },

    async solveNumbers(
      numbers: number[],
      target: number
    ): Promise<{ value: number; equation: string; distance: number }> {
      const response = await sendMessage<SolveNumbersResponse>("SOLVE_NUMBERS", {
        numbers,
        target,
      });
      return (response.payload as any).result;
    },

    async solveConundrum(anagram: string): Promise<string[]> {
      const response = await sendMessage<SolveConundrumResponse>(
        "SOLVE_CONUNDRUM",
        { anagram }
      );
      return (response.payload as any).solutions;
    },
  };
}
