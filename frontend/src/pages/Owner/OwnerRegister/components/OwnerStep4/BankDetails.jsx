function BankDetails({
  bankHolderName,
  setBankHolderName,
  bankAccountNumber,
  setBankAccountNumber,
  confirmAccountNumber,
  setConfirmAccountNumber,
  ifscCode,
  setIfscCode,
}) {
  return (
    <section className="bank_details_section">
      {/* ACCOUNT HOLDER */}

      <div className="bank_field">
        <label htmlFor="bankHolderName">Account Holder Name</label>

        <input
          id="bankHolderName"
          type="text"
          value={bankHolderName}
          onChange={(event) => setBankHolderName(event.target.value)}
          placeholder="Enter account holder name"
          autoComplete="name"
        />
      </div>

      {/* ACCOUNT NUMBER */}

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
        />
      </div>

      {/* CONFIRM ACCOUNT NUMBER */}

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
        />
      </div>

      {/* IFSC */}

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
        />
      </div>
    </section>
  );
}

export default BankDetails;
