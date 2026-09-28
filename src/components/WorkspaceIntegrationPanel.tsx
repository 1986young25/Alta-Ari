import { useState, useEffect } from 'react';
import { 
  FileText, 
  FolderGit2, 
  Search, 
  ExternalLink, 
  Plus, 
  RefreshCw, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  CheckCircle2, 
  FileCode, 
  BookOpen, 
  StickyNote, 
  UploadCloud, 
  Sparkles,
  AlertCircle,
  Database,
  Layers,
  Mail,
  Send,
  CheckSquare,
  ListTodo,
  Trash2,
  Server,
  Calendar,
  FileSpreadsheet,
  Table
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  db, 
  auth 
} from '../lib/firebase';
import { 
  listDriveFiles, 
  getDocContent, 
  createGoogleDoc, 
  openGooglePicker, 
  GoogleDriveFile, 
  GoogleDocContent,
  listGmailMessages,
  getGmailMessageDetails,
  sendGmailMessage,
  GmailMessage,
  listGoogleTasks,
  createGoogleTask,
  updateGoogleTaskStatus,
  deleteGoogleTask,
  GoogleTaskItem,
  listDriveSpreadsheets,
  getSpreadsheet,
  getSpreadsheetValues,
  appendSpreadsheetValues,
  createGoogleSpreadsheet,
  GoogleSpreadsheet,
  GoogleSheetTab
} from '../lib/workspace';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc 
} from 'firebase/firestore';

interface SyncedNote {
  id: string;
  title: string;
  snippet: string;
  source: 'DRIVE' | 'DOCS' | 'KEEP' | 'MANUAL' | 'GMAIL' | 'TASKS';
  externalId?: string;
  externalUrl?: string;
  createdAt: string;
}

