'use client';
import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DropZone from '@/components/DropZone';
import AdSlot from '@/components/AdSlot';
import { formatSize, readFileAsBuffer, downloadFile } from '@/lib/pdf-utils';

export default function CompressPdfPage() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState([]);

  const addFiles = useCallback((incoming) => {
    const pdfs = incoming.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (pdfs.length === 0) return;
    setFiles(prev => [...prev, ...pdfs]);
    setDone(false);
    setResults([]);
  }, []);

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setDone(false);
    setResults([]);
  };

  const handleCompress = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setResults([]);
    try {
      const res = [];
      for (const file of files) {
        const buffer = await readFileAsBuffer(file);
        const originalSize = buffer.byteLength;

        // 重新保存，自动优化内部结构
        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const bytes = await pdf.save({ useObjectStreams: true });
        const compressedSize = bytes.byteLength;
        const ratio = originalSize > 0 ? ((1 - compressedSize / originalSize) * 100).toFixed(1) : 0;

        const base = file.name.replace('.pdf', '');
        const blob = new Blob([bytes], { type: 'application/pdf' });
        downloadFile(blob, `${base}_压缩后.pdf`);

        res.push({
          name: file.name,
          original: originalSize,
          compressed: compressedSize,
          ratio,
        });
      }
      setResults(res);
      setDone(true);
    } catch (err) {
      alert('压缩出错：' + err.message);
    }
    setProcessing(false);
  };

  return (
    <div className="app-wrapper">
      <Header />
      <main className="main-content">
        <div className="tool-page">
          <div className="tool-page-header">
            <h1>🗜️ PDF 压缩</h1>
            <p>压缩 PDF 文件体积，优化内部结构，减小文件大小。</p>
          </div>
          <DropZone
            onFiles={addFiles}
            accept=".pdf"
            icon="🗜️"
            text="拖拽 PDF 文件到此处，或点击选择"
            hint="支持单个或多个 PDF 文件"
          />
          {files.length > 0 && (
            <div className="file-list">
              {files.map((f, idx) => (
                <div key={idx} className="file-item">
                  <span className="name">📄 {f.name}</span>
                  <span className="size">{formatSize(f.size)}</span>
                  <button className="remove" onClick={() => removeFile(idx)}>✕</button>
                </div>
              ))}
            </div>
          )}
          {files.length > 0 && (
            <div className="btn-group">
              <button className="btn btn-primary" onClick={handleCompress} disabled={processing}>
                {processing ? '⏳ 压缩中...' : '🗜️ 开始压缩'}
              </button>
              <button className="btn btn-outline" onClick={() => { setFiles([]); setDone(false); setResults([]); }}>
                🗑️ 清空
              </button>
            </div>
          )}
          {processing && (
            <div className="status-box">
              <div className="spinner"></div>
              <div className="status-msg">正在压缩 PDF，请稍候…</div>
            </div>
          )}
          {done && results.length > 0 && (
            <div className="result-box">
              <div className="success-icon">✅</div>
              <strong>压缩完成！</strong>
              <div style={{ marginTop: '0.75rem', textAlign: 'left' }}>
                {results.map((r, i) => (
                  <div key={i} style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '6px', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                    <strong>{r.name}</strong><br />
                    压缩前：{formatSize(r.original)} → 压缩后：{formatSize(r.compressed)}
                    <span style={{ color: r.ratio > 0 ? '#16a34a' : '#94a3b8', marginLeft: '0.5rem' }}>
                      {r.ratio > 0 ? `（缩小 ${r.ratio}%）` : '（无明显变化）'}
                    </span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.75rem' }}>
                💡 对于含大量图片的 PDF，建议使用专业的压缩工具可以获得更好的效果。
              </p>
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
