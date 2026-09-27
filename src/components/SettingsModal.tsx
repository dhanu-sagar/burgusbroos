import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Download, Upload, RotateCcw, AlertCircle, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    updateSettings,
    exportData,
    importData,
    resetToDefaults,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importData(content);
        if (success) {
          setImportStatus('Data successfully imported!');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('Failed to import file. Invalid format.');
          setTimeout(() => setImportStatus(null), 3000);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl border border-black/[0.08] w-full max-w-md overflow-hidden animate-in fade-in duration-150">
        <div className="px-6 py-4 border-b border-black/[0.05] flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-neutral-900">
            Settings & Data
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-900 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-neutral-800">
          {/* Default Startup Mode */}
          <div>
            <label className="block font-semibold mb-2 text-neutral-900">
              Default Startup Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ mode: 'simple' })}
                className={`p-3 rounded-2xl text-left transition-all border ${
                  settings.mode === 'simple'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
                }`}
              >
                <div className="font-semibold text-xs">Simple Mode</div>
                <div className={`text-[10px] mt-0.5 ${settings.mode === 'simple' ? 'text-white/70' : 'text-neutral-500'}`}>
                  Daily Three, ~5m floor
                </div>
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ mode: 'advanced' })}
                className={`p-3 rounded-2xl text-left transition-all border ${
                  settings.mode === 'advanced'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
                }`}
              >
                <div className="font-semibold text-xs">Advanced Mode</div>
                <div className={`text-[10px] mt-0.5 ${settings.mode === 'advanced' ? 'text-white/70' : 'text-neutral-500'}`}>
                  Tasks, sprints, projects
                </div>
              </button>
            </div>
          </div>

          {/* Week Start */}
          <div>
            <label className="block font-semibold mb-1.5 text-neutral-900">
              Week Starts On
            </label>
            <select
              value={settings.weekStartDay}
              onChange={(e) =>
                updateSettings({ weekStartDay: e.target.value as 'monday' | 'sunday' })
              }
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-neutral-800 font-medium"
            >
              <option value="monday">Monday (Standard)</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>

          {/* Gentle Nudges */}
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
            <div>
              <div className="font-semibold text-neutral-900">Kind Observations</div>
              <div className="text-[11px] text-neutral-500">
                Show non-judgmental weekly observations
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.gentleNudgesEnabled}
              onChange={(e) => updateSettings({ gentleNudgesEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900 cursor-pointer"
            />
          </div>

          {/* Export & Import */}
          <div className="pt-3 border-t border-neutral-100 space-y-2">
            <div className="font-semibold text-neutral-900">Data Backup & Portability</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={exportData}
                className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl transition-colors font-semibold text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl transition-colors font-semibold text-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
            {importStatus && (
              <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-center font-medium">
                {importStatus}
              </p>
            )}
          </div>

          {/* Reset sample data */}
          <div className="pt-2 border-t border-neutral-100">
            {confirmReset ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-rose-800 font-semibold text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Reset all data to default samples?</span>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-2.5 py-1 text-xs text-neutral-600 hover:text-neutral-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetToDefaults();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 text-[11px]">Need clean sample records?</span>
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-rose-600 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Sample Data</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-xl shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