export function WorkspaceIntegrationPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'GMAIL' | 'TASKS' | 'SHEETS' | 'DRIVE' | 'DOCS' | 'KEEP' | 'FIRESTORE' | 'CLOUDSQL'>('GMAIL');

  // Google Sheets state
  const [spreadsheets, setSpreadsheets] = useState<GoogleDriveFile[]>([]);
  const [isLoadingSpreadsheets, setIsLoadingSpreadsheets] = useState<boolean>(false);
  const [sheetsFilter, setSheetsFilter] = useState<string>('');
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<GoogleSpreadsheet | null>(null);
  const [selectedSheetTab, setSelectedSheetTab] = useState<string>('Sheet1');
  const [sheetValues, setSheetValues] = useState<string[][]>([]);
  const [isLoadingSheetValues, setIsLoadingSheetValues] = useState<boolean>(false);
  const [newSheetTitle, setNewSheetTitle] = useState<string>('');
  const [isCreatingSheet, setIsCreatingSheet] = useState<boolean>(false);
  const [newRowValues, setNewRowValues] = useState<string>('');
  const [isAppendingRow, setIsAppendingRow] = useState<boolean>(false);

  // Gmail state
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState<boolean>(false);
  const [selectedEmail, setSelectedEmail] = useState<GmailMessage | null>(null);
  const [emailQuery, setEmailQuery] = useState<string>('');
  const [composeTo, setComposeTo] = useState<string>('');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [showComposeModal, setShowComposeModal] = useState<boolean>(false);

  // Google Tasks state
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskNotes, setNewTaskNotes] = useState<string>('');
  const [isCreatingTask, setIsCreatingTask] = useState<boolean>(false);
  const [syncingTaskId, setSyncingTaskId] = useState<string | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState<boolean>(false);
  const [driveFilter, setDriveFilter] = useState<string>('');

  // Docs state
  const [selectedDocContent, setSelectedDocContent] = useState<GoogleDocContent | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(false);
  const [newDocTitle, setNewDocTitle] = useState<string>('');
  const [newDocInitialText, setNewDocInitialText] = useState<string>('');
  const [isCreatingDoc, setIsCreatingDoc] = useState<boolean>(false);

  // Firestore Synced Notes & Keep state
  const [syncedNotes, setSyncedNotes] = useState<SyncedNote[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState<string>('');
  const [newNoteSnippet, setNewNoteSnippet] = useState<string>('');
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);

  // Cloud SQL status & audit logs
  const [cloudSqlLogs, setCloudSqlLogs] = useState<any[]>([]);
  const [isLoadingCloudSql, setIsLoadingCloudSql] = useState<boolean>(false);
  const [isSyncingUserSql, setIsSyncingUserSql] = useState<boolean>(false);

  // Status & notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4500);
  };

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        loadFirestoreNotes(currentUser.uid);
        fetchGmail(token);
        fetchTasks(token);
        fetchDriveFiles(token);
        fetchSpreadsheets(token);
        syncUserToCloudSql(currentUser);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    fetchCloudSqlLogs();
    return () => unsubscribe();
  }, []);

  const syncUserToCloudSql = async (currentUser: User) => {
    try {
      const idToken = await currentUser.getIdToken();
      await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (e) {
      console.warn('Cloud SQL user sync warning:', e);
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
        fetchGmail(result.accessToken);
        fetchTasks(result.accessToken);
        fetchDriveFiles(result.accessToken);
        fetchSpreadsheets(result.accessToken);
        loadFirestoreNotes(result.user.uid);
        syncUserToCloudSql(result.user);
      }
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to authenticate with Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  // ==========================================================================
  // GOOGLE SHEETS METHODS
  // ==========================================================================
  const fetchSpreadsheets = async (token = accessToken) => {
    if (!token) return;
    setIsLoadingSpreadsheets(true);
    try {
      const files = await listDriveSpreadsheets(token);
      setSpreadsheets(files);
    } catch (err: any) {
      console.warn('Spreadsheets fetch error:', err);
    } finally {
      setIsLoadingSpreadsheets(false);
    }
  };

  const loadSheetValues = async (spreadsheetId: string, sheetTitle: string) => {
    if (!accessToken) return;
    setIsLoadingSheetValues(true);
    try {
      const result = await getSpreadsheetValues(accessToken, spreadsheetId, `${sheetTitle}!A1:Z60`);
      setSheetValues(result.values || []);
    } catch (err: any) {
      showNotification('error', `Failed to read sheet cells: ${err.message}`);
      setSheetValues([]);
    } finally {
      setIsLoadingSheetValues(false);
    }
  };

  const handleSelectSpreadsheet = async (sheetFile: GoogleDriveFile) => {
    if (!accessToken) return;
    setIsLoadingSheetValues(true);
    try {
      const meta = await getSpreadsheet(accessToken, sheetFile.id);
      setSelectedSpreadsheet(meta);
      const firstTab = meta.sheets?.[0]?.title || 'Sheet1';
      setSelectedSheetTab(firstTab);
      await loadSheetValues(sheetFile.id, firstTab);
      showNotification('success', `Opened spreadsheet "${meta.title}"`);
    } catch (err: any) {
      showNotification('error', `Failed to open spreadsheet: ${err.message}`);
    } finally {
      setIsLoadingSheetValues(false);
    }
  };

  const handleTabChange = async (tabTitle: string) => {
    if (!selectedSpreadsheet) return;
    setSelectedSheetTab(tabTitle);
    await loadSheetValues(selectedSpreadsheet.spreadsheetId, tabTitle);
  };

  const handleCreateNewSpreadsheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newSheetTitle.trim()) return;
    setIsCreatingSheet(true);
    try {
      const created = await createGoogleSpreadsheet(accessToken, newSheetTitle.trim(), {
        sheetTitle: 'Operational Log',
        rows: [
          ['Timestamp', 'Subsystem', 'Entropy H(X)', 'Telemetry Status', 'Auditor Verified'],
          [new Date().toISOString(), 'Node-07-Titan', '1.18', 'NOMINAL', 'YES'],
          [new Date().toISOString(), 'Node-01-Sigma', '1.24', 'RESONANT', 'YES'],
          [new Date().toISOString(), 'DYV Genesis Core', '0.94', 'VERIFIED_PATENT_CLAIM', 'YES'],
        ],
      });
      showNotification('success', `Created Google Sheet: "${created.title}"`);
      setNewSheetTitle('');
      await fetchSpreadsheets(accessToken);
      setSelectedSpreadsheet(created);
      setSelectedSheetTab('Operational Log');
      await loadSheetValues(created.spreadsheetId, 'Operational Log');
    } catch (err: any) {
      showNotification('error', `Failed to create spreadsheet: ${err.message}`);
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleAppendRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !selectedSpreadsheet || !newRowValues.trim()) return;
    setIsAppendingRow(true);
    try {
      const cells = newRowValues.split(',').map((s) => s.trim());
      await appendSpreadsheetValues(
        accessToken,
        selectedSpreadsheet.spreadsheetId,
        `${selectedSheetTab}!A1`,
        [cells]
      );
      showNotification('success', 'Appended row to Google Sheet!');
      setNewRowValues('');
      await loadSheetValues(selectedSpreadsheet.spreadsheetId, selectedSheetTab);
    } catch (err: any) {
      showNotification('error', `Failed to append row: ${err.message}`);
    } finally {
      setIsAppendingRow(false);
    }
  };

  const handleExportTasksToSpreadsheet = async () => {
    if (!accessToken) {
      showNotification('error', 'Sign in to export tasks to Google Sheets');
      return;
    }
    if (tasks.length === 0) {
      showNotification('error', 'No tasks available to export');
      return;
    }
    try {
      const title = `Aura Tasks Sync - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      const headers = ['Task ID', 'Status', 'Title', 'Notes', 'Due Date', 'Export Timestamp'];
      const rows = tasks.map((t) => [
        t.id,
        t.status === 'completed' ? 'COMPLETED' : 'ACTIONABLE',
        t.title,
        t.notes || '',
        t.due ? new Date(t.due).toLocaleDateString() : 'None',
        new Date().toISOString(),
      ]);

      const created = await createGoogleSpreadsheet(accessToken, title, {
        sheetTitle: 'Tasks',
        rows: [headers, ...rows],
      });
      showNotification('success', `Exported ${tasks.length} tasks to Google Sheet: "${created.title}"`);
      await fetchSpreadsheets(accessToken);
      setSelectedSpreadsheet(created);
      setSelectedSheetTab('Tasks');
      await loadSheetValues(created.spreadsheetId, 'Tasks');
    } catch (err: any) {
      showNotification('error', `Export error: ${err.message}`);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setEmails([]);
    setTasks([]);
    setDriveFiles([]);
    setSelectedDocContent(null);
    setSelectedEmail(null);
    setSyncedNotes([]);
    showNotification('success', 'Logged out successfully');
  };

  // ==========================================================================
  // GMAIL METHODS
  // ==========================================================================
  const fetchGmail = async (token = accessToken, query = emailQuery) => {
    if (!token) return;
    setIsLoadingEmails(true);
    try {
      const list = await listGmailMessages(token, 15, query);
      setEmails(list);
    } catch (err: any) {
      console.warn('Gmail fetch error:', err);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !composeTo.trim() || !composeSubject.trim()) return;

    setIsSendingEmail(true);
    try {
      await sendGmailMessage(accessToken, composeTo.trim(), composeSubject.trim(), composeBody.trim());
      showNotification('success', `Email sent successfully to ${composeTo}`);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      setShowComposeModal(false);
      fetchGmail(accessToken);
    } catch (err: any) {
      showNotification('error', `Failed to send email: ${err.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSaveEmailToFirestore = async (email: GmailMessage) => {
    if (!user) return;
    try {
      const emailDocId = 'email_' + email.id;
      await setDoc(doc(db, 'users', user.uid, 'emails', emailDocId), {
        id: emailDocId,
        userId: user.uid,
        threadId: email.threadId,
        subject: email.subject,
        from: email.from,
        to: email.to,
        snippet: email.snippet,
        date: email.date,
        syncedAt: new Date().toISOString()
      });

      // Also save as a workspace note
      const noteId = 'note_' + email.id;
      const newNote: SyncedNote = {
        id: noteId,
        title: `[Gmail] ${email.subject}`,
        snippet: `${email.from}: ${email.snippet}`,
        source: 'GMAIL',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', user.uid, 'notes', noteId), {
        ...newNote,
        userId: user.uid
      });

      setSyncedNotes([newNote, ...syncedNotes]);
      showNotification('success', 'Email archived to Firestore Database!');
    } catch (err: any) {
      showNotification('error', `Firestore save error: ${err.message}`);
    }
  };

  // ==========================================================================
  // GOOGLE TASKS METHODS
  // ==========================================================================
  const fetchTasks = async (token = accessToken) => {
    if (!token) return;
    setIsLoadingTasks(true);
    try {
      const items = await listGoogleTasks(token);
      setTasks(items);
    } catch (err: any) {
      console.warn('Tasks fetch error:', err);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newTaskTitle.trim()) return;

    setIsCreatingTask(true);
    try {
      const created = await createGoogleTask(accessToken, '@default', {
        title: newTaskTitle.trim(),
        notes: newTaskNotes.trim() || undefined,
      });
      setTasks([created, ...tasks]);
      setNewTaskTitle('');
      setNewTaskNotes('');
      showNotification('success', 'Task added to Google Tasks!');

      // Also sync to Cloud SQL PostgreSQL if user is logged in
      if (user) {
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
          }),
        });
      }
    } catch (err: any) {
      showNotification('error', `Failed to create task: ${err.message}`);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleToggleTask = async (task: GoogleTaskItem) => {
    if (!accessToken) return;
    const newStatus = task.status === 'completed' ? false : true;
    try {
      const updated = await updateGoogleTaskStatus(accessToken, '@default', task.id, newStatus);
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
      showNotification('success', `Task marked as ${newStatus ? 'completed' : 'active'}`);

      // Update in Cloud SQL
      if (user) {
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
          }),
        });
      }
    } catch (err: any) {
      showNotification('error', `Failed to update task: ${err.message}`);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!accessToken) return;
    try {
      await deleteGoogleTask(accessToken, '@default', taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
      showNotification('success', 'Task removed from Google Tasks');
    } catch (err: any) {
      showNotification('error', `Failed to delete task: ${err.message}`);
    }
  };

  const handleSyncTaskToCloudSql = async (task: GoogleTaskItem) => {
    if (!user) return;
    setSyncingTaskId(task.id);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/cloudsql/tasks/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: task.id,
          title: task.title,
          notes: task.notes || '',
          status: task.status,
          due: task.due,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      showNotification('success', 'Task persisted to Cloud SQL PostgreSQL database!');
    } catch (err: any) {
      showNotification('error', `Cloud SQL sync error: ${err.message}`);
    } finally {
      setSyncingTaskId(null);
    }
  };

  // ==========================================================================
  // CLOUD SQL METHODS
  // ==========================================================================
  const fetchCloudSqlLogs = async () => {
    setIsLoadingCloudSql(true);
    try {
      const res = await fetch('/api/cloudsql/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setCloudSqlLogs(data.logs || []);
      }
    } catch (e) {
      console.warn('Could not fetch Cloud SQL logs:', e);
    } finally {
      setIsLoadingCloudSql(false);
    }
  };

  const handleManualSyncUserSql = async () => {
    if (!user) return;
    setIsSyncingUserSql(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error(await res.text());
      showNotification('success', 'User profile successfully synchronized to Cloud SQL users table!');
    } catch (err: any) {
      showNotification('error', `Cloud SQL sync failed: ${err.message}`);
    } finally {
      setIsSyncingUserSql(false);
    }
  };

  const handleRecordAuditLogSql = async () => {
    try {
      const res = await fetch('/api/cloudsql/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: 'Node-01-Sigma (Pixel 9a ARM64)',
          event: 'SHANNON_ENTROPY_PASS_CONFIRMED',
          entropy: '1.7482',
          stateRoot: '0x' + Math.random().toString(16).slice(2, 10),
          uccSeal: 'UCC-CER-NYMT-XB6-CONFIRMED',
        }),
      });
      if (res.ok) {
        showNotification('success', 'Cryptographic audit log committed to Cloud SQL!');
        fetchCloudSqlLogs();
      }
    } catch (err: any) {
      showNotification('error', `Failed to record audit log: ${err.message}`);
    }
  };

  // ==========================================================================
  // DRIVE & DOCS METHODS
  // ==========================================================================
  const fetchDriveFiles = async (token = accessToken) => {
    if (!token) return;
    setIsLoadingDrive(true);
    try {
      const files = await listDriveFiles(token);
      setDriveFiles(files);
    } catch (err: any) {
      console.warn('Drive fetch error:', err);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleViewDoc = async (docId: string, title: string) => {
    if (!accessToken) return;
    setIsLoadingDoc(true);
    setActiveTab('DOCS');
    try {
      const docData = await getDocContent(accessToken, docId);
      setSelectedDocContent(docData);
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to read document');
    } finally {
      setIsLoadingDoc(false);
    }
  };

  const handleOpenPicker = () => {
    if (!accessToken) {
      showNotification('error', 'Please authenticate with Google first');
      return;
    }
    openGooglePicker({
      accessToken,
      onPick: (picked) => {
        if (picked.id) {
          handleViewDoc(picked.id, picked.name);
        }
      },
    });
  };

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newDocTitle.trim()) return;

    setIsCreatingDoc(true);
    try {
      const created = await createGoogleDoc(accessToken, newDocTitle.trim(), newDocInitialText.trim());
      showNotification('success', `Created Google Doc "${created.title}"!`);
      setNewDocTitle('');
      setNewDocInitialText('');
      fetchDriveFiles();
      handleViewDoc(created.documentId, created.title);
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to create document');
    } finally {
      setIsCreatingDoc(false);
    }
  };

  // Firestore Sync - Load Notes
  const loadFirestoreNotes = async (userId: string) => {
    try {
      const q = query(collection(db, 'users', userId, 'notes'));
      const snapshot = await getDocs(q);
      const notes: SyncedNote[] = [];
      snapshot.forEach((d) => {
        notes.push(d.data() as SyncedNote);
      });
      setSyncedNotes(notes);
    } catch (err) {
      console.warn('Firestore load error:', err);
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newNoteTitle.trim()) return;

    setIsSavingNote(true);
    try {
      const noteId = 'note_' + Date.now();
      const newNote: SyncedNote = {
        id: noteId,
        title: newNoteTitle.trim(),
        snippet: newNoteSnippet.trim(),
        source: 'KEEP',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid, 'notes', noteId), {
        ...newNote,
        userId: user.uid,
      });

      setSyncedNotes([newNote, ...syncedNotes]);
      setNewNoteTitle('');
      setNewNoteSnippet('');
      showNotification('success', 'Note securely persisted to Firestore Database!');
    } catch (err: any) {
      showNotification('error', `Firestore sync error: ${err.message}`);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'notes', noteId));
      setSyncedNotes(syncedNotes.filter((n) => n.id !== noteId));
      showNotification('success', 'Note removed from Firestore');
    } catch (err: any) {
      showNotification('error', `Delete error: ${err.message}`);
    }
  };

  const filteredDriveFiles = driveFiles.filter((f) =>
    f.name.toLowerCase().includes(driveFilter.toLowerCase())
  );

  return (
    <div id="workspace-firebase-hub" className="bg-[#111827] border border-[#1f2937] rounded-xl p-6 relative overflow-hidden flex flex-col space-y-6">
      {/* Decorative accent */}
      <div className="absolute top-0 right-10 w-96 h-32 bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Header with Google Auth State and Dual-Database Status Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">Workspace, Firebase & Cloud SQL Hub</h2>
                <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Database className="w-3 h-3" /> FIRESTORE CONNECTED
                </span>
                <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                  <Server className="w-3 h-3" /> CLOUD SQL (POSTGRESQL)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Native Gmail, Google Tasks, Drive, Docs, Cloud Firestore, and Cloud SQL PostgreSQL instance
              </p>
            </div>
          </div>
        </div>

        {/* Auth Action */}
        <div>
          {!user ? (
            <button
              id="google-signin-btn"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="flex items-center gap-2.5 bg-white hover:bg-slate-100 text-slate-900 font-medium px-4 py-2 rounded-lg text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-[#0a0e17] border border-[#1f2937] p-1.5 px-3 rounded-lg">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full border border-blue-500/30" />
              ) : (
                <UserIcon className="w-5 h-5 text-slate-400" />
              )}
              <div className="text-left font-mono">
                <div className="text-xs text-white font-medium truncate max-w-[140px]">{user.displayName || user.email}</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> OAuth Active
                </div>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notifications Toast */}
      {notification && (
        <div className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 border ${
          notification.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Workspace Service Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1f2937] pb-3">
        {/* 1. Gmail Tab */}
        <button
          onClick={() => setActiveTab('GMAIL')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'GMAIL'
              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/40 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-[#1f2937]'
          }`}
        >
          <Mail className="w-4 h-4 text-rose-400" />
          <span>Gmail</span>
          <span className="text-[10px] bg-[#0a0e17] px-1.5 py-0.2 rounded border border-[#1f2937] text-slate-500">
            {emails.length}
          </span>
        </button>

        {/* 2. Google Tasks Tab */}
        <button
          onClick={() => setActiveTab('TASKS')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'TASKS'
              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/40 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-[#1f2937]'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-blue-400" />
          <span>Google Tasks</span>
          <span className="text-[10px] bg-[#0a0e17] px-1.5 py-0.2 rounded border border-[#1f2937] text-slate-500">
            {tasks.length}
          </span>
        </button>

        {/* 2.5. Google Sheets Tab */}
        <button
          id="tab-sheets-btn"
          onClick={() => setActiveTab('SHEETS')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'SHEETS'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-[#1f2937]'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Google Sheets</span>
          <span className="text-[10px] bg-[#0a0e17] px-1.5 py-0.2 rounded border border-[#1f2937] text-slate-500">
            {spreadsheets.length}
          </span>
        </button>

        {/* 3. Google Drive Tab */}
        <button
          onClick={() => setActiveTab('DRIVE')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'DRIVE'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-[#1f2937]'
          }`}
        >
          <FolderGit2 className="w-4 h-4 text-amber-400" />
          <span>Google Drive</span>
          <span className="text-[10px] bg-[#0a0e17] px-1.5 py-0.2 rounded border border-[#1f2937] text-slate-500">
            {driveFiles.length}
          </span>
        </button>

        {/* 4. Google Docs Tab */}
        <button
          onClick={() => setActiveTab('DOCS')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'DOCS'
              ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-[#1f2937]'
          }`}
        >
          <FileText className="w-4 h-4 text-sky-400" />
          <span>Google Docs</span>
        </button>

        {/* 5. Keep Notes Tab */}
        <button
          onClick={() => setActiveTab('KEEP')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'KEEP'
              ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/40 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-[#1f2937]'
          }`}
        >
          <StickyNote className="w-4 h-4 text-yellow-400" />
          <span>Keep Notes</span>
        </button>

        {/* 6. Firestore Storage Tab */}
        <button
          onClick={() => setActiveTab('FIRESTORE')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'FIRESTORE'
              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/40 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-[#1f2937]'
          }`}
        >
          <Database className="w-4 h-4 text-purple-400" />
          <span>Firestore Storage</span>
          <span className="text-[10px] bg-[#0a0e17] px-1.5 py-0.2 rounded border border-[#1f2937] text-slate-500">
            {syncedNotes.length}
          </span>
        </button>

        {/* 7. Cloud SQL Tab */}
        <button
          onClick={() => setActiveTab('CLOUDSQL')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
            activeTab === 'CLOUDSQL'
              ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/40 font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-[#1f2937]'
          }`}
        >
          <Server className="w-4 h-4 text-indigo-400" />
          <span>Cloud SQL (PostgreSQL)</span>
        </button>

        {/* Google Picker Action Button */}
        <div className="ml-auto">
          <button
            id="launch-google-picker-btn"
            onClick={handleOpenPicker}
            disabled={!user}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-40"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Launch Google Picker</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: GMAIL INTEGRATION */}
      {/* ==================================================================== */}
      {activeTab === 'GMAIL' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search messages in Gmail..."
                value={emailQuery}
                onChange={(e) => setEmailQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchGmail(accessToken, emailQuery);
                }}
                className="w-full bg-[#0a0e17] border border-[#1f2937] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchGmail(accessToken, emailQuery)}
                disabled={isLoadingEmails || !user}
                className="flex items-center gap-1.5 bg-[#0a0e17] hover:bg-[#1f2937] border border-[#1f2937] px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 transition-colors disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEmails ? 'animate-spin' : ''}`} />
                <span>Refresh Inbox</span>
              </button>
              <button
                onClick={() => setShowComposeModal(!showComposeModal)}
                disabled={!user}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-mono transition-colors disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Compose Email</span>
              </button>
            </div>
          </div>

          {/* Compose Email Drawer */}
          {showComposeModal && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#0b0f19] border border-rose-500/30 rounded-xl p-4 space-y-3 font-mono text-xs"
            >
              <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
                <div className="flex items-center gap-2 text-rose-300 font-semibold">
                  <Mail className="w-4 h-4" />
                  <span>Compose & Send New Email via Gmail API</span>
                </div>
                <button
                  onClick={() => setShowComposeModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSendEmail} className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1">To (Recipient Address)</label>
                  <input
                    type="email"
                    placeholder="recipient@example.com"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    className="w-full bg-[#111827] border border-[#1f2937] rounded-lg p-2 text-white focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="Titan Security / Workspace Update"
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="w-full bg-[#111827] border border-[#1f2937] rounded-lg p-2 text-white focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Message Body</label>
                  <textarea
                    rows={4}
                    placeholder="Write your email message here..."
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    className="w-full bg-[#111827] border border-[#1f2937] rounded-lg p-2 text-white focus:outline-none focus:border-rose-500 font-sans"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowComposeModal(false)}
                    className="px-3 py-1.5 bg-[#1f2937] text-slate-300 rounded-lg text-xs hover:bg-[#374151]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingEmail || !composeTo.trim() || !composeSubject.trim()}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSendingEmail ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Now</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {!user ? (
            <div className="bg-[#0b0f19] border border-dashed border-[#1f2937] rounded-xl p-8 text-center font-mono space-y-3">
              <Mail className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-300">Sign in with Google to read and send messages directly through Gmail</p>
              <button
                onClick={handleSignIn}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs transition-colors"
              >
                Sign in with Google
              </button>
            </div>
          ) : isLoadingEmails ? (
            <div className="p-8 text-center text-slate-400 font-mono text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-rose-400" />
              Fetching Gmail messages...
            </div>
          ) : emails.length === 0 ? (
            <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-6 text-center text-slate-500 font-mono text-xs">
              No recent emails found in your inbox.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Email List */}
              <div className="lg:col-span-6 space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {emails.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedEmail(msg)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedEmail?.id === msg.id
                        ? 'bg-rose-950/20 border-rose-500/50'
                        : 'bg-[#0b0f19] border-[#1f2937] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-semibold text-white truncate max-w-[280px]">
                        {msg.subject || '(No Subject)'}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {msg.date ? new Date(msg.date).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div className="text-[11px] text-rose-400/90 font-mono truncate mt-0.5">
                      From: {msg.from}
                    </div>
                    <p className="text-xs text-slate-400 font-sans line-clamp-2 mt-1 leading-relaxed">
                      {msg.snippet}
                    </p>
                  </div>
                ))}
              </div>

              {/* Email Detail Preview */}
              <div className="lg:col-span-6 bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 flex flex-col justify-between space-y-3 font-mono">
                {selectedEmail ? (
                  <div className="space-y-3">
                    <div className="border-b border-[#1f2937] pb-2">
                      <h3 className="text-sm font-bold text-white font-sans">{selectedEmail.subject}</h3>
                      <div className="text-xs text-rose-400 mt-1">From: {selectedEmail.from}</div>
                      {selectedEmail.to && <div className="text-[11px] text-slate-400">To: {selectedEmail.to}</div>}
                      <div className="text-[10px] text-slate-500">{selectedEmail.date}</div>
                    </div>
                    <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-3 text-xs text-slate-300 font-sans whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
                      {selectedEmail.bodyText || selectedEmail.snippet}
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-[#1f2937]">
                      <button
                        onClick={() => handleSaveEmailToFirestore(selectedEmail)}
                        className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Database className="w-3.5 h-3.5" />
                        <span>Archive to Firestore</span>
                      </button>
                      <a
                        href={`https://mail.google.com/mail/u/0/#inbox/${selectedEmail.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-[#1f2937] hover:bg-[#374151] text-slate-300 rounded-lg text-xs flex items-center gap-1.5 transition-colors ml-auto"
                      >
                        <span>Open in Gmail</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-500 text-xs">
                    Select an email on the left to inspect full content, headers, or archive to persistent storage.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: GOOGLE TASKS INTEGRATION */}
      {/* ==================================================================== */}
      {activeTab === 'TASKS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Create Task Form */}
          <div className="lg:col-span-5 bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Create Google Task</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Tasks API
              </span>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g., Audit Modulo-9 Sieve Bus registers"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  disabled={!user || isCreatingTask}
                  className="w-full bg-[#111827] border border-[#1f2937] rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Task Notes / Details</label>
                <textarea
                  rows={3}
                  placeholder="Additional parameters or instructions..."
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  disabled={!user || isCreatingTask}
                  className="w-full bg-[#111827] border border-[#1f2937] rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={!user || isCreatingTask || !newTaskTitle.trim()}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-sans font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2 text-xs"
              >
                {isCreatingTask ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing with Google Tasks...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Google Tasks</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Task List */}
          <div className="lg:col-span-7 bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Active Google Tasks</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500">{tasks.length} items</span>
                <button
                  onClick={() => fetchTasks(accessToken)}
                  disabled={isLoadingTasks || !user}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Refresh Tasks"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTasks ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {!user ? (
              <div className="py-12 text-center text-slate-500 font-mono text-xs space-y-2">
                <p>Sign in with Google to view and manage your Google Tasks.</p>
                <button
                  onClick={handleSignIn}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs"
                >
                  Sign in
                </button>
              </div>
            ) : isLoadingTasks ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
                Loading tasks from Google Tasks API...
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-mono text-xs">
                No tasks found in your primary list. Add one on the left.
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                      task.status === 'completed'
                        ? 'bg-[#0a0e17]/50 border-[#1f2937] opacity-60'
                        : 'bg-[#111827] border-[#1f2937]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => handleToggleTask(task)}
                        className="mt-1 h-4 w-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div
                          className={`text-xs font-medium ${
                            task.status === 'completed' ? 'line-through text-slate-500' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </div>
                        {task.notes && (
                          <p className="text-[11px] text-slate-400 font-sans mt-0.5">{task.notes}</p>
                        )}
                        {task.due && (
                          <div className="text-[10px] text-blue-400 font-mono flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" /> Due: {new Date(task.due).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleSyncTaskToCloudSql(task)}
                        disabled={syncingTaskId === task.id}
                        title="Sync to Cloud SQL PostgreSQL"
                        className="p-1.5 text-slate-400 hover:text-indigo-300 transition-colors"
                      >
                        <Server className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        title="Delete Task"
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2.5: GOOGLE SHEETS */}
      {/* ==================================================================== */}
      {activeTab === 'SHEETS' && (
        <div className="space-y-4 font-mono text-xs">
          {/* Top Actions & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0a0e17] p-3 rounded-lg border border-[#1f2937]">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                id="sheets-search-input"
                type="text"
                placeholder="Search spreadsheets..."
                value={sheetsFilter}
                onChange={(e) => setSheetsFilter(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-white focus:outline-none placeholder-slate-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="refresh-sheets-list-btn"
                onClick={() => fetchSpreadsheets()}
                disabled={isLoadingSpreadsheets}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1f2937] text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSpreadsheets ? 'animate-spin text-emerald-400' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                id="export-tasks-to-sheet-action-btn"
                onClick={handleExportTasksToSpreadsheet}
                disabled={tasks.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-500/30 transition-colors disabled:opacity-50"
                title="Export current Google Tasks to a new Google Spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Tasks to Sheet</span>
              </button>
            </div>
          </div>

          {/* Main Grid: Spreadsheets List + Interactive Sheet Viewer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Create Form + Spreadsheet List (4 columns) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Create New Spreadsheet Card */}
              <div className="bg-[#0a0e17] border border-emerald-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                  <Plus className="w-4 h-4" />
                  <span>Create Spreadsheet</span>
                </div>
                <form onSubmit={handleCreateNewSpreadsheet} className="space-y-2.5">
                  <input
                    id="new-sheet-title-input"
                    type="text"
                    placeholder="Spreadsheet Title (e.g., Telemetry Log)"
                    value={newSheetTitle}
                    onChange={(e) => setNewSheetTitle(e.target.value)}
                    className="w-full bg-[#111827] border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <button
                    id="create-new-sheet-submit-btn"
                    type="submit"
                    disabled={isCreatingSheet || !newSheetTitle.trim()}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
                  >
                    {isCreatingSheet ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Creating on Google Sheets...</span>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Create in Google Sheets</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Spreadsheets List */}
              <div className="bg-[#0a0e17] border border-[#1f2937] rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between px-1 pb-1 border-b border-[#1f2937] text-slate-400">
                  <span className="font-semibold flex items-center gap-1.5 text-slate-300">
                    <Table className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Drive Spreadsheets</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {spreadsheets.length} found
                  </span>
                </div>

                {isLoadingSpreadsheets ? (
                  <div className="py-8 text-center text-slate-500">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-emerald-400" />
                    Loading spreadsheets...
                  </div>
                ) : spreadsheets.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-[11px]">
                    No spreadsheets found in Drive. Create one above.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                    {spreadsheets
                      .filter((s) => s.name.toLowerCase().includes(sheetsFilter.toLowerCase()))
                      .map((sheet) => {
                        const isSelected = selectedSpreadsheet?.spreadsheetId === sheet.id;
                        return (
                          <div
                            key={sheet.id}
                            onClick={() => handleSelectSpreadsheet(sheet)}
                            className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-emerald-950/40 border-emerald-500/50 text-white shadow-sm'
                                : 'bg-[#111827] border-[#1f2937] text-slate-300 hover:border-slate-700 hover:bg-[#131b2c]'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileSpreadsheet className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                              <div className="truncate">
                                <div className="truncate font-medium text-[11px]">{sheet.name}</div>
                                <div className="text-[9px] text-slate-500">
                                  {sheet.modifiedTime ? new Date(sheet.modifiedTime).toLocaleDateString() : ''}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {sheet.webViewLink && (
                                <a
                                  href={sheet.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  title="Open in Google Sheets"
                                  className="p-1 text-slate-500 hover:text-emerald-400 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Spreadsheet Cell Grid Viewer & Row Appender (8 columns) */}
            <div className="lg:col-span-8">
              {selectedSpreadsheet ? (
                <div className="bg-[#0a0e17] border border-[#1f2937] rounded-xl p-4 space-y-4">
                  {/* Spreadsheet Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1f2937] pb-3">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h3 className="text-sm font-bold text-white tracking-tight">{selectedSpreadsheet.title}</h3>
                        <span className="text-[10px] text-slate-500">ID: {selectedSpreadsheet.spreadsheetId}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedSpreadsheet.spreadsheetUrl && (
                        <a
                          href={selectedSpreadsheet.spreadsheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 bg-[#111827] hover:bg-[#1f2937] text-emerald-300 border border-emerald-500/30 rounded text-[11px] transition-colors"
                        >
                          <span>Open in Sheets</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <button
                        onClick={() => loadSheetValues(selectedSpreadsheet.spreadsheetId, selectedSheetTab)}
                        disabled={isLoadingSheetValues}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Reload Grid"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSheetValues ? 'animate-spin text-emerald-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Tab Selector Buttons */}
                  {selectedSpreadsheet.sheets && selectedSpreadsheet.sheets.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 border-b border-[#1f2937] pb-2">
                      <span className="text-[10px] text-slate-500 uppercase mr-1">Tabs:</span>
                      {selectedSpreadsheet.sheets.map((tab) => (
                        <button
                          key={tab.sheetId}
                          onClick={() => handleTabChange(tab.title)}
                          className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                            selectedSheetTab === tab.title
                              ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                              : 'bg-[#111827] text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {tab.title}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Append Row Bar */}
                  <form onSubmit={handleAppendRow} className="flex items-center gap-2 bg-[#111827] p-2 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 shrink-0">Append Row:</span>
                    <input
                      id="append-row-input"
                      type="text"
                      placeholder="e.g., Value 1, Value 2, Value 3 (comma-separated)"
                      value={newRowValues}
                      onChange={(e) => setNewRowValues(e.target.value)}
                      className="flex-1 bg-[#0a0e17] border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      id="append-row-submit-btn"
                      type="submit"
                      disabled={isAppendingRow || !newRowValues.trim()}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1 disabled:opacity-50 transition-colors shrink-0"
                    >
                      {isAppendingRow ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Plus className="w-3 h-3" />
                      )}
                      <span>Append</span>
                    </button>
                  </form>

                  {/* Spreadsheet Grid Table */}
                  <div className="border border-[#1f2937] rounded-lg overflow-hidden bg-[#080d18]">
                    {isLoadingSheetValues ? (
                      <div className="py-16 text-center text-slate-500">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                        Fetching cell ranges from Google Sheets API...
                      </div>
                    ) : sheetValues.length === 0 ? (
                      <div className="py-16 text-center text-slate-500 text-xs">
                        This sheet tab is currently empty. Use the &quot;Append Row&quot; input above to add data.
                      </div>
                    ) : (
                      <div className="max-h-[360px] overflow-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#111827] text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800">
                              <th className="p-2 border-r border-slate-800 w-10 text-center text-slate-600 font-mono">#</th>
                              {sheetValues[0]?.map((_, colIdx) => (
                                <th key={colIdx} className="p-2 border-r border-slate-800 font-mono">
                                  {String.fromCharCode(65 + (colIdx % 26))}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                            {sheetValues.map((row, rowIdx) => (
                              <tr
                                key={rowIdx}
                                className={rowIdx === 0 ? 'bg-[#0f172a] font-semibold text-emerald-300' : 'hover:bg-[#111827]/70 text-slate-300'}
                              >
                                <td className="p-2 border-r border-slate-800 text-center text-slate-600 text-[10px]">
                                  {rowIdx + 1}
                                </td>
                                {row.map((cell, cellIdx) => (
                                  <td
                                    key={cellIdx}
                                    className="p-2 border-r border-slate-800/80 truncate max-w-[180px]"
                                    title={String(cell)}
                                  >
                                    {String(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#0a0e17] border border-dashed border-[#1f2937] rounded-xl p-12 text-center text-slate-500 space-y-3">
                  <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-600" />
                  <div className="text-sm font-semibold text-slate-300">Google Sheets Grid Inspector</div>
                  <p className="text-xs max-w-sm mx-auto text-slate-500 leading-relaxed">
                    Select a spreadsheet from the left list or create a new sheet to view, inspect cells, and append rows directly via Google Workspace.
                  </p>
                  <button
                    onClick={handleExportTasksToSpreadsheet}
                    disabled={tasks.length === 0}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export Tasks to New Google Sheet</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: GOOGLE DRIVE */}
      {/* ==================================================================== */}
      {activeTab === 'DRIVE' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Drive files..."
                value={driveFilter}
                onChange={(e) => setDriveFilter(e.target.value)}
                className="w-full bg-[#0a0e17] border border-[#1f2937] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchDriveFiles()}
                disabled={isLoadingDrive || !user}
                className="flex items-center gap-1.5 bg-[#0a0e17] hover:bg-[#1f2937] border border-[#1f2937] px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 transition-colors disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                <span>Refresh Drive</span>
              </button>
            </div>
          </div>

          {!user ? (
            <div className="bg-[#0b0f19] border border-dashed border-[#1f2937] rounded-xl p-8 text-center font-mono space-y-3">
              <FolderGit2 className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-300">Sign in with Google to browse and sync Google Drive files</p>
              <button
                onClick={handleSignIn}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs transition-colors"
              >
                Sign in with Google
              </button>
            </div>
          ) : isLoadingDrive ? (
            <div className="p-8 text-center text-slate-400 font-mono text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
              Loading Google Drive files...
            </div>
          ) : filteredDriveFiles.length === 0 ? (
            <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-6 text-center text-slate-500 font-mono text-xs">
              No files found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredDriveFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-[#0b0f19] border border-[#1f2937] hover:border-slate-700 rounded-lg p-3 flex flex-col justify-between space-y-2 transition-all group"
                >
                  <div className="flex items-start gap-2.5">
                    {file.iconLink ? (
                      <img src={file.iconLink} alt="" className="w-4 h-4 mt-0.5 shrink-0" />
                    ) : (
                      <FileCode className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    )}
                    <div className="overflow-hidden">
                      <div className="text-xs text-white font-medium truncate group-hover:text-blue-300 transition-colors">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate font-mono">
                        {file.mimeType.replace('application/vnd.google-apps.', '')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1f2937]/60 font-mono text-[11px]">
                    {file.mimeType === 'application/vnd.google-apps.document' ? (
                      <button
                        onClick={() => handleViewDoc(file.id, file.name)}
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" /> View Doc
                      </button>
                    ) : (
                      <span className="text-slate-600 text-[10px]">Cloud File</span>
                    )}

                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: GOOGLE DOCS */}
      {/* ==================================================================== */}
      {activeTab === 'DOCS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1f2937] pb-3">
              <Plus className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-semibold text-white">Create New Google Doc</h3>
            </div>

            <form onSubmit={handleCreateDoc} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g., Sovereign Node Specification"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  disabled={!user || isCreatingDoc}
                  className="w-full bg-[#111827] border border-[#1f2937] rounded-lg p-2 text-white focus:outline-none focus:border-sky-500 disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Initial Content</label>
                <textarea
                  rows={4}
                  placeholder="Insert notes or telemetry synopsis into the document..."
                  value={newDocInitialText}
                  onChange={(e) => setNewDocInitialText(e.target.value)}
                  disabled={!user || isCreatingDoc}
                  className="w-full bg-[#111827] border border-[#1f2937] rounded-lg p-2 text-white focus:outline-none focus:border-sky-500 disabled:opacity-50 font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={!user || isCreatingDoc || !newDocTitle.trim()}
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-sans font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isCreatingDoc ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating in Google Docs...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>Create in Google Drive</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-white">Google Doc Preview</h3>
              </div>
              {selectedDocContent && (
                <a
                  href={`https://docs.google.com/document/d/${selectedDocContent.documentId}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 text-xs font-mono flex items-center gap-1"
                >
                  <span>Open in Google Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {isLoadingDoc ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-400" />
                Retrieving document structure via Google Docs API...
              </div>
            ) : selectedDocContent ? (
              <div className="space-y-3">
                <div className="text-white font-bold text-base border-b border-[#1f2937] pb-1">
                  {selectedDocContent.title}
                </div>
                <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-3 text-xs text-slate-300 whitespace-pre-wrap max-h-64 overflow-y-auto font-sans leading-relaxed">
                  {selectedDocContent.bodyText || <span className="text-slate-600 italic">Empty document content</span>}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 font-mono text-xs">
                Select a Google Doc from your Drive list or use Google Picker to view its content here.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: KEEP NOTES */}
      {/* ==================================================================== */}
      {activeTab === 'KEEP' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1f2937] pb-3">
              <StickyNote className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-semibold text-white">Create Keep / Rapid Note</h3>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Note Title</label>
                <input
                  type="text"
                  placeholder="e.g., Swarm Convergence Observations"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  disabled={!user || isSavingNote}
                  className="w-full bg-[#111827] border border-[#1f2937] rounded-lg p-2 text-white focus:outline-none focus:border-yellow-500 disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Note Content</label>
                <textarea
                  rows={4}
                  placeholder="Record rapid findings, telemetry notes, or checklist items..."
                  value={newNoteSnippet}
                  onChange={(e) => setNewNoteSnippet(e.target.value)}
                  disabled={!user || isSavingNote}
                  className="w-full bg-[#111827] border border-[#1f2937] rounded-lg p-2 text-white focus:outline-none focus:border-yellow-500 disabled:opacity-50 font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={!user || isSavingNote || !newNoteTitle.trim()}
                className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-sans font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isSavingNote ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing with Cloud...</span>
                  </>
                ) : (
                  <>
                    <StickyNote className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-semibold text-white">Keep Notes & Logs</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">{syncedNotes.length} Notes Saved</span>
            </div>

            {syncedNotes.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-mono text-xs">
                No notes logged yet. Create one on the left to sync it with your authenticated account.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {syncedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-[#111827] border border-[#1f2937] rounded-lg p-3 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-yellow-300">{note.title}</h4>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-slate-500 hover:text-rose-400 text-[10px] font-mono"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">{note.snippet}</p>
                    <div className="text-[10px] font-mono text-slate-500 pt-1">
                      {new Date(note.createdAt).toLocaleDateString()} &middot; Source: {note.source}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: FIRESTORE DATABASE STORAGE */}
      {/* ==================================================================== */}
      {activeTab === 'FIRESTORE' && (
        <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white font-sans">Firebase Firestore Blueprint & Rules</h3>
            </div>
            <span className="text-emerald-400 font-semibold">Active & Rules Deployed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#111827] border border-[#1f2937] p-3 rounded-lg">
              <span className="text-slate-500 block mb-1">Database Mode</span>
              <span className="text-white font-bold">Cloud Firestore</span>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] p-3 rounded-lg">
              <span className="text-slate-500 block mb-1">Region</span>
              <span className="text-cyan-400 font-bold">us-west1</span>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] p-3 rounded-lg">
              <span className="text-slate-500 block mb-1">Project ID</span>
              <span className="text-purple-400 font-bold truncate block">gen-lang-client-0302384334</span>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1f2937] p-3 rounded-lg space-y-2">
            <div className="text-slate-400 font-semibold">Configured Firestore Collections:</div>
            <ul className="list-disc pl-5 text-slate-300 space-y-1">
              <li><code className="text-blue-400">/users/{'{userId}'}</code>: Authenticated user profiles & workspace links</li>
              <li><code className="text-yellow-400">/users/{'{userId}'}/notes/{'{noteId}'}</code>: Synced workspace documents and Keep logs</li>
              <li><code className="text-rose-400">/users/{'{userId}'}/emails/{'{emailId}'}</code>: Cached Gmail records</li>
              <li><code className="text-emerald-400">/users/{'{userId}'}/tasks/{'{taskId}'}</code>: Google Tasks records</li>
            </ul>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 7: CLOUD SQL (POSTGRESQL) */}
      {/* ==================================================================== */}
      {activeTab === 'CLOUDSQL' && (
        <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-5 space-y-5 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f2937] pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <div>
                <h3 className="text-sm font-semibold text-white font-sans">Cloud SQL PostgreSQL Instance</h3>
                <span className="text-[11px] text-slate-400 font-mono">Drizzle ORM & pg Connection Pool Integrated</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualSyncUserSql}
                disabled={isSyncingUserSql || !user}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs transition-colors disabled:opacity-40 flex items-center gap-1.5"
              >
                {isSyncingUserSql ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserIcon className="w-3.5 h-3.5" />}
                <span>Sync Current User</span>
              </button>
              <button
                onClick={handleRecordAuditLogSql}
                className="px-3 py-1.5 bg-[#1f2937] hover:bg-[#374151] text-indigo-300 rounded text-xs transition-colors flex items-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Write Audit Record</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-[#111827] border border-[#1f2937] p-3 rounded-lg">
              <span className="text-slate-500 block mb-1">Instance Name</span>
              <span className="text-indigo-400 font-bold font-mono">ai-studio-c01e7c9d</span>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] p-3 rounded-lg">
              <span className="text-slate-500 block mb-1">Database Engine</span>
              <span className="text-white font-bold">PostgreSQL 15</span>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] p-3 rounded-lg">
              <span className="text-slate-500 block mb-1">Target Region</span>
              <span className="text-cyan-400 font-bold">us-west1</span>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] p-3 rounded-lg">
              <span className="text-slate-500 block mb-1">Connection State</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> ONLINE
              </span>
            </div>
          </div>

          {/* PostgreSQL Schemas */}
          <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-lg space-y-2">
            <div className="text-slate-300 font-bold flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Verified PostgreSQL Tables (Drizzle ORM):</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
              <div className="p-2 bg-[#0b0f19] border border-[#1f2937] rounded">
                <div className="font-bold text-indigo-300">users</div>
                <div className="text-[10px] text-slate-500 mt-0.5">id, uid, email, display_name, created_at</div>
              </div>
              <div className="p-2 bg-[#0b0f19] border border-[#1f2937] rounded">
                <div className="font-bold text-indigo-300">workspace_notes</div>
                <div className="text-[10px] text-slate-500 mt-0.5">id, user_id, title, source, snippet</div>
              </div>
              <div className="p-2 bg-[#0b0f19] border border-[#1f2937] rounded">
                <div className="font-bold text-indigo-300">google_tasks_sync</div>
                <div className="text-[10px] text-slate-500 mt-0.5">id, user_id, task_id, title, status, due</div>
              </div>
              <div className="p-2 bg-[#0b0f19] border border-[#1f2937] rounded">
                <div className="font-bold text-indigo-300">security_audit_logs</div>
                <div className="text-[10px] text-slate-500 mt-0.5">id, node_id, event, entropy, ucc_seal</div>
              </div>
            </div>
          </div>

          {/* Audit Logs from Cloud SQL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>Recent Cloud SQL Audit Logs:</span>
              <button
                onClick={fetchCloudSqlLogs}
                className="text-indigo-400 hover:text-indigo-300 text-[11px] flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingCloudSql ? 'animate-spin' : ''}`} />
                <span>Refresh Logs</span>
              </button>
            </div>
            {cloudSqlLogs.length === 0 ? (
              <div className="p-4 bg-[#111827] border border-[#1f2937] rounded-lg text-slate-500 text-center">
                No audit rows in database yet. Click "Write Audit Record" to insert a cryptographic record.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {cloudSqlLogs.map((log) => (
                  <div key={log.id} className="p-2 bg-[#111827] border border-[#1f2937] rounded flex items-center justify-between">
                    <div>
                      <span className="text-white font-semibold">{log.event}</span>
                      <span className="text-slate-500 ml-2">Node: {log.nodeId}</span>
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      {log.uccSeal && <span className="text-emerald-400 mr-2">{log.uccSeal}</span>}
                      {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
