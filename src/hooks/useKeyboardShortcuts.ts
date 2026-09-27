import { useEffect, useCallback } from 'react';

export interface ShortcutDefinition {
  id: string;
  key: string; // e.g. 'k', 'n', 's', 'm', '?', '1', etc.
  metaOrCtrl?: boolean; // Cmd on Mac, Ctrl on Win/Linux
  shift?: boolean;
  alt?: boolean;
  allowInInput?: boolean;
  preventDefault?: boolean;
  category: 'General' | 'Navigation' | 'Actions' | 'Sprint';
  description: string;
  displayKey?: string; // custom display like '⌘K' or 'N'
  action: (e: KeyboardEvent) => void;
  enabled?: boolean;
}

// Detect if current platform is Mac
export const isMacPlatform = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
};

// Check if an event originated from an editable form element
export const isInputElement = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  );
};

export const getModifierLabel = (): string => {
  return isMacPlatform() ? '⌘' : 'Ctrl+';
};

interface UseKeyboardShortcutsOptions {
  shortcuts: ShortcutDefinition[];
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) => {
  const isMac = isMacPlatform();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const inInput = isInputElement(event.target);
      const isModifierPressed = isMac ? event.metaKey : event.ctrlKey;

      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        // Check if allowed in inputs (e.g., Cmd+K, Escape)
        if (inInput && !shortcut.allowInInput) {
          continue;
        }

        // Match modifier key (Cmd/Ctrl)
        if (Boolean(shortcut.metaOrCtrl) !== isModifierPressed) {
          continue;
        }

        // Match Shift key
        if (Boolean(shortcut.shift) !== event.shiftKey) {
          continue;
        }

        // Match Alt/Option key
        if (Boolean(shortcut.alt) !== event.altKey) {
          continue;
        }

        // Match the key itself (case insensitive comparison)
        const pressedKey = event.key.toLowerCase();
        const targetKey = shortcut.key.toLowerCase();

        if (pressedKey === targetKey) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
            event.stopPropagation();
          }
          shortcut.action(event);
          return;
        }
      }
    },
    [shortcuts, enabled, isMac]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleKeyDown]);
};
