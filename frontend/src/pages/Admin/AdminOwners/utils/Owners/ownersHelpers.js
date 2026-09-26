export function filterOwners(owners, search) {
  const searchValue = search.trim().toLowerCase();

  if (!searchValue) {
    return owners;
  }

  return owners.filter((owner) => {
    return (
      owner.shopId?.toLowerCase().includes(searchValue) ||
      owner.ownerName?.toLowerCase().includes(searchValue) ||
      owner.shopName?.toLowerCase().includes(searchValue) ||
      owner.phone?.toLowerCase().includes(searchValue) ||
      owner.email?.toLowerCase().includes(searchValue)
    );
  });
}

export function getSettlementActionKey(action, ownerId) {
  return `${action}-${ownerId}`;
}

export function getSettlementStatus(action) {
  return action === 'approve' ? 'APPROVED' : 'REJECTED';
}

export function getPayUVerificationEndpoint(type) {
  if (type === 'bank') {
    return 'bank/verify';
  }

  if (type === 'kyc') {
    return 'kyc/verify';
  }

  if (type === 'complete') {
    return 'onboarding/complete';
  }

  return '';
}
