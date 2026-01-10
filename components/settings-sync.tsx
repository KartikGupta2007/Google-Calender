"use client";

import { useEffect } from 'react';
import { useSettingsStore } from '@/lib/settings-store';
import { useViewStore } from '@/lib/store';

/**
 * Component that syncs settings with the rest of the application
 * This runs in the background and updates the view when settings change
 */
export default function SettingsSync() {
  const settingsDefaultView = useSettingsStore((state) => state.defaultView);
  const { selectedView, setView } = useViewStore();

  // Sync default view setting with current view on mount
  useEffect(() => {
    // Only set the view if it's different from current and we're initializing
    if (selectedView === "month" && settingsDefaultView !== "month") {
      setView(settingsDefaultView);
    }
  }, []);

  // Listen for changes to defaultView setting
  useEffect(() => {
    // Update the current view when default view setting changes
    if (settingsDefaultView !== selectedView) {
      setView(settingsDefaultView);
    }
  }, [settingsDefaultView]);

  return null; // This component doesn't render anything
}
