'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/', label: '首页' },
  { href: '/image-to-pdf', label: '图片转PDF' },
  { href: '/merge-pdf', label: '合并PDF' },
  { href: '/split-pdf', label: '拆分PDF' },
  { href: '/compress-pdf', label: '压缩PDF' },
];

export default function Header() {
  const path = usePathname();
  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="header-logo">
          <span>📄</span> PDF工具箱
        </Link>
        <nav className="header-nav">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={path === item.href ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
