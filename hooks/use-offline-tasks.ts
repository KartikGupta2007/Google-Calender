'use client'

import { useCallback, useState, useEffect } from 'react'
import { offlineDb, OfflineTask, TaskList } from '@/lib/offline-db'

export function useOfflineTasks() {
  const [tasks, setTasks] = useState<OfflineTask[]>([])
  const [taskLists, setTaskLists] = useState<TaskList[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load tasks and task lists from localStorage
  const reloadTasks = useCallback(async () => {
    setIsLoading(true)
    try {
      const [loadedTasks, loadedLists] = await Promise.all([
        offlineDb.getTasks(),
        offlineDb.getTaskLists()
      ])
      setTasks(loadedTasks)
      setTaskLists(loadedLists)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load tasks on mount
  useEffect(() => {
    reloadTasks()

    // Listen for custom events
    const handleTaskChanged = () => reloadTasks()

    window.addEventListener('offline-task-created', handleTaskChanged)
    window.addEventListener('offline-task-updated', handleTaskChanged)
    window.addEventListener('offline-task-deleted', handleTaskChanged)

    return () => {
      window.removeEventListener('offline-task-created', handleTaskChanged)
      window.removeEventListener('offline-task-updated', handleTaskChanged)
      window.removeEventListener('offline-task-deleted', handleTaskChanged)
    }
  }, [reloadTasks])

  // Create task
  const createTask = useCallback(async (data: {
    title: string
    description?: string
    dueDate?: string
    listId?: string
    starred?: boolean
  }) => {
    try {
      const lists = await offlineDb.getTaskLists()
      const defaultList = lists[0] || { id: 'tasklist_default', name: 'My Tasks' }

      await offlineDb.createTask({
        title: data.title,
        description: data.description || null,
        completed: false,
        dueDate: data.dueDate || null,
        listId: data.listId || defaultList.id,
        listName: defaultList.name,
        starred: data.starred || false,
      })

      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('offline-task-created'))

      await reloadTasks()
      return { success: true }
    } catch (error) {
      console.error('Failed to create task:', error)
      return { success: false, error: 'Failed to create task' }
    }
  }, [reloadTasks])

  // Update task
  const updateTask = useCallback(async (id: string, updates: Partial<OfflineTask>) => {
    try {
      await offlineDb.updateTask(id, updates)

      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('offline-task-updated'))

      await reloadTasks()
      return { success: true }
    } catch (error) {
      console.error('Failed to update task:', error)
      return { success: false, error: 'Failed to update task' }
    }
  }, [reloadTasks])

  // Delete task
  const deleteTask = useCallback(async (id: string) => {
    try {
      await offlineDb.deleteTask(id)

      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('offline-task-deleted'))

      await reloadTasks()
      return { success: true }
    } catch (error) {
      console.error('Failed to delete task:', error)
      return { success: false, error: 'Failed to delete task' }
    }
  }, [reloadTasks])

  // Toggle task completion
  const toggleTaskComplete = useCallback(async (id: string) => {
    try {
      await offlineDb.toggleTaskComplete(id)

      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('offline-task-updated'))

      await reloadTasks()
      return { success: true }
    } catch (error) {
      console.error('Failed to toggle task:', error)
      return { success: false, error: 'Failed to toggle task' }
    }
  }, [reloadTasks])

  // Create task list
  const createTaskList = useCallback(async (name: string) => {
    try {
      await offlineDb.createTaskList({
        name,
        isVisible: true,
      })

      await reloadTasks()
      return { success: true }
    } catch (error) {
      console.error('Failed to create task list:', error)
      return { success: false, error: 'Failed to create task list' }
    }
  }, [reloadTasks])

  return {
    tasks,
    taskLists,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    createTaskList,
    reloadTasks,
  }
}
