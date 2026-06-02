/* ============================================================
 * HerCycleCalc, Local storage for saved calculations
 * Single localStorage key, single schema-version, defensive reads.
 * ============================================================ */
window.HCStorage = (function () {
  const KEY = 'hc-saved-v1';
  const VERSION = 1;
  const QUOTA_BYTES = 5 * 1024 * 1024;
  const WARN_BYTES  = 4 * 1024 * 1024;

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { v: VERSION, saved: [] };
      const data = JSON.parse(raw);
      if (!data || data.v !== VERSION || !Array.isArray(data.saved)) return { v: VERSION, saved: [] };
      return data;
    } catch { return { v: VERSION, saved: [] }; }
  }

  function write(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); return true; }
    catch (err) { console.warn('[HCStorage] write failed:', err.name); return false; }
  }

  function makeId(type) {
    return `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  }

  function save(snapshot) {
    const data = read();
    const entry = {
      id: makeId(snapshot.type),
      type: snapshot.type,
      name: (snapshot.name || `${snapshot.type} calculation`).trim().slice(0, 80),
      inputs: snapshot.inputs || null,
      shareParams: snapshot.shareParams || {},
      summary: snapshot.summary || null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    data.saved.unshift(entry);
    return write(data) ? entry : null;
  }

  function update(id, patch) {
    const data = read();
    const idx = data.saved.findIndex(s => s.id === id);
    if (idx < 0) return null;
    data.saved[idx] = {
      ...data.saved[idx], ...patch,
      id: data.saved[idx].id, createdAt: data.saved[idx].createdAt, updatedAt: Date.now()
    };
    return write(data) ? data.saved[idx] : null;
  }

  function rename(id, name) { return update(id, { name: (name || '').trim().slice(0, 80) }); }

  function remove(id) {
    const data = read();
    const before = data.saved.length;
    data.saved = data.saved.filter(s => s.id !== id);
    if (data.saved.length === before) return false;
    return write(data);
  }

  function get(id) { return read().saved.find(s => s.id === id) || null; }
  function getAll() { return read().saved; }
  function count() { return read().saved.length; }
  function clear() { return write({ v: VERSION, saved: [] }); }

  function getStorageInfo() {
    let bytes = 0;
    try { bytes = new Blob([localStorage.getItem(KEY) || '']).size; } catch {}
    return {
      bytes, quotaBytes: QUOTA_BYTES,
      percent: Math.min(100, (bytes / QUOTA_BYTES) * 100),
      warn: bytes > WARN_BYTES, full: bytes >= QUOTA_BYTES
    };
  }

  return { save, update, rename, remove, get, getAll, count, clear, getStorageInfo, makeId };
})();
