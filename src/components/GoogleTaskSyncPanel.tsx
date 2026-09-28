import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CheckSquare, 
  Square, 
  ListTodo, 
  Plus, 
  RefreshCw, 
  Calendar, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  Filter, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Clock, 
  User as UserIcon, 
  Server,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout, auth } from '../lib/firebase';
import { 
  listGoogleTasks, 
  createGoogleTask, 
  updateGoogleTaskStatus, 
  deleteGoogleTask, 
  GoogleTaskItem,
  createGoogleSpreadsheet,
  appendSpreadsheetValues
} from '../lib/workspace';

interface GoogleTaskSyncPanelProps {
  className?: string;
  onTasksUpdated?: (tasks: GoogleTaskItem[]) => void;
}

export function GoogleTaskSyncPanel({ className = '', onTasksUpdated }: GoogleTaskSyncPanelProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'completed'>('all');

  // New task creation state
  const [newTitle, setNewTitle] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Sheets export state
  const [isExportingToSheet, setIsExportingToSheet] = useState<boolean>(false);
  const [exportSheetUrl, setExportSheetUrl] = useState<string | null>(null);

  // Task item in-flight state tracking
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  // 1. Listen to Firebase Authentication Context
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        fetchTasks(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setTasks([]);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Fetch Tasks from Google Tasks API
  const fetchTasks = useCallback(async (token = accessToken) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const items = await listGoogleTasks(token);
      setTasks(items);
      if (onTasksUpdated) onTasksUpdated(items);
    } catch (err: any) {
      console.warn('Google Tasks fetch error:', err);
      showNotification('error', `Tasks API: ${err.message || 'Failed to fetch tasks'}`);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, onTasksUpdated]);

  // 3. Toggle Task Completion Status
  const handleToggleTask = async (task: GoogleTaskItem) => {
    if (!accessToken) return;
    const isCurrentlyCompleted = task.status === 'completed';
    const willBeCompleted = !isCurrentlyCompleted;

    // Optimistic UI update
    setTasks(prev =>
      prev.map(t =>
        t.id === task.id
          ? {
              ...t,
              status: willBeCompleted ? 'completed' : 'needsAction',
              completed: willBeCompleted ? new Date().toISOString() : undefined,
            }
          : t
      )
    );

    setUpdatingTaskIds(prev => new Set(prev).add(task.id));

    try {
      const updated = await updateGoogleTaskStatus(accessToken, '@default', task.id, willBeCompleted);
      setTasks(prev => prev.map(t => (t.id === task.id ? updated : t)));
      showNotification(
        'success',
        `Task "${task.title.slice(0, 24)}" marked as ${willBeCompleted ? 'completed' : 'active'}`
      );

      // Also sync update to Cloud SQL if user is authenticated
      if (user) {
        try {
          const idToken = await user.getIdToken();
          await fetch('/api/cloudsql/tasks/sync', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${idToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              taskId: updated.id,
              title: updated.title,
              notes: updated.notes || '',
              status: updated.status,
              due: updated.due,
            }),
          });
        } catch {
          // Non-blocking secondary sync
        }
      }
    } catch (err: any) {
      // Revert on error
      setTasks(prev =>
        prev.map(t =>
          t.id === task.id
            ? {
                ...t,
                status: isCurrentlyCompleted ? 'completed' : 'needsAction',
              }
            : t
        )
      );
      showNotification('error', `Failed to update task: ${err.message}`);
    } finally {
      setUpdatingTaskIds(prev => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  };

  // 4. Create New Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newTitle.trim()) return;

    setIsAdding(true);
    try {
      const taskPayload: { title: string; notes?: string; due?: string } = {
        title: newTitle.trim(),
        notes: newNotes.trim() || undefined,
        due: newDueDate ? new Date(newDueDate).toISOString() : undefined,
      };

      const created = await createGoogleTask(accessToken, '@default', taskPayload);
      setTasks(prev => [created, ...prev]);
      setNewTitle('');
      setNewNotes('');
      setNewDueDate('');
      setShowAddForm(false);
      showNotification('success', `Created task: "${created.title}"`);

      // Secondary sync to Cloud SQL
      if (user) {
        try {
          const idToken = await user.getIdToken();
          await fetch('/api/cloudsql/tasks/sync', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${idToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              taskId: created.id,
              title: created.title,
              notes: created.notes || '',
              status: created.status,
              due: created.due,
            }),
          });
        } catch {}
      }
    } catch (err: any) {
      showNotification('error', `Failed to create task: ${err.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  // 5. Delete Task
  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!accessToken) return;
    setUpdatingTaskIds(prev => new Set(prev).add(taskId));
    try {
      await deleteGoogleTask(accessToken, '@default', taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      showNotification('success', `Deleted task: "${title.slice(0, 20)}"`);
    } catch (err: any) {
      showNotification('error', `Failed to delete task: ${err.message}`);
    } finally {
      setUpdatingTaskIds(prev => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  // 6. Google Sheets Export: Export all tasks to a real Google Spreadsheet
  const handleExportTasksToSheet = async () => {
    if (!accessToken) {
      showNotification('error', 'Please authenticate to export to Google Sheets');
      return;
    }
    if (tasks.length === 0) {
      showNotification('error', 'No tasks available to export');
      return;
    }

    setIsExportingToSheet(true);
    try {
      const headers = ['Task ID', 'Status', 'Title', 'Notes', 'Due Date', 'Last Updated', 'Export Timestamp'];
      const rows = tasks.map(t => [
        t.id,
        t.status === 'completed' ? 'COMPLETED' : 'ACTIONABLE',
        t.title,
        t.notes || '',
        t.due ? new Date(t.due).toLocaleDateString() : 'None',
        t.updated ? new Date(t.updated).toLocaleString() : '',
        new Date().toISOString(),
      ]);

      const title = `Aura Task Sync Ledger - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      const spreadsheet = await createGoogleSpreadsheet(accessToken, title, {
        sheetTitle: 'Actionable Tasks',
        rows: [headers, ...rows],
      });

      setExportSheetUrl(spreadsheet.spreadsheetUrl);
      showNotification('success', `Exported ${tasks.length} tasks to new Google Sheet: "${spreadsheet.title}"`);
    } catch (err: any) {
      console.error('Export to Google Sheets error:', err);
      showNotification('error', `Sheets Export Error: ${err.message}`);
    } finally {
      setIsExportingToSheet(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        showNotification('success', `Signed in as ${result.user.displayName || result.user.email}`);
        fetchTasks(result.accessToken);
      }
    } catch (err: any) {
      showNotification('error', err?.message || 'Authentication failed');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Filter and stats
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (!matchesSearch) return false;
      if (filterMode === 'active') return task.status !== 'completed';
      if (filterMode === 'completed') return task.status === 'completed';
      return true;
    });
  }, [tasks, searchQuery, filterMode]);

  const activeCount = useMemo(() => tasks.filter(t => t.status !== 'completed').length, [tasks]);
  const completedCount = useMemo(() => tasks.filter(t => t.status === 'completed').length, [tasks]);
  const completionPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div 
      id="google-task-sync-panel"
      className={`bg-[#0d131f] border border-cyan-900/40 rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col space-y-5 ${className}`}
    >
      {/* Background Ambience Glow */}
      <div className="absolute top-0 right-1/4 w-80 h-24 bg-blue-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Google Tasks Action Engine
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                Tasks API v1
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Sync
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time actionable checklist synchronized via Firebase Authentication & Google Workspace
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {!user ? (
            <button
              id="google-task-sync-login-btn"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3.5 py-1.5 rounded-lg font-mono transition-all disabled:opacity-50"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{isSigningIn ? 'Authenticating...' : 'Sign in with Google'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="export-tasks-to-sheets-btn"
                onClick={handleExportTasksToSheet}
                disabled={isExportingToSheet || tasks.length === 0}
                className="flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors disabled:opacity-50"
                title="Export all actionable tasks to a new Google Sheet"
              >
                <FileSpreadsheet className={`w-3.5 h-3.5 ${isExportingToSheet ? 'animate-spin' : ''}`} />
                <span>{isExportingToSheet ? 'Exporting...' : 'Export to Sheet'}</span>
              </button>

              <button
                id="refresh-tasks-btn"
                onClick={() => fetchTasks()}
                disabled={isLoading}
                className="flex items-center gap-1.5 bg-[#111827] hover:bg-[#1f2937] text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                id="toggle-add-task-form-btn"
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-mono transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications Toast */}
      {notification && (
        <div className={`p-2.5 rounded-lg text-xs font-mono flex items-center justify-between gap-2 border ${
          notification.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
          {exportSheetUrl && (
            <a
              href={exportSheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] underline text-emerald-300 hover:text-white"
            >
              <span>Open Spreadsheet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Progress & Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Total Tasks</div>
          <div className="text-xl font-bold text-white mt-0.5">{tasks.length}</div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-blue-400 uppercase tracking-wider">Actionable / Open</div>
          <div className="text-xl font-bold text-blue-300 mt-0.5">{activeCount}</div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-emerald-400 uppercase tracking-wider">Completed</div>
          <div className="text-xl font-bold text-emerald-300 mt-0.5">{completedCount}</div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-lg p-3">
          <div className="text-[10px] text-cyan-400 uppercase tracking-wider">Completion Velocity</div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="text-xl font-bold text-cyan-300">{completionPercentage}%</div>
            <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add New Task Accordion / Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#111827] border border-blue-500/30 rounded-xl p-4 space-y-3 font-mono text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-blue-300 font-semibold flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Create Actionable Task on Google Tasks API</span>
              </span>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Task Title *</label>
                <input
                  id="task-title-input"
                  type="text"
                  placeholder="e.g., Audit Shannon Entropy bitwise sieve registers on Node-01"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#0a0e17] border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Details / Operational Notes</label>
                  <input
                    id="task-notes-input"
                    type="text"
                    placeholder="Payload threshold H(X) < 1.5, EMA debounce"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full bg-[#0a0e17] border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 text-xs font-sans"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Due Date</label>
                  <input
                    id="task-due-input"
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-[#0a0e17] border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding || !newTitle.trim()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isAdding ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Posting to Google Tasks...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Commit Task</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            id="task-search-input"
            type="text"
            placeholder="Filter actionable tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111827] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-[#111827] border border-slate-800 p-1 rounded-lg font-mono text-xs">
          <button
            id="filter-all-tasks-btn"
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
              filterMode === 'all'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            id="filter-active-tasks-btn"
            onClick={() => setFilterMode('active')}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
              filterMode === 'active'
                ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Actionable ({activeCount})
          </button>
          <button
            id="filter-completed-tasks-btn"
            onClick={() => setFilterMode('completed')}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
              filterMode === 'completed'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Done ({completedCount})
          </button>
        </div>
      </div>

      {/* Task List */}
      {!user ? (
        <div className="bg-[#111827]/70 border border-dashed border-slate-800 rounded-xl p-8 text-center font-mono space-y-3">
          <ListTodo className="w-8 h-8 text-slate-600 mx-auto" />
          <div className="text-sm text-slate-300">Authentication Required</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Connect your Google account to synchronize your real-time Google Tasks list with full checkbox completion states.
          </p>
          <button
            onClick={handleSignIn}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      ) : isLoading && tasks.length === 0 ? (
        <div className="p-10 text-center text-slate-400 font-mono text-xs">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-400" />
          Synchronizing tasks from Google Tasks API...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-[#111827]/50 border border-slate-800 rounded-xl p-8 text-center text-slate-500 font-mono text-xs">
          {searchQuery ? 'No tasks matched your filter query.' : 'No tasks in this view. Click "New Task" to create one.'}
        </div>
      ) : (
        <div 
          id="google-tasks-action-list"
          role="list"
          aria-label="Google Tasks Action Items"
          className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1"
        >
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isUpdating = updatingTaskIds.has(task.id);

            return (
              <div
                key={task.id}
                role="listitem"
                className={`p-3 sm:p-3.5 rounded-xl border transition-all duration-200 flex items-start justify-between gap-3 ${
                  isCompleted
                    ? 'bg-[#0a0e17]/60 border-slate-800/80 opacity-75'
                    : 'bg-[#111827] border-slate-800 hover:border-slate-700 hover:bg-[#131b2c]'
                }`}
              >
                {/* Left: Checkbox & Content */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    id={`task-toggle-${task.id}`}
                    type="button"
                    onClick={() => handleToggleTask(task)}
                    disabled={isUpdating}
                    aria-label={`Mark task "${task.title}" as ${isCompleted ? 'incomplete' : 'completed'}`}
                    className={`mt-0.5 p-0.5 rounded transition-all focus:outline-none ${
                      isCompleted
                        ? 'text-emerald-400 hover:text-emerald-300'
                        : 'text-slate-400 hover:text-blue-400'
                    }`}
                  >
                    {isUpdating ? (
                      <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                    ) : isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-medium tracking-tight break-words transition-colors ${
                          isCompleted
                            ? 'line-through text-slate-500'
                            : 'text-white'
                        }`}
                      >
                        {task.title}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          COMPLETED
                        </span>
                      )}
                    </div>

                    {task.notes && (
                      <p className={`text-xs mt-1 leading-relaxed font-sans ${isCompleted ? 'text-slate-600 line-through' : 'text-slate-400'}`}>
                        {task.notes}
                      </p>
                    )}

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-mono text-slate-500">
                      {task.due && (
                        <span className="flex items-center gap-1 text-cyan-400">
                          <Calendar className="w-3 h-3" />
                          <span>Due: {new Date(task.due).toLocaleDateString()}</span>
                        </span>
                      )}
                      {task.updated && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Updated: {new Date(task.updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      )}
                      <span className="text-slate-600">ID: {task.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                </div>

                {/* Right: Quick Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    id={`task-delete-${task.id}`}
                    onClick={() => handleDeleteTask(task.id, task.title)}
                    disabled={isUpdating}
                    title="Delete task from Google Tasks"
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span>Synchronized with Google Tasks & Workspace Cloud Services</span>
        </div>
        <div className="text-slate-500">
          Integrated with Google Sheets export engine
        </div>
      </div>
    </div>
  );
}
