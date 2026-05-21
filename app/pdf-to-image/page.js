'use client';
import { useState, useCallback, useRef } from 'react';
// pdfjs-dist will be dynamically imported client-side only
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DropZone from '@/components/DropZone';
import AdSlot from '@/components/AdSlot';
import { formatSize, readFileAsBuffer, downloadFile } from '@/lib/pdf-utils';

export default function PdfToImagePage() {
  const [files, setFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [format, setFormat] = useState('png');
  const [scale, setScale] = useState(2);
  const canvasRef = useRef(null);

  const addFiles = useCallback((incoming) => {
    const pdfs = incoming.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (pdfs.length === 0) return;
    setFiles(prev => [...prev, ...pdfs]);
    setImages([]);
    setDone(false);
  }, []);

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setImages([]);
    setDone(false);
  };

  const getPdfJs = async () => {
    const mod = await import('pdfjs-dist');
    // 使用本地 worker 文件，不依赖 CDN
    if (typeof window !== 'undefined') {
      mod.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }
    return mod;
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setImages([]);
    try {
      const pdfjsLib = await getPdfJs();
      const allImages = [];
      for (const file of files) {
        const buffer = await readFileAsBuffer(file);
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;
          const mime = format === 'png' ? 'image/png' : 'image/jpeg';
          const ext = format === 'png' ? 'png' : 'jpg';
          const quality = format === 'jpeg' ? 0.92 : undefined;
          const dataUrl = canvas.toDataURL(mime, quality);
          allImages.push({ dataUrl, page: i, name: file.name.replace('.pdf', ''), ext });
        }
      }
      setImages(allImages);
      setDone(true);
    } catch (err) {
      alert('处理出错：' + err.message);
    }
    setProcessing(false);
  };

  const downloadAll = () => {
    images.forEach(img => {
      const blob = dataURLToBlob(img.dataUrl);
      downloadFile(blob, `${img.name}_第${img.page}页.${img.ext}`);
    });
  };

  const downloadSingle = (img) => {
    const blob = dataURLToBlob(img.dataUrl);
    downloadFile(blob, `${img.name}_第${img.page}页.${img.ext}`);
  };

  return (
    <div className="app-wrapper">
      <Header />
      <main className="main-content">
        <div className="tool-page">
          <div className="tool-page-header">
            <h1>📸 PDF 转图片</h1>
            <p>将 PDF 每一页导出为高清图片，支持 PNG 和 JPEG 格式。</p>
          </div>
          <DropZone
            onFiles={addFiles}
            accept=".pdf"
            icon="📄"
            text="拖拽 PDF 文件到此处，或点击选择"
            hint="支持 PDF 文件，可一次选多个"
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
              输出格式：
              <select value={format} onChange={e => setFormat(e.target.value)}>
                <option value="png">PNG（无损）</option>
                <option value="jpeg">JPEG（更小）</option>
              </select>
            </label>
            <label>
              清晰度：
              <select value={scale} onChange={e => setScale(Number(e.target.value))}>
                <option value="1">标准（72dpi）</option>
                <option value="2">高清（144dpi）</option>
                <option value="3">超清（216dpi）</option>
              </select>
            </label>
          </div>
          {files.length > 0 && (
            <div className="btn-group">
              <button className="btn btn-primary" onClick={handleConvert} disabled={processing}>
                {processing ? '⏳ 转换中...' : '📸 开始转换'}
              </button>
              <button className="btn btn-outline" onClick={() => { setFiles([]); setImages([]); setDone(false); }}>
                🗑️ 清空
              </button>
            </div>
          )}
          {processing && (
            <div className="status-box">
              <div className="spinner"></div>
              <div className="status-msg">正在渲染页面，请稍候…</div>
            </div>
          )}
          {done && images.length > 0 && (
            <>
              <div className="result-box">
                <div className="success-icon">✅</div>
                <strong>转换完成！共 {images.length} 页</strong>
                <div className="btn-group">
                  <button className="btn btn-success" onClick={downloadAll}>📥 全部下载</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
                {images.map((img, idx) => (
                  <div key={idx} style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => downloadSingle(img)}>
                    <img src={img.dataUrl} alt={`第${img.page}页`}
                      style={{ width: '100%', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      第{img.page}页 — 点击下载
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <AdSlot />
          <div className="safety-notice">
            🔒 文件只在你的浏览器中处理，不会上传到服务器。
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function dataURLToBlob(dataUrl) {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bytes = atob(parts[1]);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
