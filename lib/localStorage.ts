// localStorage utilities for guest mode
export interface GuestTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'todo-vibez-guest-tasks';

export function getGuestTasks(): GuestTask[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading guest tasks:', error);
    return [];
  }
}

export function setGuestTasks(tasks: GuestTask[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving guest tasks:', error);
  }
}

export function addGuestTask(task: GuestTask): void {
  const tasks = getGuestTasks();
  setGuestTasks([task, ...tasks]);
}

export function updateGuestTask(taskId: string, updates: Partial<GuestTask>): void {
  const tasks = getGuestTasks();
  const updatedTasks = tasks.map(task =>
    task.id === taskId ? { ...task, ...updates } : task
  );
  setGuestTasks(updatedTasks);
}

export function deleteGuestTask(taskId: string): void {
  const tasks = getGuestTasks();
  setGuestTasks(tasks.filter(task => task.id !== taskId));
}

export function clearGuestTasks(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasGuestTasks(): boolean {
  return getGuestTasks().length > 0;
}
