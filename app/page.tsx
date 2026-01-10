"use client";

import { useState } from "react";
import Header from "@/components/header/Header";
import MainViewOffline from "@/components/MainView.offline";
import KeyboardShortcuts from "@/components/keyboard-shortcuts";
import SettingsSync from "@/components/settings-sync";
import TasksPanel from "@/components/tasks-panel";
import DynamicTitle from "@/components/dynamic-title";
import { useViewStore } from "@/lib/store";

export default function Home() {
  const [isTasksPanelOpen, setIsTasksPanelOpen] = useState(false);
  const { setView } = useViewStore();

  return (
    <>
      <DynamicTitle />
      <div style={{ background: 'var(--surface)' }}>
        <SettingsSync />
        <KeyboardShortcuts />
        <Header
          onTasksClick={() => {
            setIsTasksPanelOpen(!isTasksPanelOpen);
            if (isTasksPanelOpen) {
              setView("month");
            }
          }}
          isTaskMode={isTasksPanelOpen}
        />
        {isTasksPanelOpen ? (
          <TasksPanel />
        ) : (
          <MainViewOffline />
        )}
      </div>
    </>
  );
}
