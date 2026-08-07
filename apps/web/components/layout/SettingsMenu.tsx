"use client";

import { useEffect, useState } from "react";

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsMenu({ isOpen, onClose }: SettingsMenuProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDyslexicFont, setIsDyslexicFont] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("countdown-settings");
    if (saved) {
      const settings = JSON.parse(saved);
      setIsDarkMode(settings.darkMode ?? false);
      setIsDyslexicFont(settings.dyslexicFont ?? false);
    }
  }, []);

  // Apply theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Apply dyslexic font
  useEffect(() => {
    if (isDyslexicFont) {
      document.body.classList.add("font-dyslexic");
    } else {
      document.body.classList.remove("font-dyslexic");
    }
  }, [isDyslexicFont]);

  const handleSave = () => {
    const settings = {
      darkMode: isDarkMode,
      dyslexicFont: isDyslexicFont,
    };
    localStorage.setItem("countdown-settings", JSON.stringify(settings));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

        {/* Theme Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-slate-300 font-semibold">Dark Mode</label>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDarkMode ? "bg-blue-600" : "bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <p className="text-slate-400 text-sm">
            {isDarkMode ? "Dark theme enabled" : "Light theme enabled"}
          </p>
        </div>

        {/* Dyslexic Font Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-slate-300 font-semibold">Dyslexic-Friendly Font</label>
            <button
              onClick={() => setIsDyslexicFont(!isDyslexicFont)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDyslexicFont ? "bg-blue-600" : "bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDyslexicFont ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <p className="text-slate-400 text-sm">
            {isDyslexicFont
              ? "Using accessible font with increased spacing"
              : "Using standard system font"}
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
