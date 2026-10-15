function SkeletonLine({ className = '', width }) {
  return (
    <span
      className={`rma_skeleton_line ${className}`}
      style={width ? { width } : undefined}
      aria-hidden="true"
    />
  );
}

function ReferralDetailsSkeleton() {
  return (
    <div
      className="referral_details_page referral_details_skeleton"
      aria-label="Loading referral details"
      aria-busy="true"
    >
      <SkeletonLine className="referral_skeleton_back" width="125px" />

      <div className="referral_page_header">
        <SkeletonLine width="100px" />
        <SkeletonLine className="rma_skeleton_title" width="250px" />
        <SkeletonLine width="100%" />
        <SkeletonLine width="72%" />
      </div>

      <section className="referral_code_card referral_code_skeleton_card">
        <div>
          <SkeletonLine width="145px" />
          <SkeletonLine className="referral_skeleton_code" width="190px" />
        </div>

        <SkeletonLine className="referral_skeleton_copy" width="110px" />
      </section>

      <div className="referral_summary_grid">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="referral_summary_card" key={index}>
            <SkeletonLine width="110px" />
            <SkeletonLine className="referral_skeleton_value" width="100px" />
            <SkeletonLine width="90px" />
          </div>
        ))}
      </div>

      <section className="referrals_section">
        <div className="referrals_section_header">
          <SkeletonLine width="100px" />
          <SkeletonLine className="rma_skeleton_title" width="180px" />
          <SkeletonLine width="100%" />
          <SkeletonLine width="75%" />
        </div>

        {Array.from({ length: 2 }, (_, index) => (
          <div className="referral_progress_card" key={index}>
            <div className="referral_progress_header">
              <div className="referral_skeleton_shop">
                <SkeletonLine width="180px" />
                <SkeletonLine width="125px" />
              </div>

              <SkeletonLine
                className="referral_skeleton_status"
                width="130px"
              />
            </div>

            {Array.from({ length: 2 }, (_, progressIndex) => (
              <div className="referral_progress_item" key={progressIndex}>
                <div className="referral_progress_label">
                  <SkeletonLine width="130px" />
                  <SkeletonLine width="65px" />
                </div>

                <SkeletonLine className="rma_skeleton_bar" width="100%" />
              </div>
            ))}

            <div className="referral_partner_status">
              {Array.from({ length: 2 }, (_, statusIndex) => (
                <div key={statusIndex}>
                  <SkeletonLine width="95px" />
                  <SkeletonLine width="70px" />
                </div>
              ))}
            </div>

            <div className="referral_earnings_grid">
              {Array.from({ length: 3 }, (_, earningIndex) => (
                <div className="referral_earning_box" key={earningIndex}>
                  <SkeletonLine width="100%" />
                  <SkeletonLine width="80px" />
                </div>
              ))}
            </div>

            <div className="referral_period_box">
              <SkeletonLine width="140px" />
              <SkeletonLine width="180px" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default ReferralDetailsSkeleton;
