'use client';
import { useState, useCallback } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DropZone from '@/components/DropZone';
import AdSlot from '@/components/AdSlot';
import { formatSize, readFileAsBuffer, downloadFile } from '@/lib/pdf-utils';

export default function RotatePdfPage() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [angle, setAngle] = useState(90);
  const [scope, setScope] = useState('all'); // 'all' | 'odd' | 'even'

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

  const handleRotate = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      for (const file of files) {
        const buffer = await readFileAsBuffer(file);
        const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const indices = pdf.getPageIndices();
        for (const idx of indices) {
          let shouldRotate = false;
          if (scope === 'all') shouldRotate = true;
          else if (scope === 'odd') shouldRotate = idx % 2 === 0;
          else if (scope === 'even') shouldRotate = idx % 2 === 1;
          if (shouldRotate) {
            const page = pdf.getPage(idx);
            page.setRotation(degrees(angle));
          }
        }
        const bytes = await pdf.save();
        const base = file.name.replace('.pdf', '');
        const blob = new Blob([bytes], { type: 'application/pdf' });
        downloadFile(blob, `${base}_旋转_${angle}度.pdf`);
      }
      setDone(true);
    } catch (err) {
      alert('旋转出错：' + err.message);
    }
    setProcessing(false);
  };

  return (
    <div className="app-wrapper">
      <Header />
      <main className="main-content">
        <div className="tool-page">
          <div className="tool-page-header">
            <h1>🔄 PDF 旋转</h1>
            <p>旋转 PDF 页面方向，支持顺时针/逆时针 90 度、180 度旋转。</p>
          </div>
          <DropZone
            onFiles={addFiles}
            accept=".pdf"
            icon="🔄"
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
          <div className="options-row">
            <label>
              旋转角度：
              <select value={angle} onChange={e => setAngle(Number(e.target.value))}>
                <option value="90">顺时针 90°</option>
                <option value="-90">逆时针 90°</option>
                <option value="180">旋转 180°</option>
              </select>
            </label>
            <label>
              应用范围：
              <select value={scope} onChange={e => setScope(e.target.value)}>
                <option value="all">全部页面</option>
                <option value="odd">仅奇数页</option>
                <option value="even">仅偶数页</option>
              </select>
            </label>
          </div>
          {files.length > 0 && (
            <div className="btn-group">
              <button className="btn btn-primary" onClick={handleRotate} disabled={processing}>
                {processing ? '⏳ 旋转中...' : '🔄 开始旋转'}
              </button>
              <button className="btn btn-outline" onClick={() => { setFiles([]); setDone(false); }}>
                🗑️ 清空
              </button>
            </div>
          )}
          {done && (
            <div className="result-box">
              <div className="success-icon">✅</div>
              <strong>旋转完成！</strong>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
                文件已自动下载。
              </p>
            </div>
          )}
          {processing && (
            <div className="status-box">
              <div className="spinner"></div>
              <div className="status-msg">正在旋转页面，请稍候…</div>
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
