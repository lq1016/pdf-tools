'use client';
import { useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DropZone from '@/components/DropZone';
import AdSlot from '@/components/AdSlot';
import { formatSize, readFileAsDataURL, downloadFile } from '@/lib/pdf-utils';

export default function ImageToPdfPage() {
  const [images, setImages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const addFiles = useCallback((files) => {
    const imgs = files.filter(f => f.type.startsWith('image/'));
    if (imgs.length === 0) return;
    Promise.all(imgs.map(f => readFileAsDataURL(f).then(url => ({
      name: f.name,
      size: f.size,
      url,
      data: null,
    })))).then(items => {
      setImages(prev => [...prev, ...items]);
      setDone(false);
    });
  }, []);

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setDone(false);
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    setImages(prev => {
      const arr = [...prev];
      [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]];
      return arr;
    });
  };

  const moveDown = (idx) => {
    if (idx >= images.length - 1) return;
    setImages(prev => {
      const arr = [...prev];
      [arr[idx], arr[idx+1]] = [arr[idx+1], arr[idx]];
      return arr;
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setProcessing(true);
    try {
      const pdf = new jsPDF();
      let first = true;
      for (const img of images) {
        const imgEl = await new Promise((resolve) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.src = img.url;
        });
        const pw = pdf.internal.pageSize.getWidth();
        const ph = pdf.internal.pageSize.getHeight();
        const iw = imgEl.width;
        const ih = imgEl.height;
        const ratio = Math.min(pw / iw, ph / ih);
        const dw = iw * ratio;
        const dh = ih * ratio;
        const x = (pw - dw) / 2;
        const y = (ph - dh) / 2;

        if (!first) pdf.addPage();
        // 尝试 WebP 优先，否则 JPEG
        const format = img.url.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        pdf.addImage(img.url, format, x, y, dw, dh, undefined, 'FAST');
        first = false;
      }
      const blob = pdf.output('blob');
      downloadFile(blob, `图片合辑_${Date.now()}.pdf`);
      setDone(true);
    } catch (err) {
      alert('处理出错：' + err.message);
    }
    setProcessing(false);
  };

  return (
    <div className="app-wrapper">
      <Header />
      <main className="main-content">
        <div className="tool-page">
          <div className="tool-page-header">
            <h1>🖼️ 图片转 PDF</h1>
            <p>将多张图片合并成一个 PDF 文件，支持 PNG、JPG、WebP 格式，可自由排序。</p>
          </div>
          <DropZone
            onFiles={addFiles}
            accept=".png,.jpg,.jpeg,.webp,.gif,.bmp"
            icon="🖼️"
            text="拖拽图片到此处，或点击选择"
            hint="支持 PNG / JPG / WebP / GIF，可多选"
          />
          {images.length > 0 && (
            <>
              <div className="file-list">
                {images.map((img, idx) => (
                  <div key={idx} className="file-item">
                    <span className="name">📷 {img.name}</span>
                    <span className="size">{formatSize(img.size)}</span>
                    <span className="order-btns">
                      <button onClick={() => moveUp(idx)} disabled={idx === 0}>↑</button>
                      <button onClick={() => moveDown(idx)} disabled={idx >= images.length - 1}>↓</button>
                    </span>
                    <button className="remove" onClick={() => removeImage(idx)}>✕</button>
                  </div>
                ))}
              </div>
              <div className="btn-group">
                <button className="btn btn-primary" onClick={handleConvert} disabled={processing}>
                  {processing ? '⏳ 生成中...' : `📄 生成 PDF（共 ${images.length} 张）`}
                </button>
                <button className="btn btn-outline" onClick={() => { setImages([]); setDone(false); }}>
                  🗑️ 清空
                </button>
              </div>
            </>
          )}
          {done && (
            <div className="result-box">
              <div className="success-icon">✅</div>
              <strong>PDF 已生成并下载</strong>
              <div className="result-name">图片合辑_{Date.now()}.pdf</div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
                如果想重新调整顺序或添加图片，修改后再次点击生成即可。
              </p>
            </div>
          )}
          {processing && (
            <div className="status-box">
              <div className="spinner"></div>
              <div className="status-msg">正在生成 PDF，请稍候…</div>
            </div>
          )}
          <AdSlot />
          <div className="safety-notice">
            🔒 图片只在你的浏览器中处理，不会上传到任何服务器。
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
