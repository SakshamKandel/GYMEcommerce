/**
 * Thin red announcement band above the nav (03 §11a, master plan §4 A5).
 *
 * R9 copy gate: the free-delivery clause ships only while the backend seed
 * keeps the automatic 100%-off-shipping promotion at item_total >= Rs. 10,000
 * (confirmed seeded). Remove the last two spans if that promo is disabled.
 */
const AnnouncementBar = () => {
  return (
    <div className="bg-red text-paper" data-testid="announcement-bar">
      <p className="content-container flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center font-mono text-label-sm uppercase tracking-label">
        <span>Cash on Delivery all over Nepal</span>
        <span aria-hidden="true">✱</span>
        <span>100% Authentic</span>
        <span aria-hidden="true">✱</span>
        <span>Free delivery over Rs. 10,000</span>
      </p>
    </div>
  )
}

export default AnnouncementBar
