'use client';
import { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DropZone from '@/components/DropZone';
import AdSlot from '@/components/AdSlot';
import { formatSize, readFileAsBuffer, downloadFile } from '@/lib/pdf-utils';

export default function ExtractPagesPage() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [range, setRange] = useState('');

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

  const handleExtract = async () => {
    if (files.length === 0) return;
    if (!range.trim()) { alert('请输入页码范围'); return; }
    setProcessing(true);
    try {
      for (const file of files) {
        const buffer = await readFileAsBuffer(file);
        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const total = pdf.getPageCount();
        const baseName = file.name.replace('.pdf', '');

        // 解析范围：支持 1,3,5-7,10-end
        const pageIndices = [];
        const parts = range.split(',').map(s => s.trim());
        for (const part of parts) {
          const rangeMatch = part.match(/^(\d+)-(\d+)$/);
          const singleMatch = part.match(/^(\d+)$/);
          const endMatch = part.match(/^(\d+)-end$/i);

          if (endMatch) {
            const start = parseInt(endMatch[1]);
            for (let i = start; i <= total; i++) pageIndices.push(i - 1);
          } else if (rangeMatch) {
            const start = Math.max(1, parseInt(rangeMatch[1]));
            const end = Math.min(total, parseInt(rangeMatch[2]));
            for (let i = start; i <= end; i++) pageIndices.push(i - 1);
          } else if (singleMatch) {
            const p = parseInt(singleMatch[1]);
            if (p >= 1 && p <= total) pageIndices.push(p - 1);
          }
        }

        const uniquePages = [...new Set(pageIndices)].sort((a, b) => a - b);
        if (uniquePages.length === 0) { alert('没有有效的页码'); continue; }

        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(pdf, uniquePages);
        pages.forEach(p => newPdf.addPage(p));
        const bytes = await newPdf.save();
        const blob = new Blob([bytes], { type: 'application/pdf' });
        downloadFile(blob, `${baseName}_提取页.pdf`);
      }
      setDone(true);
    } catch (err) {
      alert('提取出错：' + err.message);
    }
    setProcessing(false);
  };

  return (
    <div className="app-wrapper">
      <Header />
      <main className="main-content">
        <div className="tool-page">
          <div className="tool-page-header">
            <h1>📑 提取页面</h1>
            <p>从 PDF 中提取指定页面，保存为新文件。支持多种页码范围写法。</p>
          </div>
          <DropZone
            onFiles={addFiles}
            accept=".pdf"
            icon="📑"
            text="拖拽 PDF 文件到此处，或点击选择"
            hint="支持单个或多个 PDF"
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
            <>
              <div className="options-row">
                <label>
                  页码范围：
                  <input
                    type="text"
                    value={range}
                    onChange={e => setRange(e.target.value)}
                    placeholder="示例：1,3,5-7,10-end"
                    style={{ width: '240px', fontFamily: 'monospace' }}
                  />
                </label>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  支持格式：单个页(1)、范围(3-7)、结束(8-end)，逗号分隔
                </span>
              </div>
              <div className="btn-group">
                <button className="btn btn-primary" onClick={handleExtract} disabled={processing}>
                  {processing ? '⏳ 提取中...' : '📑 提取页面'}
                </button>
                <button className="btn btn-outline" onClick={() => { setFiles([]); setDone(false); setRange(''); }}>
                  🗑️ 清空
                </button>
              </div>
            </>
          )}
          {done && (
            <div className="result-box">
              <div className="success-icon">✅</div>
              <strong>提取完成！</strong>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
                文件已自动下载。
              </p>
            </div>
          )}
          {processing && (
            <div className="status-box">
              <div className="spinner"></div>
              <div className="status-msg">正在提取页面，请稍候…</div>
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
