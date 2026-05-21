import './globals.css';

export const metadata = {
  title: 'PDF工具箱 - 免费在线PDF处理',
  description: '免费在线PDF工具，图片转PDF、PDF合并拆分、PDF压缩、PDF转图片，全部浏览器本地处理，文件不上传服务器。',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}
