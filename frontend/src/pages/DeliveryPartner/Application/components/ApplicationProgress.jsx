function ApplicationProgress({ application }) {
  const sections = [
    {
      key: 'profile',
      title: 'Personal Details',
      completed:
        Boolean(application?.profile?.dateOfBirth) &&
        Boolean(application?.profile?.profilePhotoUrl),
    },

    {
      key: 'address',
      title: 'Address',
      completed:
        Boolean(application?.address?.addressLine) &&
        Boolean(application?.address?.city) &&
        Boolean(application?.address?.state) &&
        Boolean(application?.address?.pincode),
    },

    {
      key: 'kyc',
      title: 'KYC',
      completed:
        Boolean(application?.kyc?.documentType) &&
        Boolean(application?.kyc?.documentNumber) &&
        Boolean(application?.kyc?.frontImageUrl) &&
        Boolean(application?.kyc?.backImageUrl) &&
        Boolean(application?.kyc?.selfieImageUrl),
    },

    {
      key: 'drivingLicence',
      title: 'Driving Licence',
      completed:
        Boolean(application?.drivingLicence?.number) &&
        Boolean(application?.drivingLicence?.frontImageUrl) &&
        Boolean(application?.drivingLicence?.backImageUrl) &&
        Boolean(application?.drivingLicence?.expiryDate),
    },

    {
      key: 'vehicle',
      title: 'Vehicle',
      completed:
        Boolean(application?.vehicle?.type) &&
        Boolean(application?.vehicle?.registrationNumber) &&
        Boolean(application?.vehicle?.rcImageUrl),
    },

    {
      key: 'bankAccount',
      title: 'Bank Account',
      completed:
        Boolean(application?.bankAccount?.accountHolderName) &&
        Boolean(application?.bankAccount?.accountNumber) &&
        Boolean(application?.bankAccount?.ifsc) &&
        Boolean(application?.bankAccount?.bankName) &&
        Boolean(application?.bankAccount?.proofImageUrl),
    },
  ];

  const completedCount = sections.filter((section) => section.completed).length;

  const progress =
    sections.length === 0
      ? 0
      : Math.round((completedCount / sections.length) * 100);

  return (
    <section className="delivery_application_progress">
      <div className="delivery_application_progress_top">
        <div>
          <strong>Application Progress</strong>

          <span>
            {completedCount} of {sections.length} sections completed
          </span>
        </div>

        <strong>{progress}%</strong>
      </div>

      <div className="delivery_application_progress_bar">
        <div
          className="delivery_application_progress_fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
}

export default ApplicationProgress;
