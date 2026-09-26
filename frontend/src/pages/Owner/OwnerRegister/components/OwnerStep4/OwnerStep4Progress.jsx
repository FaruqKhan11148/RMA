function OwnerStep4Progress() {
  return (
    <div className="step_progress">
      <div className="progress_item completed">
        <span>1</span>
        <p>Owner</p>
      </div>

      <div className="progress_line completed"></div>

      <div className="progress_item completed">
        <span>2</span>
        <p>Shop</p>
      </div>

      <div className="progress_line completed"></div>

      <div className="progress_item completed">
        <span>3</span>
        <p>Products</p>
      </div>

      <div className="progress_line active"></div>

      <div className="progress_item active">
        <span>4</span>
        <p>Payment</p>
      </div>
    </div>
  );
}

export default OwnerStep4Progress;
