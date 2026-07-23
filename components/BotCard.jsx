'use client';

import { useState } from 'react';

export default function BotCard({ bot, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const [rules, setRules] = useState(bot.rules || []);
  const [welcome, setWelcome] = useState(bot.welcomeMessage || '');
  const [fallback, setFallback] = useState(bot.fallbackMessage || '');
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  const isActive = bot.status === 'active';

  async function toggleStatus() {
    setBusy(true);
    await fetch(`/api/bots/${bot.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: isActive ? 'paused' : 'active' }),
    });
    setBusy(false);
    onChange?.();
  }

  async function removeBot() {
    if (!confirm(`Hapus @${bot.username}? Webhook akan dicabut dan bot berhenti membalas.`)) return;
    setBusy(true);
    await fetch(`/api/bots/${bot.id}`, { method: 'DELETE' });
    setBusy(false);
    onChange?.();
  }

  function addRule() {
    setRules((r) => [...r, { trigger: '', type: 'contains', reply: '' }]);
  }

  function updateRule(idx, field, value) {
    setRules((r) => r.map((rule, i) => (i === idx ? { ...rule, [field]: value } : rule)));
  }

  function removeRule(idx) {
    setRules((r) => r.filter((_, i) => i !== idx));
  }

  async function saveRules() {
    setSaving(true);
    await fetch(`/api/bots/${bot.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rules: rules.filter((r) => r.trigger.trim() && r.reply.trim()),
        welcomeMessage: welcome,
        fallbackMessage: fallback,
      }),
    });
    setSaving(false);
    onChange?.();
  }

  return (
    <div className={`card ${!isActive ? 'paused' : ''}`}>
      <div className="pulse-bar" aria-hidden="true" />

      <div className="card-body">
        <div className="card-head">
          <div>
            <p className="username">@{bot.username}</p>
            <p className="name">{bot.firstName}</p>
          </div>
          <span className={`badge ${isActive ? 'live' : 'off'}`}>
            {isActive ? 'aktif' : 'dijeda'}
          </span>
        </div>

        <div className="meta-row">
          <span>{bot.messageCount || 0} pesan diproses</span>
        </div>

        <div className="actions">
          <button onClick={toggleStatus} disabled={busy} className="btn-secondary">
            {isActive ? 'Jeda bot' : 'Aktifkan lagi'}
          </button>
          <button onClick={() => setExpanded((e) => !e)} className="btn-secondary">
            {expanded ? 'Tutup pengaturan' : 'Atur balasan'}
          </button>
          <button onClick={removeBot} disabled={busy} className="btn-danger">
            Hapus
          </button>
        </div>

        {expanded && (
          <div className="editor">
            <div className="editor-field">
              <label>Pesan saat /start</label>
              <textarea
                value={welcome}
                onChange={(e) => setWelcome(e.target.value)}
                rows={2}
              />
            </div>

            <div className="editor-field">
              <label>Balasan default (jika tak ada kata kunci cocok)</label>
              <textarea
                value={fallback}
                onChange={(e) => setFallback(e.target.value)}
                rows={2}
              />
            </div>

            <div className="rules-head">
              <label>Kata kunci &amp; balasan otomatis</label>
              <button onClick={addRule} className="btn-add">+ Tambah</button>
            </div>

            {rules.length === 0 && (
              <p className="empty-rules">Belum ada kata kunci. Tambahkan agar bot bisa membalas otomatis.</p>
            )}

            {rules.map((rule, idx) => (
              <div className="rule-row" key={idx}>
                <input
                  placeholder="kata kunci"
                  value={rule.trigger}
                  onChange={(e) => updateRule(idx, 'trigger', e.target.value)}
                />
                <select
                  value={rule.type}
                  onChange={(e) => updateRule(idx, 'type', e.target.value)}
                >
                  <option value="contains">mengandung</option>
                  <option value="exact">persis sama</option>
                  <option value="starts">diawali</option>
                </select>
                <input
                  placeholder="balasan"
                  value={rule.reply}
                  onChange={(e) => updateRule(idx, 'reply', e.target.value)}
                />
                <button onClick={() => removeRule(idx)} className="btn-remove" aria-label="Hapus kata kunci">
                  ×
                </button>
              </div>
            ))}

            <button onClick={saveRules} disabled={saving} className="btn-save">
              {saving ? 'Menyimpan…' : 'Simpan pengaturan'}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .card {
          position: relative;
          display: flex;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
        }

        .pulse-bar {
          width: 4px;
          flex-shrink: 0;
          background: var(--signal);
          animation: pulse 2.2s ease-in-out infinite;
        }

        .card.paused .pulse-bar {
          background: var(--text-faint);
          animation: none;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        .card-body {
          flex: 1;
          padding: 18px 20px;
          min-width: 0;
        }

        .card-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .username {
          font-family: var(--mono);
          font-weight: 700;
          font-size: 15px;
          margin: 0;
        }

        .name {
          margin: 2px 0 0;
          color: var(--text-dim);
          font-size: 12px;
        }

        .badge {
          font-size: 10px;
          font-family: var(--mono);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 3px 8px;
          border-radius: 100px;
          flex-shrink: 0;
        }

        .badge.live {
          background: var(--signal-dim);
          color: var(--signal);
        }

        .badge.off {
          background: var(--panel-raised);
          color: var(--text-faint);
        }

        .meta-row {
          margin-top: 10px;
          font-size: 12px;
          color: var(--text-faint);
        }

        .actions {
          display: flex;
          gap: 8px;
          margin-top: 14px;
          flex-wrap: wrap;
        }

        .btn-secondary, .btn-danger {
          background: var(--panel-raised);
          border: 1px solid var(--border);
          color: var(--text-dim);
          padding: 7px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
        }

        .btn-secondary:hover {
          color: var(--text);
          border-color: var(--signal-dim);
        }

        .btn-danger:hover {
          color: var(--danger);
          border-color: var(--danger);
        }

        .editor {
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .editor-field label,
        .rules-head label {
          display: block;
          font-size: 11px;
          color: var(--text-faint);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 6px;
        }

        textarea, input, select {
          width: 100%;
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text);
          padding: 8px 10px;
          border-radius: 6px;
          font-size: 13px;
          font-family: var(--sans);
          outline: none;
          resize: vertical;
        }

        textarea:focus, input:focus, select:focus {
          border-color: var(--signal);
        }

        .rules-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 6px;
        }

        .btn-add {
          background: none;
          border: none;
          color: var(--signal);
          font-size: 12px;
          cursor: pointer;
          padding: 0;
        }

        .empty-rules {
          font-size: 12px;
          color: var(--text-faint);
          margin: 0;
        }

        .rule-row {
          display: grid;
          grid-template-columns: 1fr 100px 1fr auto;
          gap: 6px;
          align-items: center;
        }

        .rule-row select {
          font-size: 11px;
          padding: 8px 4px;
        }

        .btn-remove {
          background: var(--panel-raised);
          border: 1px solid var(--border);
          color: var(--text-faint);
          width: 30px;
          height: 34px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
        }

        .btn-remove:hover {
          color: var(--danger);
          border-color: var(--danger);
        }

        .btn-save {
          align-self: flex-start;
          background: var(--signal);
          color: #06120c;
          border: none;
          padding: 9px 18px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          margin-top: 4px;
        }

        .btn-save:disabled {
          opacity: 0.5;
        }

        @media (max-width: 480px) {
          .rule-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
