function OwnerStep3Progress() {
  return (
    <div className="registration_progress">
      <div className="progress_item completed">
        <span>✓</span>
        <p>Owner</p>
      </div>

      <div className="progress_line active"></div>

      <div className="progress_item completed">
        <span>✓</span>
        <p>Shop</p>
      </div>

      <div className="progress_line active"></div>

      <div className="progress_item active">
        <span>3</span>
        <p>Products</p>
      </div>

      <div className="progress_line"></div>

      <div className="progress_item">
        <span>4</span>
        <p>Payment</p>
      </div>
    </div>
  );
}

export default OwnerStep3Progress;
