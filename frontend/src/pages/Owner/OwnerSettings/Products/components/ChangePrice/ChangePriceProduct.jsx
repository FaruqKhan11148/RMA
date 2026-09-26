function ChangePriceProduct({ product }) {
  return (
    <div className="change-price-product">
      <div className="change-price-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <span>
            {product.category === 'Chicken'
              ? '🍗'
              : product.category === 'Mutton'
                ? '🥩'
                : product.category === 'Fish'
                  ? '🐟'
                  : product.category === 'Seafood'
                    ? '🦐'
                    : '🥩'}
          </span>
        )}
      </div>

      <div className="change-price-product-info">
        <h2>{product.name}</h2>

        <p>
          {product.category} • {product.unit}
        </p>

        <div className="change-price-current">
          <span>Current Price</span>

          <strong>
            ₹{product.price} / {product.unit}
          </strong>
        </div>
      </div>
    </div>
  );
}

export default ChangePriceProduct;
