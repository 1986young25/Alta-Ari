// Helper to interact with Google Workspace APIs (Drive, Picker, Docs, Keep)

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  iconLink?: string;
  webViewLink?: string;
  thumbnailLink?: string;
  modifiedTime?: string;
  size?: string;
}

export interface GoogleDocContent {
  documentId: string;
  title: string;
  bodyText: string;
}

// 1. Google Drive API
export async function listDriveFiles(accessToken: string, queryParam = "trashed = false"): Promise<GoogleDriveFile[]> {
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.append('pageSize', '20');
  url.searchParams.append('fields', 'files(id, name, mimeType, iconLink, webViewLink, thumbnailLink, modifiedTime, size)');
  url.searchParams.append('q', queryParam);
  url.searchParams.append('orderBy', 'modifiedTime desc');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Drive API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.files || [];
}

// 2. Google Docs API - Fetch document details and extract plain text
export async function getDocContent(accessToken: string, documentId: string): Promise<GoogleDocContent> {
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Docs API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  let extractedText = '';

  if (data.body && data.body.content) {
    for (const elem of data.body.content) {
      if (elem.paragraph && elem.paragraph.elements) {
        for (const pElem of elem.paragraph.elements) {
          if (pElem.textRun && pElem.textRun.content) {
            extractedText += pElem.textRun.content;
          }
        }
      }
    }
  }

  return {
    documentId: data.documentId,
    title: data.title,
    bodyText: extractedText.trim(),
  };
}

// 3. Create a new Google Doc
export async function createGoogleDoc(accessToken: string, title: string, content?: string): Promise<{ documentId: string; title: string }> {
  // Create doc
  const res = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Docs creation error: ${res.status} ${err}`);
  }

  const docData = await res.json();
  const documentId = docData.documentId;

  // If initial text is provided, insert it
  if (content && content.length > 0) {
    await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: content,
            },
          },
        ],
      }),
    });
  }

  return {
    documentId,
    title: docData.title || title,
  };
}

// 4. Google Picker API loader and trigger
export function openGooglePicker({
  accessToken,
  onPick,
  onCancel,
}: {
  accessToken: string;
  onPick: (doc: any) => void;
  onCancel?: () => void;
}) {
  if (!window.gapi) {
    alert('Google API library is still loading. Please try again in a few moments.');
    return;
  }

  window.gapi.load('picker', () => {
    if (!window.google || !window.google.picker) {
      console.error('Google Picker script failed to load.');
      return;
    }

    const pickerOrigin =
      window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0
        ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
        : window.location.origin;

    const docsView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false);

    const picker = new window.google.picker.PickerBuilder()
      .addView(docsView)
      .addView(window.google.picker.ViewId.DOCS_IMAGES)
      .setOAuthToken(accessToken)
      .setOrigin(pickerOrigin)
      .setCallback((data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const pickedDoc = data.docs[0];
          onPick(pickedDoc);
        } else if (data.action === window.google.picker.Action.CANCEL) {
          if (onCancel) onCancel();
        }
      })
      .build();

    picker.setVisible(true);
  });
}

// ============================================================================
// 5. GMAIL API INTEGRATION
// ============================================================================

export interface GmailMessageSummary {
  id: string;
  threadId: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  bodyText?: string;
  labelIds?: string[];
}

export async function listGmailMessages(
  accessToken: string,
  maxResults = 10,
  query = ''
): Promise<GmailMessage[]> {
  const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
  url.searchParams.append('maxResults', maxResults.toString());
  if (query) {
    url.searchParams.append('q', query);
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const messageSummaries: GmailMessageSummary[] = data.messages || [];

  // Fetch detailed headers for the top messages in parallel
  const details = await Promise.all(
    messageSummaries.slice(0, 10).map((m) => getGmailMessageDetails(accessToken, m.id).catch(() => null))
  );

  return details.filter((m): m is GmailMessage => m !== null);
}

export async function getGmailMessageDetails(accessToken: string, messageId: string): Promise<GmailMessage> {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gmail message fetch error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const headers = data.payload?.headers || [];
  const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  let bodyText = data.snippet || '';
  if (data.payload?.parts) {
    const textPart = data.payload.parts.find((p: any) => p.mimeType === 'text/plain');
    if (textPart?.body?.data) {
      try {
        bodyText = decodeURIComponent(
          escape(atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/')))
        );
      } catch {
        // Fallback to snippet
      }
    }
  }

  return {
    id: data.id,
    threadId: data.threadId,
    snippet: data.snippet || '',
    subject: getHeader('Subject') || '(No Subject)',
    from: getHeader('From') || 'Unknown Sender',
    to: getHeader('To') || '',
    date: getHeader('Date') || '',
    bodyText,
    labelIds: data.labelIds || [],
  };
}

export async function sendGmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  body: string
): Promise<{ id: string; threadId: string }> {
  // Construct RFC 2822 email format
  const emailContent = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    btoa(unescape(encodeURIComponent(body))),
  ].join('\r\n');

  const base64UrlEmail = btoa(unescape(encodeURIComponent(emailContent)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: base64UrlEmail }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Send email error: ${res.status} ${err}`);
  }

  return await res.json();
}

