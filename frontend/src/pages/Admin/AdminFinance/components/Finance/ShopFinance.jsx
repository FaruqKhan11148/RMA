function ShopFinance({ shopFinance, formatMoney }) {
  return (
    <div className="finance-section">
      <div className="finance-section-header">
        <div>
          <h2>Shop-wise Finance</h2>
          <p>Revenue and settlement breakdown for each registered shop.</p>
        </div>
      </div>

      {shopFinance.length === 0 ? (
        <div className="finance-empty">No shop finance data available.</div>
      ) : (
        <div className="finance-table-wrapper">
          <table className="finance-table">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Orders</th>
                <th>Gross Value</th>
                <th>RMA Fee</th>
                <th>Owner Settlement</th>
                <th>Paid</th>
                <th>Pending</th>
              </tr>
            </thead>

            <tbody>
              {shopFinance.map((shop) => (
                <tr key={shop.shopId}>
                  <td>
                    <div className="finance-shop-name">
                      <strong>{shop.shopName}</strong>
                      <span>{shop.shopId}</span>
                    </div>
                  </td>

                  <td>{shop.orders}</td>

                  <td>{formatMoney(shop.grossValue)}</td>

                  <td className="finance-rma-value">
                    {formatMoney(shop.rmaRevenue)}
                  </td>

                  <td className="finance-owner-value">
                    {formatMoney(shop.ownerSettlement)}
                  </td>

                  <td>{formatMoney(shop.paidValue)}</td>

                  <td>{formatMoney(shop.pendingValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ShopFinance;
