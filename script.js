/**
 * Prompt Filler — script.js
 * Vanilla JS, no dependencies.
 * All state lives in localStorage under key PF_KEY.
 */

(function () {
  'use strict';

  /* ── CONSTANTS ─────────────────────── */
  const PF_KEY = 'promptfiller_v3';
  const PF_LAST_KEY = 'promptfiller_last_id';
  const DEFAULT_PROMPTS = [
    {
      id: 'demo-1',
      name: 'Technical documentation note',
      template: `Act as a senior software engineer writing structured technical documentation for a public GitHub repository focused on Python and Data Structures & Algorithms.\n\nStrict Writing Rules:\n- No emojis.\n- No conversational tone.\n- No motivational or instructional phrases.\n- Formal, analytical, and precise.\n\nStructure Requirements:\n1. Definition and Concept Overview\n2. Core Principles and Internal Mechanics\n3. Step-by-Step Logical Breakdown\n4. Implementation (Python) with meaningful inline comments\n5. Time and Space Complexity Analysis\n6. Edge Cases and Failure Scenarios\n7. Practical Use Cases\n\nTopic:\n{{}}`,
      created: Date.now(),
    },
    {
      id: 'demo-2',
      name: 'Story generator',
      template: 'Write a {{}} story about a {{}} who discovers {{}} and ultimately {{}}.',
      created: Date.now() - 1000,
    },
    {
      id: 'demo-3',
      name: 'Expert explainer',
      template: 'Act as a {{}} expert. Explain {{}} to a {{}} in simple but precise terms. Use {{}} as an analogy.',
      created: Date.now() - 2000,
    },
  ];

  /* ── STATE ─────────────────────────── */
  let prompts = [];
  let activeId = null;
  let dirty = false;
  let searchQuery = '';
  let confirmCallback = null;
  let toastTimer = null;

  /* ── STORAGE ───────────────────────── */
  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(PF_KEY);
      if (raw) {
        prompts = JSON.parse(raw);
      } else {
        prompts = DEFAULT_PROMPTS.map(p => ({ ...p }));
        saveToStorage();
      }
    } catch {
      prompts = [];
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(PF_KEY, JSON.stringify(prompts));
    } catch (e) {
      showToast('Storage error — data may not be saved.');
    }
  }

  function saveLastId(id) {
    try {
      if (id) {
        localStorage.setItem(PF_LAST_KEY, id);
      } else {
        localStorage.removeItem(PF_LAST_KEY);
      }
    } catch {}
  }

  function loadLastId() {
    try {
      return localStorage.getItem(PF_LAST_KEY) || null;
    } catch {
      return null;
    }
  }

  /* ── UTILS ─────────────────────────── */
  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function countPH(str) {
    return (str.match(/\{\{\}\}/g) || []).length;
  }

  function slugify(str) {
    return (str || 'prompt')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'prompt';
  }

  function formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function getById(id) {
    return prompts.find(p => p.id === id) || null;
  }

  function getInputValues() {
    return Array.from(document.querySelectorAll('.ph-input')).map(t => t.value);
  }

  /* ── TOAST ─────────────────────────── */
  function showToast(msg, duration = 2000) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), duration);
  }

  /* ── DIRTY STATE ───────────────────── */
  function setDirty(val) {
    dirty = val;
    const dot = document.getElementById('dirtyDot');
    const discardBtn = document.getElementById('btnDiscard');
    dot.style.display = (val && activeId) ? 'block' : 'none';
    discardBtn.style.display = (val && activeId) ? 'inline-flex' : 'none';
  }

  /* ── FILTERED PROMPTS ──────────────── */
  function filteredPrompts() {
    if (!searchQuery) return prompts;
    const q = searchQuery.toLowerCase();
    return prompts.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.template || '').toLowerCase().includes(q)
    );
  }

  /* ── SIDEBAR ───────────────────────── */
  function renderSidebar() {
    const list = document.getElementById('sidebarList');
    const visible = filteredPrompts();

    if (!visible.length) {
      list.innerHTML = `<div class="sidebar-empty">${
        searchQuery ? 'No prompts match your search.' : 'No prompts yet.<br>Click <b>+</b> to create one.'
      }</div>`;
      return;
    }

    list.innerHTML = visible.map(p => `
      <div class="sidebar-item${activeId === p.id ? ' active' : ''}"
           data-id="${esc(p.id)}"
           draggable="true"
           role="button"
           tabindex="0"
           aria-label="${esc(p.name || 'Untitled')}">
        <svg class="icon sidebar-item-icon" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <div class="sidebar-item-text">
          <span class="sidebar-item-name">${esc(p.name || 'Untitled')}</span>
          <span class="sidebar-item-meta">${countPH(p.template || '')} ph · ${formatDate(p.updated || p.created)}</span>
        </div>
        <div class="sidebar-item-acts">
          <button class="icon-btn sm" data-act="dl" data-id="${esc(p.id)}" title="Download as .md">
            <svg class="icon" viewBox="0 0 24 24"><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          <button class="icon-btn sm" data-act="del" data-id="${esc(p.id)}" title="Delete">
            <svg class="icon" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  /* ── EDITOR ────────────────────────── */
  function renderEditor() {
    const emptyState = document.getElementById('emptyState');
    const editorFields = document.getElementById('editorFields');
    const breadSep = document.getElementById('breadcrumbSep');
    const breadName = document.getElementById('breadcrumbName');

    if (!activeId) {
      emptyState.style.display = 'flex';
      editorFields.style.display = 'none';
      breadSep.style.display = 'none';
      breadName.textContent = '';
      setDirty(false);
      renderOutput();
      return;
    }

    const p = getById(activeId);
    if (!p) { activeId = null; renderEditor(); return; }

    emptyState.style.display = 'none';
    editorFields.style.display = 'flex';
    breadSep.style.display = 'flex';
    breadName.textContent = p.name || 'Untitled';

    document.getElementById('promptName').value = p.name || '';
    document.getElementById('templateArea').value = p.template || '';

    rebuildInputs(p.template || '');
    setDirty(false);
    renderOutput();
  }

  function rebuildInputs(template) {
    const n = countPH(template);
    const wrap = document.getElementById('inputsWrap');
    const oldValues = Array.from(wrap.querySelectorAll('.ph-input')).map(t => t.value);

    wrap.innerHTML = '';

    document.getElementById('phCount').textContent = n;
    document.getElementById('inCount').textContent = n;

    if (n === 0) {
      const msg = document.createElement('div');
      msg.className = 'ph-empty-msg';
      msg.textContent = 'No {{}} placeholders found in template.';
      wrap.appendChild(msg);
      renderOutput();
      return;
    }

    for (let i = 0; i < n; i++) {
      const row = document.createElement('div');
      row.className = 'ph-row';

      const num = document.createElement('span');
      num.className = 'ph-num';
      num.textContent = i + 1;

      const ta = document.createElement('textarea');
      ta.className = 'ph-input field-textarea';
      ta.style.minHeight = '32px';
      ta.style.maxHeight = '100px';
      ta.placeholder = `Placeholder ${i + 1}`;
      ta.rows = 1;
      ta.value = oldValues[i] || '';
      ta.addEventListener('input', () => {
        autoResize(ta);
        renderOutput();
      });

      row.appendChild(num);
      row.appendChild(ta);
      wrap.appendChild(row);

      // set initial height
      setTimeout(() => autoResize(ta), 0);
    }

    renderOutput();
  }

  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  /* ── OUTPUT ────────────────────────── */
  function renderOutput() {
    const oc = document.getElementById('outputContent');
    const meta = document.getElementById('outputMeta');

    if (!activeId) {
      oc.innerHTML = '<span class="output-placeholder">Generated output will appear here as you type...</span>';
      meta.style.display = 'none';
      return;
    }

    const template = document.getElementById('templateArea').value;

    if (!template.trim()) {
      oc.innerHTML = '<span class="output-placeholder">Enter a template on the left...</span>';
      meta.style.display = 'none';
      return;
    }

    const inputs = getInputValues();
    const parts = template.split(/\{\{\}\}/);
    let result = parts[0];

    for (let i = 1; i < parts.length; i++) {
      const val = (inputs[i - 1] || '').trim();
      result += (val || '___') + parts[i];
    }

    oc.textContent = result;

    // word/char counts
    const chars = result.length;
    const words = result.trim() ? result.trim().split(/\s+/).length : 0;
    document.getElementById('outputCharCount').textContent = chars.toLocaleString() + ' chars';
    document.getElementById('outputWordCount').textContent = words.toLocaleString() + ' words';
    meta.style.display = 'flex';
  }

  /* ── CRUD ──────────────────────────── */
  function createPrompt() {
    const p = {
      id: genId(),
      name: 'Untitled prompt',
      template: '',
      created: Date.now(),
      updated: Date.now(),
    };
    prompts.unshift(p);
    saveToStorage();
    activeId = p.id;
    saveLastId(activeId);
    renderSidebar();
    renderEditor();

    // focus name
    setTimeout(() => {
      const nameInput = document.getElementById('promptName');
      nameInput.focus();
      nameInput.select();
    }, 50);
  }

  function selectPrompt(id) {
    if (id === activeId) return;
    if (dirty) {
      if (!confirm('You have unsaved changes. Discard them?')) return;
    }
    activeId = id;
    saveLastId(activeId);
    setDirty(false);
    renderSidebar();
    renderEditor();
  }

  function savePrompt() {
    if (!activeId) return;
    const p = getById(activeId);
    if (!p) return;

    p.name = document.getElementById('promptName').value.trim() || 'Untitled';
    p.template = document.getElementById('templateArea').value;
    p.updated = Date.now();

    saveToStorage();
    setDirty(false);
    renderSidebar();

    document.getElementById('breadcrumbName').textContent = p.name;
    showToast('Saved');
  }

  function deletePrompt(id) {
    const p = getById(id);
    const name = p ? (p.name || 'Untitled') : 'this prompt';
    showConfirm(
      'Delete prompt',
      `"${name}" will be permanently deleted.`,
      () => {
        prompts = prompts.filter(pr => pr.id !== id);
        saveToStorage();
        if (activeId === id) {
          activeId = prompts.length ? prompts[0].id : null;
          saveLastId(activeId);
          setDirty(false);
        }
        renderSidebar();
        renderEditor();
        showToast('Deleted');
      }
    );
  }

  function deleteAll() {
    if (!prompts.length) return;
    showConfirm(
      'Delete all prompts',
      `This will permanently remove all ${prompts.length} prompt(s). Export first if you want a backup.`,
      () => {
        prompts = [];
        activeId = null;
        saveLastId(null);
        setDirty(false);
        saveToStorage();
        renderSidebar();
        renderEditor();
        showToast('All prompts deleted');
      }
    );
  }

  /* ── EXPORT ────────────────────────── */
  function promptToMd(p) {
    return `${p.name || 'Untitled'}\n${p.template || ''}`;
  }

  function downloadText(filename, text) {
    const a = document.createElement('a');
    a.href = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(text);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function exportOne(id) {
    const p = getById(id);
    if (!p) return;
    downloadText(slugify(p.name || 'prompt') + '.md', promptToMd(p));
    showToast('Downloaded');
  }

  function exportAll() {
    if (!prompts.length) { showToast('No prompts to export'); return; }
    const md = prompts.map(promptToMd).join('\n\n---\n\n');
    downloadText('prompts-export.md', md);
    showToast(`Exported ${prompts.length} prompt(s)`);
  }

  /* ── IMPORT ────────────────────────── */
  function importMd(text) {
    const blocks = text.split(/\n---\n/);
    let added = 0;

    blocks.forEach(b => {
      const trimmed = b.trim();
      if (!trimmed) return;
      const lines = trimmed.split('\n');
      const name = lines[0].replace(/^#+\s*/, '').trim();
      const template = lines.slice(1).join('\n').trim();
      if (!name && !template) return;
      prompts.push({
        id: genId(),
        name: name || 'Imported',
        template: template || '',
        created: Date.now(),
        updated: Date.now(),
      });
      added++;
    });

    if (added) {
      saveToStorage();
      renderSidebar();
      showToast(`Imported ${added} prompt(s)`);
    } else {
      showToast('No valid prompts found in file');
    }
  }

  /* ── COPY OUTPUT ───────────────────── */
  function copyOutput() {
    const oc = document.getElementById('outputContent');
    const text = oc.textContent || '';
    if (!text || oc.querySelector('.output-placeholder')) return;

    const lbl = document.getElementById('copyLabel');

    const succeed = () => {
      lbl.textContent = 'Copied';
      showToast('Output copied to clipboard');
      setTimeout(() => { lbl.textContent = 'Copy'; }, 1600);
    };
    const fail = () => { showToast('Copy failed — try selecting manually'); };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(succeed).catch(() => fallbackCopy(text, succeed, fail));
    } else {
      fallbackCopy(text, succeed, fail);
    }
  }

  function fallbackCopy(text, succeed, fail) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      succeed();
    } catch {
      fail();
    }
    document.body.removeChild(ta);
  }

  /* ── CLEAR VALUES ──────────────────── */
  function clearValues() {
    document.querySelectorAll('.ph-input').forEach(t => {
      t.value = '';
      autoResize(t);
    });
    renderOutput();
  }

  /* ── CONFIRM MODAL ─────────────────── */
  function showConfirm(title, msg, cb) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMsg').textContent = msg;
    document.getElementById('confirmModal').style.display = 'flex';
    confirmCallback = cb;
  }

  /* ── RESIZE HANDLE ─────────────────── */
  function initResizeHandle() {
    const handle = document.getElementById('resizeHandle');
    const workspace = document.querySelector('.workspace');
    let dragging = false;
    let startX = 0;
    let startLeftW = 0;

    handle.addEventListener('mousedown', e => {
      dragging = true;
      startX = e.clientX;
      startLeftW = document.querySelector('.pane-left').offsetWidth;
      handle.classList.add('dragging');
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    });

    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const totalW = workspace.offsetWidth;
      const newLeftW = Math.max(280, Math.min(startLeftW + dx, totalW - 260));
      document.querySelector('.pane-left').style.flex = 'none';
      document.querySelector('.pane-left').style.width = newLeftW + 'px';
      document.querySelector('.pane-right').style.flex = '1';
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove('dragging');
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    });
  }

  /* ── DRAG REORDER SIDEBAR ──────────── */
  let dragId = null;

  function initDragReorder() {
    const list = document.getElementById('sidebarList');

    list.addEventListener('dragstart', e => {
      const item = e.target.closest('.sidebar-item');
      if (!item) return;
      dragId = item.dataset.id;
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => item.style.opacity = '0.4', 0);
    });

    list.addEventListener('dragend', e => {
      const item = e.target.closest('.sidebar-item');
      if (item) item.style.opacity = '';
      document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('drag-over'));
    });

    list.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const item = e.target.closest('.sidebar-item');
      document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('drag-over'));
      if (item && item.dataset.id !== dragId) item.classList.add('drag-over');
    });

    list.addEventListener('dragleave', e => {
      const item = e.target.closest('.sidebar-item');
      if (item) item.classList.remove('drag-over');
    });

    list.addEventListener('drop', e => {
      e.preventDefault();
      const target = e.target.closest('.sidebar-item');
      if (!target) return;
      target.classList.remove('drag-over');
      if (!dragId || target.dataset.id === dragId) return;

      const fromIdx = prompts.findIndex(p => p.id === dragId);
      const toIdx = prompts.findIndex(p => p.id === target.dataset.id);
      if (fromIdx < 0 || toIdx < 0) return;

      const [moved] = prompts.splice(fromIdx, 1);
      prompts.splice(toIdx, 0, moved);
      saveToStorage();
      renderSidebar();
    });
  }

  /* ── KEYBOARD SHORTCUTS ────────────── */
  function initKeyboard() {
    document.addEventListener('keydown', e => {
      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && e.key === 's') {
        e.preventDefault();
        savePrompt();
      }

      if (isMod && e.key === 'n') {
        e.preventDefault();
        createPrompt();
      }

      if (e.key === 'Escape') {
        if (document.getElementById('importModal').style.display !== 'none') {
          document.getElementById('importModal').style.display = 'none';
        }
        if (document.getElementById('confirmModal').style.display !== 'none') {
          document.getElementById('confirmModal').style.display = 'none';
          confirmCallback = null;
        }
        if (document.getElementById('howItWorksModal').style.display !== 'none') {
          document.getElementById('howItWorksModal').style.display = 'none';
        }
      }
    });
  }

  /* ── EVENT WIRING ──────────────────── */
  function wireEvents() {

    /* Sidebar toggle */
    document.getElementById('sidebarToggle').addEventListener('click', () => {
      const sb = document.getElementById('sidebar');
      const collapsed = sb.classList.toggle('collapsed');
      document.getElementById('toggleIconOpen').style.display = collapsed ? 'none' : 'block';
      document.getElementById('toggleIconClose').style.display = collapsed ? 'block' : 'none';
    });

    /* Search */
    document.getElementById('searchInput').addEventListener('input', e => {
      searchQuery = e.target.value;
      renderSidebar();
    });

    /* New prompt */
    document.getElementById('btnNew').addEventListener('click', createPrompt);
    document.getElementById('btnNewEmpty').addEventListener('click', createPrompt);

    /* Save */
    document.getElementById('btnSave').addEventListener('click', savePrompt);

    /* Discard */
    document.getElementById('btnDiscard').addEventListener('click', () => {
      setDirty(false);
      renderEditor();
    });

    /* Export */
    document.getElementById('btnExportAll').addEventListener('click', exportAll);
    document.getElementById('btnExportOne').addEventListener('click', () => {
      if (activeId) exportOne(activeId);
    });

    /* Delete all */
    document.getElementById('btnDeleteAll').addEventListener('click', deleteAll);

    /* Copy output */
    document.getElementById('btnCopy').addEventListener('click', copyOutput);

    /* Clear values */
    document.getElementById('btnClearValues').addEventListener('click', clearValues);

    /* Sidebar list (click + keyboard) */
    document.getElementById('sidebarList').addEventListener('click', e => {
      const actBtn = e.target.closest('[data-act]');
      if (actBtn) {
        e.stopPropagation();
        const id = actBtn.dataset.id;
        if (actBtn.dataset.act === 'del') deletePrompt(id);
        if (actBtn.dataset.act === 'dl') exportOne(id);
        return;
      }
      const item = e.target.closest('.sidebar-item');
      if (item) selectPrompt(item.dataset.id);
    });

    document.getElementById('sidebarList').addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const item = e.target.closest('.sidebar-item');
        if (item) { e.preventDefault(); selectPrompt(item.dataset.id); }
      }
    });

    /* Editor live events */
    document.getElementById('promptName').addEventListener('input', () => setDirty(true));

    document.getElementById('templateArea').addEventListener('input', () => {
      setDirty(true);
      rebuildInputs(document.getElementById('templateArea').value);
    });

    /* Import modal open */
    document.getElementById('btnImportOpen').addEventListener('click', () => {
      document.getElementById('importTextArea').value = '';
      document.getElementById('importModal').style.display = 'flex';
      setTimeout(() => document.getElementById('importTextArea').focus(), 50);
    });

    /* Import modal close/confirm */
    document.getElementById('btnImportClose').addEventListener('click', () => {
      document.getElementById('importModal').style.display = 'none';
    });
    document.getElementById('btnImportCancel').addEventListener('click', () => {
      document.getElementById('importModal').style.display = 'none';
    });
    document.getElementById('btnImportConfirm').addEventListener('click', () => {
      const val = document.getElementById('importTextArea').value.trim();
      document.getElementById('importModal').style.display = 'none';
      if (val) importMd(val);
    });

    /* Overlay click-outside to close */
    document.getElementById('importModal').addEventListener('click', e => {
      if (e.target === document.getElementById('importModal')) {
        document.getElementById('importModal').style.display = 'none';
      }
    });
    document.getElementById('confirmModal').addEventListener('click', e => {
      if (e.target === document.getElementById('confirmModal')) {
        document.getElementById('confirmModal').style.display = 'none';
        confirmCallback = null;
      }
    });
    document.getElementById('howItWorksModal').addEventListener('click', e => {
      if (e.target === document.getElementById('howItWorksModal')) {
        document.getElementById('howItWorksModal').style.display = 'none';
      }
    });

    /* Confirm modal */
    document.getElementById('btnConfirmCancel').addEventListener('click', () => {
      document.getElementById('confirmModal').style.display = 'none';
      confirmCallback = null;
    });
    document.getElementById('btnConfirmOk').addEventListener('click', () => {
      document.getElementById('confirmModal').style.display = 'none';
      if (confirmCallback) confirmCallback();
      confirmCallback = null;
    });

    /* How it works modal */
    document.getElementById('btnHowItWorks').addEventListener('click', () => {
      document.getElementById('howItWorksModal').style.display = 'flex';
    });
    document.getElementById('btnHowItWorksClose').addEventListener('click', () => {
      document.getElementById('howItWorksModal').style.display = 'none';
    });
  }

  /* ── INIT ──────────────────────────── */
  function init() {
    loadFromStorage();

    // Restore last used prompt, fall back to first
    const lastId = loadLastId();
    if (lastId && getById(lastId)) {
      activeId = lastId;
    } else if (prompts.length) {
      activeId = prompts[0].id;
      saveLastId(activeId);
    }

    renderSidebar();
    renderEditor();

    wireEvents();
    initResizeHandle();
    initDragReorder();
    initKeyboard();
  }

  document.addEventListener('DOMContentLoaded', init);

})();