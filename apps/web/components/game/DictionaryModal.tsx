"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface DictEntry {
  word: string;
  partOfSpeech: string;
  definitions: Array<{ definition: string; example?: string }>;
}

interface DictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  word: string;
}

export function DictionaryModal({ isOpen, onClose, word }: DictionaryModalProps) {
  const [entry, setEntry] = useState<DictEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isOpen || !word) return;

    const fetchDefinition = async () => {
      setLoading(true);
      setNotFound(false);
      setEntry(null);

      try {
        const response = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
        );

        if (!response.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const firstEntry = data[0];
          const meanings = firstEntry.meanings?.[0];

          setEntry({
            word: firstEntry.word,
            partOfSpeech: meanings?.partOfSpeech || "noun",
            definitions: (meanings?.definitions || []).slice(0, 3),
          });
        } else {
          setNotFound(true);
        }
      } catch (error) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDefinition();
  }, [word, isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-slate-800 rounded-lg p-8 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-2">{word.toUpperCase()}</h2>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}

        {notFound && (
          <div className="bg-slate-700 rounded-lg p-4 mb-6">
            <p className="text-slate-300 text-center">
              No definition available. This is a valid Scrabble word.
            </p>
          </div>
        )}

        {entry && (
          <div className="space-y-4 mb-6">
            <div className="border-b border-slate-600 pb-3">
              <p className="text-slate-400 italic">{entry.partOfSpeech}</p>
            </div>

            <div className="space-y-2">
              <p className="text-slate-300 text-sm font-semibold">Definitions</p>
              {entry.definitions.map((def, idx) => (
                <div key={idx} className="bg-slate-700 rounded-lg p-3">
                  <p className="text-slate-200 text-sm">{def.definition}</p>
                  {def.example && (
                    <p className="text-slate-400 text-xs mt-1 italic">
                      Example: {def.example}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}
