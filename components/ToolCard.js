import Link from 'next/link';

const bgColors = {
  blue: '#eef2ff',
  green: '#dcfce7',
  orange: '#ffedd5',
  purple: '#f3e8ff',
  pink: '#fce7f3',
  teal: '#ccfbf1',
  red: '#fee2e2',
  indigo: '#e0e7ff',
};

export default function ToolCard({ icon, title, desc, href, tag, tagLabel, color = 'blue' }) {
  return (
    <Link href={href} className="tool-card">
      <div className="tool-card-icon" style={{ background: bgColors[color] || bgColors.blue }}>
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
      {tag && <span className={tag === 'free' ? 'tag free' : 'tag'}>{tagLabel || tag}</span>}
    </Link>
  );
}
