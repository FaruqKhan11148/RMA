function MonthlyShopRevenue({ shops, onViewShop, formatCurrency }) {
  return (
    <section className="admin_finance_section">
      <div className="admin_finance_section_header">
        <div>
          <h2>Shop-wise Revenue</h2>

          <p>Financial performance of each shop for the selected month.</p>
        </div>
      </div>

      {shops.length === 0 ? (
        <div className="admin_empty_state">
          No shop transactions found for this month.
        </div>
      ) : (
        <div className="admin_shop_finance_table_wrapper">
          <table className="admin_shop_finance_table">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Owner</th>
                <th>Total Orders</th>
                <th>Completed</th>
                <th>Transaction Value</th>
                <th>Completed Revenue</th>
                <th>RMA Fee</th>
              </tr>
            </thead>

            <tbody>
              {shops.map((shop) => (
                <tr key={shop.shopId}>
                  <td>
                    <button
                      type="button"
                      className="admin_shop_id_button"
                      onClick={() => onViewShop(shop.shopId)}
                    >
                      <strong>{shop.shopName}</strong>
                      <span>{shop.shopId}</span>
                    </button>
                  </td>

                  <td>{shop.ownerName}</td>

                  <td>{shop.totalOrders}</td>

                  <td>{shop.completedOrders}</td>

                  <td>{formatCurrency(shop.transactionValue)}</td>

                  <td>{formatCurrency(shop.completedTransactionValue)}</td>

                  <td>{formatCurrency(shop.rmaFees)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default MonthlyShopRevenue;
