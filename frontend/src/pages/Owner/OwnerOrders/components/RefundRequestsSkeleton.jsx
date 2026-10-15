import './RefundRequestsSkeleton.css';

function RefundRequestsSkeleton() {
  return (
    <div
      className="owner_refund_skeleton"
      aria-label="Loading refund requests"
      aria-busy="true"
    >
      {[1, 2].map((item) => (
        <div className="owner_refund_skeleton_card" key={item}>
          <div className="owner_refund_skeleton_header">
            <span className="owner_refund_skeleton_line refund_skeleton_title" />
            <span className="owner_refund_skeleton_badge" />
          </div>

          <span className="owner_refund_skeleton_line refund_skeleton_text" />
          <span className="owner_refund_skeleton_line refund_skeleton_amount" />
          <span className="owner_refund_skeleton_line refund_skeleton_date" />
        </div>
      ))}
    </div>
  );
}

export default RefundRequestsSkeleton;
