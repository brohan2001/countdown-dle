"use client";

import { useEffect, useRef, useState } from "react";
import { NumbersRoundState } from "@countdown/game-state";
import { validateExpression } from "@countdown/engine-core";
import { RoundTimer } from "./RoundTimer";

interface NumbersRoundProps {
  roundState: NumbersRoundState;
  onSubmit: (equation: string, timeMs: number) => void;
  onTimeExpire: () => void;
  isActive: boolean;
  startTimeMs: number;
}

interface UndoStep {
  tiles: number[];
  selection: (number | string | null)[];
}

export function NumbersRound({
  roundState,
  onSubmit,
  onTimeExpire,
  isActive,
  startTimeMs,
}: NumbersRoundProps) {
  const [selection, setSelection] = useState<(number | string | null)[]>([null, null, null]);
  const [undoStack, setUndoStack] = useState<UndoStep[]>([]);
  const [keyboardInput, setKeyboardInput] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const timerHandled = useRef(false);

  const handleTimeExpire = () => {
    // Race-condition guard: only trigger once
    if (timerHandled.current) return;
    timerHandled.current = true;

    const elapsedMs = Date.now() - startTimeMs;
    const equation = keyboardInput || "";
    onSubmit(equation, elapsedMs);
  };

  // Handle tile tap: select or deselect
  const handleTileTap = (tile: number) => {
    const currentSelection = [...selection];
    const tileIndex = currentSelection.indexOf(tile);

    if (tileIndex !== -1) {
      // Deselect if already selected
      currentSelection[tileIndex] = null;
    } else {
      // Find first empty slot and place tile
      const emptyIndex = currentSelection.findIndex((s) => s === null);
      if (emptyIndex !== -1) {
        // Save undo state before changing
        setUndoStack([...undoStack, { tiles: roundState.numbers, selection: [...selection] }]);
        currentSelection[emptyIndex] = tile;
      }
    }

    setSelection(currentSelection);
    setError("");
  };

  // Handle operator tap
  const handleOperatorTap = (op: string) => {
    const currentSelection = [...selection];
    const emptyIndex = currentSelection.findIndex((s) => s === null);
    if (emptyIndex !== -1) {
      setUndoStack([...undoStack, { tiles: roundState.numbers, selection: [...selection] }]);
      currentSelection[emptyIndex] = op;
    }
    setSelection(currentSelection);
  };

  // Handle undo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastStep = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    setSelection(lastStep.selection);
    setError("");
  };

  // Handle submit
  const handleSubmit = () => {
    if (timerHandled.current) return;
    timerHandled.current = true;

    const elapsedMs = Date.now() - startTimeMs;
    const equation = keyboardInput || "";
    onSubmit(equation, elapsedMs);
  };

  // Validate keyboard input in real-time
  useEffect(() => {
    if (!keyboardInput.trim()) {
      setError("");
      return;
    }

    try {
      const isValid = validateExpression(keyboardInput, roundState.numbers);
      if (!isValid) {
        setError("Invalid or unavailable numbers");
      } else {
        setError("");
      }
    } catch {
      setError("Invalid expression");
    }
  }, [keyboardInput, roundState.numbers]);

  // Extract used numbers from keyboard input for dimming
  const usedNumbers = new Set<number>();
  if (keyboardInput) {
    const matches = keyboardInput.match(/\d+/g) || [];
    const numberCopy = [...roundState.numbers];
    for (const match of matches) {
      const num = parseInt(match, 10);
      const idx = numberCopy.indexOf(num);
      if (idx !== -1) {
        usedNumbers.add(num);
        numberCopy.splice(idx, 1);
      }
    }
  }

  const isTabletOrMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="space-y-6">
      <RoundTimer
        durationMs={30000}
        onExpire={handleTimeExpire}
        isActive={isActive}
      />

      {/* Target */}
      <div className="bg-slate-700 rounded-lg p-4 text-center">
        <p className="text-slate-300 text-sm mb-1">Target</p>
        <p className="text-4xl font-bold text-cyan-400">{roundState.target}</p>
      </div>

      {/* Numbers Grid (Tap to Select) */}
      {!isTabletOrMobile && (
        <div>
          <p className="text-slate-300 text-sm mb-2">Numbers (tap to select)</p>
          <div className="grid grid-cols-3 gap-2">
            {roundState.numbers.map((num, idx) => {
              const isDimmed = usedNumbers.has(num);
              return (
                <button
                  key={idx}
                  onClick={() => handleTileTap(num)}
                  className={`p-3 rounded-lg font-bold text-lg transition-all ${
                    selection.includes(num)
                      ? "bg-blue-600 text-white ring-2 ring-blue-400"
                      : isDimmed
                        ? "bg-slate-600 text-slate-400 opacity-50"
                        : "bg-slate-600 text-white hover:bg-slate-500"
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Keyboard Input */}
      <div>
        <label className="text-slate-300 text-sm mb-1 block">
          Expression (desktop) or use tiles below
        </label>
        <input
          ref={inputRef}
          type="text"
          value={keyboardInput}
          onChange={(e) => setKeyboardInput(e.target.value)}
          placeholder="e.g., (75+50)*8"
          className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:border-blue-500 focus:outline-none font-mono"
        />
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      </div>

      {/* Selection Display (Tap-to-Merge Mode) */}
      {isTabletOrMobile && (
        <div>
          <p className="text-slate-300 text-sm mb-2">Tap-to-Merge Sequence</p>
          <div className="flex gap-2 mb-4">
            {selection.map((item, idx) => (
              <div
                key={idx}
                className="flex-1 p-3 rounded-lg text-center text-white font-bold bg-slate-700 border-2 border-slate-600"
              >
                {item || "?"}
              </div>
            ))}
          </div>

          {/* Numbers to Select From */}
          <p className="text-slate-300 text-sm mb-2">Numbers</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {roundState.numbers.map((num, idx) => (
              <button
                key={idx}
                onClick={() => handleTileTap(num)}
                className={`p-3 rounded-lg font-bold text-lg transition-all ${
                  selection.includes(num)
                    ? "bg-blue-600 text-white ring-2 ring-blue-400"
                    : "bg-slate-600 text-white hover:bg-slate-500"
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Operators */}
          <p className="text-slate-300 text-sm mb-2">Operators</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {["+", "-", "*", "/"].map((op) => (
              <button
                key={op}
                onClick={() => handleOperatorTap(op)}
                className="p-3 rounded-lg font-bold text-lg bg-purple-600 text-white hover:bg-purple-500 transition-all"
              >
                {op}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleUndo}
          disabled={undoStack.length === 0}
          className="px-4 py-2 rounded-lg font-semibold bg-slate-600 text-white hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Undo
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-500 transition-all"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
