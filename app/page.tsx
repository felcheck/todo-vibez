'use client';

import React, { useState, useEffect } from 'react';
import db from '../lib/db';
import {
  useTasks,
  addTask,
  toggleTask as toggleTaskFn,
  updateTaskTitle as updateTaskTitleFn,
  deleteTask as deleteTaskFn,
  migrateGuestTasks,
  reorderTasks,
  type Task,
} from '../lib/useTasks';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Auth Modal Component
function AuthModal({ onClose }: { onClose: () => void }) {
  const [sentEmail, setSentEmail] = useState('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {!sentEmail ? (
          <EmailStep onSendEmail={setSentEmail} onClose={onClose} />
        ) : (
          <CodeStep sentEmail={sentEmail} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function EmailStep({
  onSendEmail,
  onClose,
}: {
  onSendEmail: (email: string) => void;
  onClose: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputEl = inputRef.current!;
    const email = inputEl.value;
    onSendEmail(email);
    db.auth.sendMagicCode({ email }).catch((err) => {
      alert('Error: ' + err.body?.message);
      onSendEmail('');
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-rose-900">
          Sign up to save your tasks
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-rose-400 hover:text-rose-600"
        >
          ×
        </button>
      </div>
      <p className="text-sm text-rose-700">
        Enter your email and we'll send you a magic code to sign in.
      </p>
      <div>
        <input
          ref={inputRef}
          type="email"
          className="w-full rounded-lg border border-rose-200 bg-white px-4 py-3 text-rose-900 placeholder-rose-300 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
          placeholder="Enter your email"
          required
          autoFocus
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-rose-500 px-4 py-3 font-medium text-white transition-colors hover:bg-rose-600"
      >
        Send Magic Code
      </button>
    </form>
  );
}

function CodeStep({
  sentEmail,
  onClose,
}: {
  sentEmail: string;
  onClose: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputEl = inputRef.current!;
    const code = inputEl.value;
    db.auth.signInWithMagicCode({ email: sentEmail, code }).catch((err) => {
      inputEl.value = '';
      alert('Error: ' + err.body?.message);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-rose-900">Enter code</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-rose-400 hover:text-rose-600"
        >
          ×
        </button>
      </div>
      <div>
        <p className="mb-3 text-sm text-rose-700">
          We sent a code to <strong>{sentEmail}</strong>
        </p>
        <input
          ref={inputRef}
          type="text"
          className="w-full rounded-lg border border-rose-200 bg-white px-4 py-3 text-rose-900 placeholder-rose-300 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
          placeholder="Enter code"
          required
          autoFocus
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-rose-500 px-4 py-3 font-medium text-white transition-colors hover:bg-rose-600"
      >
        Verify Code
      </button>
    </form>
  );
}

// Sortable Task Component
function SortableTask({
  task,
  isAuthenticated,
  editingTaskId,
  editTitle,
  bouncingCheckbox,
  completingTaskId,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggle,
  onDelete,
  onEditTitleChange,
}: {
  task: Task;
  isAuthenticated: boolean;
  editingTaskId: string | null;
  editTitle: string;
  bouncingCheckbox: string | null;
  completingTaskId: string | null;
  onStartEdit: (taskId: string, currentTitle: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onToggle: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onEditTitleChange: (title: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm shadow-rose-100 transition-shadow hover:shadow-md ${
        completingTaskId === task.id ? 'task-completing' : ''
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-rose-300 hover:text-rose-500 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </div>

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={task.completed}
        onChange={(e) => onToggle(task.id, e.target.checked)}
        className={`h-5 w-5 cursor-pointer rounded border-rose-200 checkbox-hover ${
          bouncingCheckbox === task.id ? 'checkbox-checked' : ''
        }`}
      />

      {/* Task Content */}
      {editingTaskId === task.id ? (
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit();
              if (e.key === 'Escape') onCancelEdit();
            }}
            className="flex-1 rounded border border-rose-200 px-2 py-1 text-rose-900 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
            autoFocus
          />
          <button
            onClick={onSaveEdit}
            className="rounded bg-rose-500 px-3 py-1 text-sm text-white hover:bg-rose-600"
          >
            Save
          </button>
          <button
            onClick={onCancelEdit}
            className="rounded border border-rose-200 px-3 py-1 text-sm text-rose-600 hover:bg-rose-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <span
            className={`flex-1 cursor-pointer ${
              task.completed
                ? 'text-rose-300 line-through'
                : 'text-rose-900'
            }`}
            onClick={() => onStartEdit(task.id, task.title)}
          >
            {task.title}
          </span>
          <button
            onClick={() => onDelete(task.id)}
            className="text-rose-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}

// Main Task List Component
function TaskList() {
  // Check authentication status
  const { user, isLoading: authLoading } = db.useAuth();
  const isAuthenticated = !!user;
  const userId = user?.id;

  // Get tasks based on auth state
  const { tasks, isLoading, error } = useTasks(isAuthenticated, userId);

  // Local state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [hasMigrated, setHasMigrated] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [bouncingCheckbox, setBouncingCheckbox] = useState<string | null>(null);
  const [asciiArts, setAsciiArts] = useState<Array<{ id: string; art: string; type: number }>>([]);

  // Setup drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end - reorder tasks
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Calculate new order value (average between adjacent tasks)
    let newOrder: number;

    if (newIndex === 0) {
      // Moving to first position
      newOrder = (tasks[0].order ?? tasks[0].createdAt) / 2;
    } else if (newIndex === tasks.length - 1) {
      // Moving to last position
      newOrder = (tasks[tasks.length - 1].order ?? tasks[tasks.length - 1].createdAt) + 1000;
    } else if (oldIndex < newIndex) {
      // Moving down
      newOrder = ((tasks[newIndex].order ?? tasks[newIndex].createdAt) + (tasks[newIndex + 1].order ?? tasks[newIndex + 1].createdAt)) / 2;
    } else {
      // Moving up
      newOrder = ((tasks[newIndex - 1].order ?? tasks[newIndex - 1].createdAt) + (tasks[newIndex].order ?? tasks[newIndex].createdAt)) / 2;
    }

    reorderTasks(active.id as string, newOrder, isAuthenticated);
  };

  // Migrate guest tasks when user authenticates
  useEffect(() => {
    if (isAuthenticated && userId && !hasMigrated) {
      // Only migrate if there are actually guest tasks to migrate
      const hasTasksToMigrate = typeof window !== 'undefined' &&
        localStorage.getItem('todo-vibez-guest-tasks') !== null;

      if (hasTasksToMigrate) {
        migrateGuestTasks(userId)
          .then(() => {
            setHasMigrated(true);
            setShowAuthModal(false);
          })
          .catch((err) => {
            console.error('Migration failed:', err);
            // Set as migrated anyway to prevent retry loops
            setHasMigrated(true);
          });
      } else {
        // No tasks to migrate, just close modal and mark as done
        setHasMigrated(true);
        setShowAuthModal(false);
      }
    }
  }, [isAuthenticated, userId, hasMigrated]);

  // Reset migration state when user signs out
  useEffect(() => {
    if (!isAuthenticated) {
      setHasMigrated(false);
    }
  }, [isAuthenticated]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="text-rose-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="text-red-600">Error: {error.message}</div>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle, isAuthenticated, userId);
    setNewTaskTitle('');
    setShowAddModal(false);
  };

  const handleStartEdit = (taskId: string, currentTitle: string) => {
    setEditingTaskId(taskId);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = () => {
    if (editingTaskId && editTitle.trim()) {
      updateTaskTitleFn(editingTaskId, editTitle, isAuthenticated);
      setEditingTaskId(null);
      setEditTitle('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditTitle('');
  };

  const handleToggleTask = (taskId: string, completed: boolean) => {
    // Trigger head-bob animation
    setCompletingTaskId(taskId);
    // Trigger checkbox bounce
    setBouncingCheckbox(taskId);

    // Actually toggle the task
    toggleTaskFn(taskId, completed, isAuthenticated);

    // Trigger ASCII art when completing a task
    if (completed) {
      const asciiPatterns = [
        `  /\\_/\\  \n ( o.o ) \n  > ^ <  \n ~vibin~`,
        `♪ ♫ ♪ ♫\n  vibin'\n♫ ♪ ♫ ♪`,
        `✨ NICE ✨\n   WORK!`,
        `  ^_^\n <(vibe)\n  ( )_( )`,
      ];

      const randomArt = asciiPatterns[Math.floor(Math.random() * asciiPatterns.length)];
      const newArt = {
        id: Date.now().toString() + Math.random(),
        art: randomArt,
        type: Math.floor(Math.random() * 3) + 1
      };

      setAsciiArts(prev => [...prev, newArt]);

      // Remove after animation completes
      setTimeout(() => {
        setAsciiArts(prev => prev.filter(art => art.id !== newArt.id));
      }, 5000);
    }

    // Clear animations after they complete
    setTimeout(() => {
      setCompletingTaskId(null);
      setBouncingCheckbox(null);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
      {/* ASCII Art Animations */}
      {asciiArts.map(art => (
        <div
          key={art.id}
          className={`ascii-art ascii-art-${art.type}`}
        >
          {art.art}
        </div>
      ))}

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-40 -mx-4 mb-8 bg-gradient-to-r from-rose-50/95 to-orange-50/95 px-4 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Vibing Cat GIF */}
              <img
                src="https://media.giphy.com/media/15wC7XdIXN5q8o6fr9/giphy.gif"
                alt="vibing cat"
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-4xl font-light tracking-tight text-rose-900">
                  Todo Vibez
                </h1>
                <p className="mt-1 text-sm text-rose-700">
                  {completedCount} completed, {pendingCount} pending
                </p>
              </div>
            </div>
            {isAuthenticated ? (
              <button
                onClick={() => db.auth.signOut()}
                className="text-sm text-rose-600 transition-colors hover:text-rose-900"
              >
                Sign out
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600"
              >
                Sign up to save
              </button>
            )}
          </div>
        </div>

        {/* Task List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <div className="rounded-lg bg-white p-12 text-center shadow-sm shadow-rose-100">
                  <p className="text-rose-400">
                    No tasks yet. Click the + button to add one.
                  </p>
                </div>
              ) : (
                tasks.map((task) => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    isAuthenticated={isAuthenticated}
                    editingTaskId={editingTaskId}
                    editTitle={editTitle}
                    bouncingCheckbox={bouncingCheckbox}
                    completingTaskId={completingTaskId}
                    onStartEdit={handleStartEdit}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                    onToggle={handleToggleTask}
                    onDelete={(taskId) => deleteTaskFn(taskId, isAuthenticated)}
                    onEditTitleChange={setEditTitle}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>

        {/* Floating Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-2xl text-white shadow-lg shadow-rose-200 transition-transform hover:scale-110 hover:bg-rose-600"
        >
          +
        </button>

        {/* Add Task Modal */}
        {showAddModal && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl shadow-rose-100"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-4 text-xl font-semibold text-rose-900">
                Add New Task
              </h2>
              <form onSubmit={handleAddTask}>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="mb-4 w-full rounded-lg border border-rose-200 px-4 py-3 text-rose-900 placeholder-rose-300 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-rose-500 px-4 py-2 font-medium text-white transition-colors hover:bg-rose-600"
                  >
                    Add Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 rounded-lg border border-rose-200 px-4 py-2 font-medium text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Auth Modal */}
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  return <TaskList />;
}
