'use client';
import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DropZone from '@/components/DropZone';
import AdSlot from '@/components/AdSlot';
import { formatSize, readFileAsBuffer, downloadFile } from '@/lib/pdf-utils';

export default function MergePdfPage() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const addFiles = useCallback((incoming) => {
    const pdfs = incoming.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (pdfs.length === 0) return;
    setFiles(prev => [...prev, ...pdfs]);
    setDone(false);
  }, []);

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setDone(false);
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    setFiles(prev => {
      const arr = [...prev];
      [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]];
      return arr;
    });
  };

  const moveDown = (idx) => {
    if (idx >= files.length - 1) return;
    setFiles(prev => {
      const arr = [...prev];
      [arr[idx], arr[idx+1]] = [arr[idx+1], arr[idx]];
      return arr;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) { alert('请至少选择 2 个 PDF 文件'); return; }
    setProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const buffer = await readFileAsBuffer(file);
        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(p => mergedPdf.addPage(p));
      }
      const bytes = await mergedPdf.save({ useObjectStreams: true });
      const blob = new Blob([bytes], { type: 'application/pdf' });
      downloadFile(blob, `合并文件_${Date.now()}.pdf`);
      setDone(true);
    } catch (err) {
      alert('合并出错：' + err.message);
    }
    setProcessing(false);
  };

  return (
    <div className="app-wrapper">
      <Header />
      <main className="main-content">
        <div className="tool-page">
          <div className="tool-page-header">
            <h1>🔗 PDF 合并</h1>
            <p>将多个 PDF 文件合并成一个 PDF，支持拖拽排序。</p>
          </div>
          <DropZone
            onFiles={addFiles}
            accept=".pdf"
            icon="🔗"
            text="拖拽 PDF 文件到此处，或点击选择"
            hint="支持多个 PDF，拖入后可用 ↑↓ 排序"
          />
          {files.length > 0 && (
            <>
              <div className="file-list">
                {files.map((f, idx) => (
                  <div key={idx} className="file-item">
                    <span className="name">📄 {f.name}</span>
                    <span className="size">{formatSize(f.size)}</span>
                    <span className="order-btns">
                      <button onClick={() => moveUp(idx)} disabled={idx === 0}>↑</button>
                      <button onClick={() => moveDown(idx)} disabled={idx >= files.length - 1}>↓</button>
                    </span>
                    <button className="remove" onClick={() => removeFile(idx)}>✕</button>
                  </div>
                ))}
              </div>
              <div className="btn-group">
                <button className="btn btn-primary" onClick={handleMerge} disabled={processing}>
                  {processing ? '⏳ 合并中...' : `🔗 合并 ${files.length} 个文件`}
                </button>
                <button className="btn btn-outline" onClick={() => { setFiles([]); setDone(false); }}>
                  🗑️ 清空
                </button>
              </div>
            </>
          )}
          {done && (
            <div className="result-box">
              <div className="success-icon">✅</div>
              <strong>合并完成！</strong>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
                合并文件_{Date.now()}.pdf 已下载。
              </p>
            </div>
          )}
          {processing && (
            <div className="status-box">
              <div className="spinner"></div>
              <div className="status-msg">正在合并 PDF，请稍候…</div>
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
