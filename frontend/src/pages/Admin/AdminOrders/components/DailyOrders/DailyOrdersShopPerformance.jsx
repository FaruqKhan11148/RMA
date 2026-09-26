function DailyOrdersShopPerformance({ shops, formatCurrency }) {
  return (
    <section className="admin-daily-section">
      <div className="admin-daily-section-header">
        <div>
          <h2>Shop Performance</h2>

          <p>Today's order and transaction performance by shop.</p>
        </div>

        <span className="admin-daily-count">{shops.length} Shops</span>
      </div>

      {shops.length === 0 ? (
        <div className="admin-daily-empty">No shop orders today.</div>
      ) : (
        <div className="admin-daily-table-wrapper">
          <table className="admin-daily-table">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Owner</th>
                <th>Orders</th>
                <th>Completed</th>
                <th>Transactions</th>
                <th>RMA Fee</th>
              </tr>
            </thead>

            <tbody>
              {shops.map((shop) => (
                <tr key={shop.shopId}>
                  <td>
                    <strong>{shop.shopName}</strong>

                    <small>{shop.shopId}</small>
                  </td>

                  <td>{shop.ownerName}</td>

                  <td>{shop.totalOrders}</td>

                  <td>{shop.completedOrders}</td>

                  <td>{formatCurrency(shop.transactionValue)}</td>

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

export default DailyOrdersShopPerformance;
