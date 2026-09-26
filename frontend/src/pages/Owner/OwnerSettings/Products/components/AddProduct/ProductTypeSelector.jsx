function ProductTypeSelector({
  productType,
  setProductType,
  setError,
  setSuccessMessage,
}) {
  return (
    <div className="product-type-selector">
      <button
        type="button"
        className={
          productType === 'catalogue' ? 'type-option active' : 'type-option'
        }
        onClick={() => {
          setProductType('catalogue');
          setError('');
          setSuccessMessage('');
        }}
      >
        <span className="type-option-title">RMA Catalogue</span>
        <span className="type-option-description">
          Add an official RMA product
        </span>
      </button>

      <button
        type="button"
        className={
          productType === 'custom' ? 'type-option active' : 'type-option'
        }
        onClick={() => {
          setProductType('custom');
          setError('');
          setSuccessMessage('');
        }}
      >
        <span className="type-option-title">Custom Product</span>
        <span className="type-option-description">Add your own product</span>
      </button>
    </div>
  );
}

export default ProductTypeSelector;
