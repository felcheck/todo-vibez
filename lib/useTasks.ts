import { useState, useEffect } from 'react';
import { id } from '@instantdb/react';
import db from './db';
import {
  getGuestTasks,
  addGuestTask,
  updateGuestTask,
  deleteGuestTask,
  hasGuestTasks,
  clearGuestTasks,
  type GuestTask,
} from './localStorage';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export function useTasks(isAuthenticated: boolean, userId?: string) {
  // For authenticated users, use InstantDB
  const { isLoading: dbLoading, error: dbError, data } = db.useQuery(
    isAuthenticated && userId
      ? {
          tasks: {
            $: {
              where: { 'owner.id': userId },
              order: { createdAt: 'desc' },
            },
          },
        }
      : { tasks: {} }
  );

  // For guest users, use localStorage with state management
  const [guestTasks, setGuestTasks] = useState<GuestTask[]>([]);
  const [isLoadingGuest, setIsLoadingGuest] = useState(true);

  // Load guest tasks on mount and listen for changes
  useEffect(() => {
    if (!isAuthenticated) {
      // Initial load
      setGuestTasks(getGuestTasks());
      setIsLoadingGuest(false);

      // Listen for storage changes
      const handleStorageChange = () => {
        setGuestTasks(getGuestTasks());
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [isAuthenticated]);

  // Determine which data source to use
  const tasks = isAuthenticated ? (data?.tasks || []) : guestTasks;
  const isLoading = isAuthenticated ? dbLoading : isLoadingGuest;
  const error = isAuthenticated ? dbError : null;

  return { tasks, isLoading, error };
}

export function addTask(title: string, isAuthenticated: boolean, userId?: string) {
  if (isAuthenticated && userId) {
    // Add to InstantDB
    db.transact(
      db.tx.tasks[id()]
        .update({
          title,
          completed: false,
          createdAt: Date.now(),
        })
        .link({ owner: userId })
    );
  } else {
    // Add to localStorage
    const newTask: GuestTask = {
      id: id(),
      title,
      completed: false,
      createdAt: Date.now(),
    };
    addGuestTask(newTask);
    // Trigger re-render by dispatching storage event
    window.dispatchEvent(new Event('storage'));
  }
}

export function toggleTask(taskId: string, completed: boolean, isAuthenticated: boolean) {
  if (isAuthenticated) {
    db.transact(db.tx.tasks[taskId].update({ completed }));
  } else {
    updateGuestTask(taskId, { completed });
    window.dispatchEvent(new Event('storage'));
  }
}

export function updateTaskTitle(taskId: string, title: string, isAuthenticated: boolean) {
  if (isAuthenticated) {
    db.transact(db.tx.tasks[taskId].update({ title }));
  } else {
    updateGuestTask(taskId, { title });
    window.dispatchEvent(new Event('storage'));
  }
}

export function deleteTask(taskId: string, isAuthenticated: boolean) {
  if (isAuthenticated) {
    db.transact(db.tx.tasks[taskId].delete());
  } else {
    deleteGuestTask(taskId);
    window.dispatchEvent(new Event('storage'));
  }
}

// Migration function: move guest tasks to InstantDB
export async function migrateGuestTasks(userId: string) {
  if (!hasGuestTasks()) return;

  const guestTasks = getGuestTasks();

  // Batch all tasks into a single transaction
  const transactions = guestTasks.map(task =>
    db.tx.tasks[task.id]
      .update({
        title: task.title,
        completed: task.completed,
        createdAt: task.createdAt,
      })
      .link({ owner: userId })
  );

  try {
    await db.transact(transactions);
    // Clear guest tasks after successful migration
    clearGuestTasks();
    console.log(`Migrated ${guestTasks.length} tasks to InstantDB`);
  } catch (error) {
    console.error('Error migrating tasks:', error);
    throw error;
  }
}