// ============================================================================
// 6. GOOGLE TASKS API INTEGRATION
// ============================================================================

export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
}

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  updated?: string;
  completed?: string;
}

export async function listGoogleTaskLists(accessToken: string): Promise<GoogleTaskList[]> {
  const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tasks API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.items || [];
}

export async function listGoogleTasks(accessToken: string, tasklistId = '@default'): Promise<GoogleTaskItem[]> {
  const url = new URL(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(tasklistId)}/tasks`);
  url.searchParams.append('showCompleted', 'true');
  url.searchParams.append('showHidden', 'true');
  url.searchParams.append('maxResults', '50');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`List tasks error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.items || [];
}

export async function createGoogleTask(
  accessToken: string,
  tasklistId = '@default',
  task: { title: string; notes?: string; due?: string }
): Promise<GoogleTaskItem> {
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(tasklistId)}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Create task error: ${res.status} ${err}`);
  }

  return await res.json();
}

export async function updateGoogleTaskStatus(
  accessToken: string,
  tasklistId: string,
  taskId: string,
  completed: boolean
): Promise<GoogleTaskItem> {
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(tasklistId)}/tasks/${encodeURIComponent(taskId)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: completed ? 'completed' : 'needsAction',
      completed: completed ? new Date().toISOString() : null,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Update task error: ${res.status} ${err}`);
  }

  return await res.json();
}

export async function deleteGoogleTask(accessToken: string, tasklistId: string, taskId: string): Promise<boolean> {
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(tasklistId)}/tasks/${encodeURIComponent(taskId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Delete task error: ${res.status} ${err}`);
  }

  return true;
}

// ============================================================================
// 7. GOOGLE SHEETS API INTEGRATION
// ============================================================================

export interface GoogleSheetTab {
  sheetId: number;
  title: string;
  index: number;
  rowCount?: number;
  columnCount?: number;
}

export interface GoogleSpreadsheet {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  sheets: GoogleSheetTab[];
}

export interface SpreadsheetValuesResult {
  range: string;
  majorDimension: string;
  values: string[][];
}

/**
 * List all Google Sheets files available in the user's Drive
 */
export async function listDriveSpreadsheets(accessToken: string): Promise<GoogleDriveFile[]> {
  const query = "mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime,webViewLink,iconLink)&pageSize=25`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`List spreadsheets error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Fetch spreadsheet structure, sheets list, and title
 */
export async function getSpreadsheet(accessToken: string, spreadsheetId: string): Promise<GoogleSpreadsheet> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Get spreadsheet error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const sheets: GoogleSheetTab[] = (data.sheets || []).map((s: any) => ({
    sheetId: s.properties?.sheetId ?? 0,
    title: s.properties?.title || 'Sheet1',
    index: s.properties?.index ?? 0,
    rowCount: s.properties?.gridProperties?.rowCount,
    columnCount: s.properties?.gridProperties?.columnCount,
  }));

  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl,
    title: data.properties?.title || 'Untitled Spreadsheet',
    sheets,
  };
}

/**
 * Read values from a specified range in a spreadsheet (e.g., 'Sheet1!A1:Z50')
 */
export async function getSpreadsheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<SpreadsheetValuesResult> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Read sheet values error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return {
    range: data.range || range,
    majorDimension: data.majorDimension || 'ROWS',
    values: data.values || [],
  };
}

/**
 * Update values in a specific range of a spreadsheet
 */
export async function updateSpreadsheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: (string | number | boolean)[][]
): Promise<any> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Update sheet values error: ${res.status} ${err}`);
  }

  return await res.json();
}

/**
 * Append rows to a sheet
 */
export async function appendSpreadsheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: (string | number | boolean)[][]
): Promise<any> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Append sheet values error: ${res.status} ${err}`);
  }

  return await res.json();
}

/**
 * Create a new Google Spreadsheet with optional initial headers and rows
 */
export async function createGoogleSpreadsheet(
  accessToken: string,
  title: string,
  initialData?: { sheetTitle?: string; rows?: (string | number | boolean)[][] }
): Promise<GoogleSpreadsheet> {
  const requestBody: any = {
    properties: {
      title,
    },
  };

  if (initialData?.sheetTitle) {
    requestBody.sheets = [
      {
        properties: {
          title: initialData.sheetTitle,
        },
      },
    ];
  }

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Create spreadsheet error: ${res.status} ${err}`);
  }

  const created = await res.json();
  const spreadsheetId = created.spreadsheetId;

  // If initial rows are provided, insert them
  if (initialData?.rows && initialData.rows.length > 0) {
    const sheetName = initialData.sheetTitle || created.sheets?.[0]?.properties?.title || 'Sheet1';
    await appendSpreadsheetValues(accessToken, spreadsheetId, `${sheetName}!A1`, initialData.rows);
  }

  const sheets: GoogleSheetTab[] = (created.sheets || []).map((s: any) => ({
    sheetId: s.properties?.sheetId ?? 0,
    title: s.properties?.title || 'Sheet1',
    index: s.properties?.index ?? 0,
  }));

  return {
    spreadsheetId: created.spreadsheetId,
    spreadsheetUrl: created.spreadsheetUrl,
    title: created.properties?.title || title,
    sheets,
  };
}


