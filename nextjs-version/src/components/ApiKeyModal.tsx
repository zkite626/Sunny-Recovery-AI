'use client';

import { useState, useEffect } from 'react';
import { getApiKey, setApiKey } from '@/lib/storage';

export default function ApiKeyModal() {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState('');

  useEffect(() => {
    const existing = getApiKey();
    if (existing) setKey(existing);
  }, [open]);

  const handleSave = () => {
    if (!key.trim()) return;
    setApiKey(key.trim());
    setOpen(false);
  };

  return (
    <>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => setOpen(true)}
        style={getApiKey() ? { opacity: 0.5 } : undefined}
      >
        {getApiKey() ? 'API Key 已设置' : '自定义 API Key（可选）'}
      </button>

      {open && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="modal-box" style={{ position: 'relative' }}>
            <button className="modal-close" onClick={() => setOpen(false)}>
              &times;
            </button>
            <h3 className="heading-section" style={{ marginBottom: 'var(--sp-3)', fontSize: 'var(--text-xl)' }}>
              设置 API Key
            </h3>
            <p className="text-body" style={{ marginBottom: 'var(--sp-5)' }}>
              服务器已配置默认 Key，此项为可选覆盖。
            </p>
            <input
              type="password"
              className="input-line"
              placeholder="sk-..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              style={{ marginBottom: 'var(--sp-4)' }}
            />
            <button className="btn btn-sun" style={{ width: '100%' }} onClick={handleSave}>
              保存
            </button>
            <p className="text-caption" style={{ marginTop: 'var(--sp-3)', textAlign: 'center' }}>
              Key 仅保存在本地浏览器，不会上传
            </p>
          </div>
        </div>
      )}
    </>
  );
}
