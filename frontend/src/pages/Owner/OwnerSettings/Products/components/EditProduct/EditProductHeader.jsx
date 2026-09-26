function EditProductHeader({ navigate, product }) {
  return (
    <>
      <button
        type="button"
        className="edit-product-back"
        onClick={() => navigate('/owner/settings/products')}
      >
        ← Products
      </button>

      <div className="edit-product-header">
        <div>
          <h1>Edit Product</h1>

          <p>
            {product.isCustom
              ? 'Update your custom product details.'
              : 'Manage the selling price and availability.'}
          </p>
        </div>

        <span
          className={`edit-product-type ${
            product.isCustom ? 'custom' : 'catalogue'
          }`}
        >
          {product.isCustom ? 'Custom Product' : 'RMA Catalogue'}
        </span>
      </div>
    </>
  );
}

export default EditProductHeader;
