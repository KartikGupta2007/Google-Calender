"use client";

import { useState } from "react";
import { X, Plus, Star, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { useOfflineTasks } from "@/hooks/use-offline-tasks";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function TasksPanel() {
  const [isListsOpen, setIsListsOpen] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [showStarred, setShowStarred] = useState(false);
  const [activeView, setActiveView] = useState<'all' | 'starred' | string>('all');

  const {
    tasks,
    taskLists,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    createTaskList,
  } = useOfflineTasks();

  const handleAddTask = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTaskTitle.trim()) {
      await createTask({
        title: newTaskTitle,
        listId: selectedListId || taskLists[0]?.id,
      });
      setNewTaskTitle("");
    }
  };

  const handleToggleTask = async (taskId: string) => {
    await toggleTaskComplete(taskId);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const handleToggleStar = async (taskId: string, currentStarred: boolean) => {
    await updateTask(taskId, { starred: !currentStarred });
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (showStarred) return task.starred;
    if (selectedListId) return task.listId === selectedListId;
    return true;
  });

  // Separate completed and incomplete tasks
  const incompleteTasks = filteredTasks.filter((task) => !task.completed);
  const completedTasks = filteredTasks.filter((task) => task.completed);

  return (
    <div
      className="flex flex-col"
      style={{
        background: '#2A2A2A',
        height: 'calc(100vh - 64px)',
        width: '100%'
      }}
    >
      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Dark Theme */}
        <div className="flex flex-col" style={{ width: '240px', background: '#1E1E1E' }}>
          {/* Create Button */}
          <div style={{ padding: '16px' }}>
            <button
              onClick={async () => {
                const title = prompt("Enter task title:");
                if (title) {
                  await createTask({
                    title,
                    listId: selectedListId || taskLists[0]?.id,
                  });
                }
              }}
              className="flex items-center justify-center w-full transition-all"
              style={{
                padding: '12px 20px',
                background: '#3C4043',
                color: '#E0E0E0',
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Create
            </button>
          </div>

          {/* All tasks */}
          <button
            onClick={() => {
              setSelectedListId(null);
              setShowStarred(false);
              setActiveView('all');
            }}
            className="flex items-center px-4 py-3 text-left transition-colors"
            style={{
              background: activeView === 'all' ? '#1A73E8' : 'transparent',
              color: activeView === 'all' ? '#FFFFFF' : '#E0E0E0',
              borderRadius: activeView === 'all' ? '0 24px 24px 0' : '0',
              marginRight: '8px',
              fontWeight: activeView === 'all' ? 500 : 400,
              fontSize: '14px'
            }}
          >
            <CheckCircle2 className="h-5 w-5 mr-3" />
            <span>All tasks</span>
          </button>

          {/* Starred */}
          <button
            onClick={() => {
              setSelectedListId(null);
              setShowStarred(true);
              setActiveView('starred');
            }}
            className="flex items-center px-4 py-3 text-left transition-colors hover:bg-[#2A2A2A]"
            style={{
              background: activeView === 'starred' ? '#1A73E8' : 'transparent',
              color: activeView === 'starred' ? '#FFFFFF' : '#E0E0E0',
              borderRadius: activeView === 'starred' ? '0 24px 24px 0' : '0',
              marginRight: '8px',
              fontSize: '14px'
            }}
          >
            <Star className="h-5 w-5 mr-3" />
            <span>Starred</span>
          </button>

          {/* Lists Section */}
          <div style={{ marginTop: '24px' }}>
            <button
              onClick={() => setIsListsOpen(!isListsOpen)}
              className="flex items-center justify-between w-full px-4 py-2 text-left transition-colors hover:bg-[#2A2A2A]"
              style={{ color: '#9AA0A6', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              <span>Lists</span>
              {isListsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>

            {isListsOpen && (
              <div>
                {taskLists.map((list) => {
                  const listTaskCount = tasks.filter(t => t.listId === list.id).length;
                  const isActive = selectedListId === list.id;
                  return (
                    <button
                      key={list.id}
                      onClick={() => {
                        setSelectedListId(list.id);
                        setShowStarred(false);
                        setActiveView(list.id);
                      }}
                      className="flex items-center justify-between w-full px-4 py-3 transition-colors hover:bg-[#2A2A2A]"
                      style={{
                        color: isActive ? '#FFFFFF' : '#E0E0E0',
                        background: isActive ? '#1A73E8' : 'transparent',
                        borderRadius: isActive ? '0 24px 24px 0' : '0',
                        marginRight: '8px',
                        fontSize: '14px'
                      }}
                    >
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 mr-3 rounded border"
                          style={{
                            borderColor: isActive ? '#FFFFFF' : '#5F6368',
                            background: list.isVisible ? (isActive ? '#FFFFFF' : '#1A73E8') : 'transparent'
                          }}
                        />
                        <span>{list.name}</span>
                      </div>
                      <span style={{ color: '#9AA0A6', fontSize: '12px' }}>{listTaskCount}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={async () => {
                const name = prompt("Enter task list name:");
                if (name) await createTaskList(name);
              }}
              className="flex items-center px-4 py-3 text-left hover:bg-[#2A2A2A] transition-colors w-full"
              style={{ color: '#E0E0E0', fontSize: '14px' }}
            >
              <Plus className="h-5 w-5 mr-3" />
              <span>Create new list</span>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col" style={{ background: '#2A2A2A' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #3C4043' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              {showStarred ? 'Starred' : selectedListId ? taskLists.find(l => l.id === selectedListId)?.name : 'My Tasks'}
            </h1>
            <button
              style={{
                padding: '8px 16px',
                background: '#1A73E8',
                color: '#FFFFFF',
                borderRadius: '16px',
                border: 'none',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Post
            </button>
          </div>

          {/* Add Task Input */}
          <div className="px-6 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid #3C4043' }}>
            <CheckCircle2 style={{ color: '#9AA0A6', width: '20px', height: '20px' }} />
            <input
              type="text"
              placeholder="Add a task"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleAddTask}
              className="flex-1 bg-transparent border-0 outline-none"
              style={{
                color: '#E0E0E0',
                fontSize: '14px',
                fontWeight: 400
              }}
            />
          </div>

          {/* Tasks List */}
          <div className="flex-1 overflow-y-auto px-6 py-2">
            {isLoading ? (
              <div className="text-center py-8" style={{ color: '#9aa0a6' }}>
                Loading tasks...
              </div>
            ) : (
              <>
                {/* Incomplete Tasks */}
                {incompleteTasks.length > 0 && (
                  <div>
                    {/* Past Tasks Section */}
                    {incompleteTasks.some(task => task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day')) && (
                      <>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#FF5252',
                            fontWeight: 500,
                            paddingLeft: '8px',
                            paddingTop: '8px',
                            paddingBottom: '8px',
                            textTransform: 'capitalize'
                          }}
                        >
                          Past
                        </div>
                        {incompleteTasks
                          .filter(task => task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day'))
                          .map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center gap-3 transition-colors group"
                              style={{
                                height: '48px',
                                paddingLeft: '8px',
                                paddingRight: '8px',
                                cursor: 'pointer'
                              }}
                            >
                              <button
                                onClick={() => handleToggleTask(task.id)}
                                className="flex items-center justify-center"
                                style={{ width: '20px', height: '20px', flexShrink: 0 }}
                              >
                                <div
                                  className="w-5 h-5 rounded-full border-2 hover:border-[#8ab4f8] transition-colors"
                                  style={{ borderColor: '#9aa0a6' }}
                                ></div>
                              </button>
                              <div className="flex-1 flex items-center gap-3 min-w-0">
                                <span style={{ color: '#E0E0E0', fontSize: '14px', fontWeight: 400 }}>
                                  {task.title}
                                </span>
                                <div
                                  style={{
                                    background: '#FF5252',
                                    color: '#FFFFFF',
                                    fontSize: '12px',
                                    padding: '4px 12px',
                                    borderRadius: '16px',
                                    whiteSpace: 'nowrap',
                                    fontWeight: 400
                                  }}
                                >
                                  {dayjs(task.dueDate).fromNow()}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStar(task.id, task.starred);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ flexShrink: 0 }}
                              >
                                <Star
                                  className="h-5 w-5"
                                  fill={task.starred ? '#fbbc04' : 'none'}
                                  stroke={task.starred ? '#fbbc04' : '#9aa0a6'}
                                />
                              </button>
                            </div>
                          ))}
                      </>
                    )}

                    {/* Current/Future Tasks */}
                    {incompleteTasks
                      .filter(task => !task.dueDate || !dayjs(task.dueDate).isBefore(dayjs(), 'day'))
                      .map((task) => {
                        const isPastDue = task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day');
                        return (
                          <div
                            key={task.id}
                            className="flex items-center gap-3 transition-colors group"
                            style={{
                              height: '48px',
                              paddingLeft: '8px',
                              paddingRight: '8px',
                              cursor: 'pointer'
                            }}
                          >
                            <button
                              onClick={() => handleToggleTask(task.id)}
                              className="flex items-center justify-center"
                              style={{ width: '20px', height: '20px', flexShrink: 0 }}
                            >
                              <div
                                className="w-5 h-5 rounded-full border-2 hover:border-[#8ab4f8] transition-colors"
                                style={{ borderColor: '#9aa0a6' }}
                              ></div>
                            </button>
                            <div className="flex-1 flex items-center gap-3 min-w-0">
                              <span style={{ color: '#E0E0E0', fontSize: '14px', fontWeight: 400 }}>
                                {task.title}
                              </span>
                              {task.dueDate && isPastDue && (
                                <div
                                  style={{
                                    background: '#FF5252',
                                    color: '#FFFFFF',
                                    fontSize: '12px',
                                    padding: '4px 12px',
                                    borderRadius: '16px',
                                    whiteSpace: 'nowrap',
                                    fontWeight: 400
                                  }}
                                >
                                  {dayjs(task.dueDate).fromNow()}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStar(task.id, task.starred);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ flexShrink: 0 }}
                            >
                              <Star
                                className="h-5 w-5"
                                fill={task.starred ? '#fbbc04' : 'none'}
                                stroke={task.starred ? '#fbbc04' : '#9aa0a6'}
                              />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Completed Tasks Section */}
                {completedTasks.length > 0 && (
                  <div style={{ marginTop: incompleteTasks.length > 0 ? '24px' : '0' }}>
                    {/* Section Separator */}
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#9AA0A6',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        paddingLeft: '8px',
                        paddingBottom: '8px',
                        paddingTop: '8px'
                      }}
                    >
                      Completed ({completedTasks.length})
                    </div>
                    {completedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 transition-colors group"
                        style={{
                          height: '48px',
                          paddingLeft: '8px',
                          paddingRight: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          className="flex items-center justify-center"
                          style={{ width: '20px', height: '20px', flexShrink: 0 }}
                        >
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: '#8ab4f8' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          </div>
                        </button>
                        <div className="flex-1 min-w-0">
                          <span
                            style={{
                              color: '#9AA0A6',
                              fontSize: '14px',
                              fontWeight: 400,
                              textDecoration: 'line-through'
                            }}
                          >
                            {task.title}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ flexShrink: 0 }}
                        >
                          <X className="h-5 w-5" style={{ color: '#9aa0a6' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {filteredTasks.length === 0 && (
                  <div className="text-center py-12" style={{ color: '#9aa0a6' }}>
                    <p style={{ fontSize: '14px', marginBottom: '8px' }}>No tasks yet</p>
                    <p style={{ fontSize: '12px', color: '#9AA0A6' }}>Add a task to get started</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
