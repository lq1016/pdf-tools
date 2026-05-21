export default function AdSlot({ label = '广告位' }) {
  return (
    <div className="ad-banner">
      <span>📢 {label} — 此处可放置百度联盟 / Google AdSense 广告</span>
    </div>
  );
}
