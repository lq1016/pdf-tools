'use client';
import { useCallback, useRef, useState } from 'react';

export default function DropZone({
  onFiles,
  accept = '.pdf,.png,.jpg,.jpeg,.webp',
  multiple = true,
  icon = '📂',
  text = '拖拽文件到此处，或点击选择文件',
  hint,
}) {
  const inputRef = useRef(null);
  const [active, setActive] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setActive(false);
    const files = Array.from(e.dataTransfer.files).filter(f =>
      accept.split(',').some(ext => f.name.toLowerCase().endsWith(ext.trim().replace('.','').toLowerCase()) || f.type.includes(ext.replace('.','')))
    );
    if (files.length > 0) onFiles(files);
  }, [onFiles, accept]);

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) onFiles(files);
    e.target.value = '';
  };

  return (
    <div
      className={`drop-zone ${active ? 'active' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setActive(true); }}
      onDragLeave={() => setActive(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <div className="drop-zone-icon">{icon}</div>
      <div className="drop-zone-text">{text}</div>
      {hint && <div className="drop-zone-hint">{hint}</div>}
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={handleChange} />
    </div>
  );
}
