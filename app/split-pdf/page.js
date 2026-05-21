'use client';
import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DropZone from '@/components/DropZone';
import AdSlot from '@/components/AdSlot';
import { formatSize, readFileAsBuffer, downloadFile } from '@/lib/pdf-utils';

export default function SplitPdfPage() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [mode, setMode] = useState('all'); // 'all' | 'range' | 'select'
  const [pageRange, setPageRange] = useState('');
  const [selectedPages, setSelectedPages] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  const addFiles = useCallback((incoming) => {
    const pdfs = incoming.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (pdfs.length === 0) return;
    setFiles(prev => [...prev, ...pdfs.map(f => ({ file: f, meta: null }))]);
    setDone(false);
  }, []);

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setDone(false);
  };

  const loadMeta = async (idx) => {
    const entry = files[idx];
    if (!entry.meta) {
      const buffer = await readFileAsBuffer(entry.file);
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdf.getPageCount();
      const newFiles = [...files];
      newFiles[idx] = { ...newFiles[idx], meta: { pages: count, doc: pdf, buffer } };
      setFiles(newFiles);
      setTotalPages(count);
      setSelectedPages(Array.from({ length: count }, (_, i) => true));
    }
  };

  const handleSplit = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      for (const entry of files) {
        const buffer = entry.meta ? entry.meta.buffer : await readFileAsBuffer(entry.file);
        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const total = pdf.getPageCount();
        const baseName = entry.file.name.replace('.pdf', '');

        if (mode === 'all') {
          // 每页拆一个文件
          for (let i = 0; i < total; i++) {
            const newPdf = await PDFDocument.create();
            const [page] = await newPdf.copyPages(pdf, [i]);
            newPdf.addPage(page);
            const bytes = await newPdf.save();
            downloadFile(new Blob([bytes], { type: 'application/pdf' }), `${baseName}_第${i+1}页.pdf`);
          }
        } else if (mode === 'range') {
          const ranges = pageRange.split(',').map(s => s.trim());
          for (const range of ranges) {
            const match = range.match(/^(\d+)-(\d+)$/);
            if (match) {
              const start = Math.max(1, parseInt(match[1]));
              const end = Math.min(total, parseInt(match[2]));
              if (start <= end) {
                const idxs = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
                const newPdf = await PDFDocument.create();
                const pages = await newPdf.copyPages(pdf, idxs);
                pages.forEach(p => newPdf.addPage(p));
                const bytes = await newPdf.save();
                downloadFile(new Blob([bytes], { type: 'application/pdf' }), `${baseName}_第${start}-${end}页.pdf`);
              }
            }
          }
        } else if (mode === 'select') {
          const selected = selectedPages.map((v, i) => v ? i : -1).filter(v => v >= 0);
          if (selected.length > 0) {
            const newPdf = await PDFDocument.create();
            const pages = await newPdf.copyPages(pdf, selected);
            pages.forEach(p => newPdf.addPage(p));
            const bytes = await newPdf.save();
            const pageStr = selected.map(i => i+1).join('-');
            downloadFile(new Blob([bytes], { type: 'application/pdf' }), `${baseName}_选取页_${pageStr}.pdf`);
          }
        }
      }
      setDone(true);
    } catch (err) {
      alert('拆分出错：' + err.message);
    }
    setProcessing(false);
  };

  return (
    <div className="app-wrapper">
      <Header />
      <main className="main-content">
        <div className="tool-page">
          <div className="tool-page-header">
            <h1>✂️ PDF 拆分</h1>
            <p>将 PDF 按页拆分，支持逐页拆分、指定范围提取或手动选取页面。</p>
          </div>
          <DropZone
            onFiles={addFiles}
            accept=".pdf"
            icon="✂️"
            text="拖拽 PDF 文件到此处，或点击选择"
            hint="支持单个或多个 PDF 文件"
          />
          {files.length > 0 && (
            <div className="file-list">
              {files.map((entry, idx) => (
                <div key={idx} className="file-item">
                  <span className="name">📄 {entry.file.name}</span>
                  <span className="size">{formatSize(entry.file.size)}</span>
                  <button className="remove" onClick={() => removeFile(idx)}>✕</button>
                </div>
              ))}
            </div>
          )}
          {files.length > 0 && (
            <>
              <div className="options-row">
                <label>
                  拆分模式：
                  <select value={mode} onChange={e => { setMode(e.target.value); if (e.target.value !== 'select') loadMeta(0); }}>
                    <option value="all">逐页拆分（每页一个文件）</option>
                    <option value="range">指定页码范围</option>
                    <option value="select">手动选取页面</option>
                  </select>
                </label>
              </div>
              {mode === 'range' && (
                <div className="options-row">
                  <label>
                    页码范围（如：1-3,5,7-9）：
                    <input
                      type="text"
                      value={pageRange}
                      onChange={e => setPageRange(e.target.value)}
                      placeholder="1-3,5,7-9"
                      style={{ width: '200px' }}
                    />
                  </label>
                </div>
              )}
              {mode === 'select' && (
                <div className="options-row" style={{ flexWrap: 'wrap' }}>
                  {selectedPages.map((selected, i) => (
                    <label key={i} style={{ cursor: 'pointer', padding: '0.2rem 0.4rem', background: selected ? '#eef2ff' : '#f1f5f9', borderRadius: '4px' }}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => {
                          const newSel = [...selectedPages];
                          newSel[i] = !newSel[i];
                          setSelectedPages(newSel);
                        }}
                      /> 第{i+1}页
                    </label>
                  ))}
                  <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
                    onClick={() => setSelectedPages(selectedPages.map(() => true))}>
                    全选
                  </button>
                </div>
              )}
              <div className="btn-group">
                <button className="btn btn-primary" onClick={() => { loadMeta(0); handleSplit(); }} disabled={processing}>
                  {processing ? '⏳ 拆分中...' : '✂️ 开始拆分'}
                </button>
                <button className="btn btn-outline" onClick={() => { setFiles([]); setDone(false); setSelectedPages([]); }}>
                  🗑️ 清空
                </button>
              </div>
            </>
          )}
          {done && (
            <div className="result-box">
              <div className="success-icon">✅</div>
              <strong>拆分完成！</strong>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
                文件已自动下载到本地。
              </p>
            </div>
          )}
          {processing && (
            <div className="status-box">
              <div className="spinner"></div>
              <div className="status-msg">正在拆分 PDF，请稍候…</div>
            </div>
          )}
          <AdSlot />
          <div className="safety-notice">
            🔒 所有处理在浏览器本地完成，文件不会上传到服务器。
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
