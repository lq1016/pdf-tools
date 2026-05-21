import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import AdSlot from '@/components/AdSlot';

const tools = [
  { icon: '🖼️', title: '图片转PDF', desc: '将多张图片合并成一个PDF文件，支持PNG/JPG/WebP，可自由排序。', href: '/image-to-pdf', tag: 'free', tagLabel: '免费', color: 'blue' },
  { icon: '📸', title: 'PDF转图片', desc: '将PDF的每一页导出为高清PNG/JPG图片，按页下载或打包下载。', href: '/pdf-to-image', tag: 'free', tagLabel: '免费', color: 'green' },
  { icon: '🔗', title: 'PDF合并', desc: '将多个PDF文件合并成一个PDF，自由拖动排序。', href: '/merge-pdf', tag: 'free', tagLabel: '免费', color: 'purple' },
  { icon: '✂️', title: 'PDF拆分', desc: '按页拆分PDF，选择指定页面提取为新文件。', href: '/split-pdf', tag: 'free', tagLabel: '免费', color: 'orange' },
  { icon: '🔄', title: 'PDF旋转', desc: '旋转PDF页面方向，支持单页旋转或全部旋转。', href: '/rotate-pdf', tag: 'free', tagLabel: '免费', color: 'teal' },
  { icon: '🗜️', title: 'PDF压缩', desc: '压缩PDF文件体积，减小文件大小，便于分享和存储。', href: '/compress-pdf', tag: 'free', tagLabel: '免费', color: 'pink' },
  { icon: '📑', title: '提取页面', desc: '从PDF中提取指定页码范围，保存为新文件。', href: '/extract-pages', tag: 'free', tagLabel: '免费', color: 'indigo' },
];

export default function HomePage() {
  return (
    <div className="app-wrapper">
      <Header />
      <main className="main-content">
        <div className="hero">
          <h1>📄 <span>免费在线 PDF 工具箱</span></h1>
          <p>所有工具在浏览器本地处理，文件不上传服务器，安全放心。</p>
        </div>
        <AdSlot />
        <div className="tool-grid">
          {tools.map(t => (
            <ToolCard key={t.href} {...t} />
          ))}
        </div>
        <div className="safety-notice">
          🔒 所有文件均在本地浏览器中处理，不会上传到任何服务器。处理完成后文件不会留存，隐私安全有保障。
        </div>
      </main>
      <Footer />
    </div>
  );
}
