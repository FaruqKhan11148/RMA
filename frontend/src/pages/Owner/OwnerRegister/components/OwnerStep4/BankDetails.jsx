function BankDetails({
  bankHolderName,
  setBankHolderName,
  bankAccountNumber,
  setBankAccountNumber,
  confirmAccountNumber,
  setConfirmAccountNumber,
  ifscCode,
  setIfscCode,
  bankName,
  setBankName,
  upiMobileNumber,
  setUpiMobileNumber,
  upiId,
  setUpiId,
}) {
  return (
    <section className="bank_details_section">
      <div className="bank_field">
        <label htmlFor="bankHolderName">Account Holder Name</label>
        <input
          id="bankHolderName"
          type="text"
          value={bankHolderName}
          onChange={(event) => setBankHolderName(event.target.value)}
          placeholder="Enter account holder name"
          autoComplete="name"
          required
        />
      </div>

      <div className="bank_field">
        <label htmlFor="bankName">Bank Name</label>
        <input
          id="bankName"
          type="text"
          value={bankName}
          onChange={(event) => setBankName(event.target.value)}
          placeholder="e.g. State Bank of India"
          autoComplete="organization"
          required
        />
      </div>

      <div className="bank_field">
        <label htmlFor="upiMobileNumber">UPI-Linked Mobile Number</label>
        <input
          id="upiMobileNumber"
          type="tel"
          inputMode="numeric"
          value={upiMobileNumber}
          onChange={(event) =>
            setUpiMobileNumber(
              event.target.value.replace(/\D/g, '').slice(0, 10),
            )
          }
          placeholder="Enter 10-digit mobile number"
          autoComplete="tel"
          maxLength={10}
          required
        />
      </div>

      <div className="bank_field">
        <label htmlFor="upiId">UPI ID</label>
        <input
          id="upiId"
          type="text"
          value={upiId}
          onChange={(event) => setUpiId(event.target.value.trim())}
          placeholder="e.g. shopname@oksbi"
          autoComplete="off"
        />
      </div>

      <div className="bank_field">
        <label htmlFor="bankAccountNumber">Account Number</label>
        <input
          id="bankAccountNumber"
          type="text"
          inputMode="numeric"
          value={bankAccountNumber}
          onChange={(event) =>
            setBankAccountNumber(event.target.value.replace(/\D/g, ''))
          }
          placeholder="Enter bank account number"
          autoComplete="off"
          maxLength={18}
          required
        />
      </div>

      <div className="bank_field">
        <label htmlFor="confirmAccountNumber">Confirm Account Number</label>
        <input
          id="confirmAccountNumber"
          type="text"
          inputMode="numeric"
          value={confirmAccountNumber}
          onChange={(event) =>
            setConfirmAccountNumber(event.target.value.replace(/\D/g, ''))
          }
          placeholder="Re-enter bank account number"
          autoComplete="off"
          maxLength={18}
          required
        />
      </div>

      <div className="bank_field">
        <label htmlFor="ifscCode">IFSC Code</label>
        <input
          id="ifscCode"
          type="text"
          value={ifscCode}
          onChange={(event) =>
            setIfscCode(
              event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
            )
          }
          placeholder="Enter IFSC code"
          autoComplete="off"
          maxLength={11}
          required
        />
      </div>
    </section>
  );
}

export default BankDetails;
