import { useCallback } from 'react';

import { updateSettlement, startPayUOnboarding, verifyPayU } from './ownersApi';

import { getSettlementActionKey, getSettlementStatus } from './ownersHelpers';

function useOwnerActions({
  navigate,
  setOwners,
  setSettlements,
  setSelectedOwner,
  setSettlementsError,
  setSettlementActionLoading,
  setPayuOnboardingLoading,
  setPayuVerificationLoading,
}) {
  const handleSettlementAction = useCallback(
    async (ownerId, action) => {
      const actionKey = getSettlementActionKey(action, ownerId);

      try {
        setSettlementActionLoading(actionKey);
        setSettlementsError('');

        await updateSettlement(ownerId, action);

        const updatedStatus = getSettlementStatus(action);

        setSettlements((currentSettlements) =>
          currentSettlements.filter(
            (settlement) => settlement.ownerId !== ownerId,
          ),
        );

        setOwners((currentOwners) =>
          currentOwners.map((owner) => {
            if (owner._id !== ownerId) {
              return owner;
            }

            return {
              ...owner,
              payment: {
                ...owner.payment,
                rmaApprovalStatus: updatedStatus,
                rmaApprovedAt:
                  action === 'approve'
                    ? new Date().toISOString()
                    : owner.payment?.rmaApprovedAt,
                rmaRejectedAt:
                  action === 'reject'
                    ? new Date().toISOString()
                    : owner.payment?.rmaRejectedAt,
              },
            };
          }),
        );

        setSelectedOwner((currentOwner) => {
          if (!currentOwner || currentOwner._id !== ownerId) {
            return currentOwner;
          }

          return {
            ...currentOwner,
            payment: {
              ...currentOwner.payment,
              rmaApprovalStatus: updatedStatus,
              rmaApprovedAt:
                action === 'approve'
                  ? new Date().toISOString()
                  : currentOwner.payment?.rmaApprovedAt,
              rmaRejectedAt:
                action === 'reject'
                  ? new Date().toISOString()
                  : currentOwner.payment?.rmaRejectedAt,
            },
          };
        });
      } catch (err) {
        if (err.status === 401) {
          navigate('/admin/login', {
            replace: true,
          });
          return;
        }

        setSettlementsError(err.message || 'Failed to update settlement');
      } finally {
        setSettlementActionLoading(null);
      }
    },
    [
      navigate,
      setOwners,
      setSettlements,
      setSelectedOwner,
      setSettlementsError,
      setSettlementActionLoading,
    ],
  );

  const handlePayUOnboarding = useCallback(
    async (ownerId) => {
      try {
        setPayuOnboardingLoading(ownerId);
        setSettlementsError('');

        const data = await startPayUOnboarding(ownerId);

        const onboarding = data.onboarding;

        setOwners((currentOwners) =>
          currentOwners.map((owner) => {
            if (owner._id !== ownerId) {
              return owner;
            }

            return {
              ...owner,
              payment: {
                ...owner.payment,
                onboardingStatus: onboarding?.onboardingStatus || 'PENDING',
                bankStatus: onboarding?.bankStatus || 'PENDING',
                kycStatus: onboarding?.kycStatus || 'PENDING',
                payuChildMerchantId: onboarding?.payuChildMerchantId || null,
                payuChildMerchantUuid:
                  onboarding?.payuChildMerchantUuid || null,
              },
            };
          }),
        );

        setSelectedOwner((currentOwner) => {
          if (!currentOwner || currentOwner._id !== ownerId) {
            return currentOwner;
          }

          return {
            ...currentOwner,
            payment: {
              ...currentOwner.payment,
              onboardingStatus: onboarding?.onboardingStatus || 'PENDING',
              bankStatus: onboarding?.bankStatus || 'PENDING',
              kycStatus: onboarding?.kycStatus || 'PENDING',
              payuChildMerchantId: onboarding?.payuChildMerchantId || null,
              payuChildMerchantUuid: onboarding?.payuChildMerchantUuid || null,
            },
          };
        });
      } catch (err) {
        if (err.status === 401) {
          navigate('/admin/login', {
            replace: true,
          });
          return;
        }

        setSettlementsError(err.message || 'Failed to start PayU onboarding');
      } finally {
        setPayuOnboardingLoading(null);
      }
    },
    [
      navigate,
      setOwners,
      setSelectedOwner,
      setSettlementsError,
      setPayuOnboardingLoading,
    ],
  );

  const handlePayUVerification = useCallback(
    async (ownerId, type) => {
      const loadingKey = `${type}-${ownerId}`;

      try {
        setPayuVerificationLoading(loadingKey);
        setSettlementsError('');

        const data = await verifyPayU(ownerId, type);

        const verification = data.verification || data.onboarding;

        setOwners((currentOwners) =>
          currentOwners.map((owner) => {
            if (owner._id !== ownerId) {
              return owner;
            }

            return {
              ...owner,
              payment: {
                ...owner.payment,
                bankStatus:
                  verification?.bankStatus || owner.payment?.bankStatus,
                kycStatus: verification?.kycStatus || owner.payment?.kycStatus,
                onboardingStatus:
                  verification?.onboardingStatus ||
                  owner.payment?.onboardingStatus,
                onboardedAt:
                  verification?.onboardedAt || owner.payment?.onboardedAt,
              },
            };
          }),
        );

        setSelectedOwner((currentOwner) => {
          if (!currentOwner || currentOwner._id !== ownerId) {
            return currentOwner;
          }

          return {
            ...currentOwner,
            payment: {
              ...currentOwner.payment,
              bankStatus:
                verification?.bankStatus || currentOwner.payment?.bankStatus,
              kycStatus:
                verification?.kycStatus || currentOwner.payment?.kycStatus,
              onboardingStatus:
                verification?.onboardingStatus ||
                currentOwner.payment?.onboardingStatus,
              onboardedAt:
                verification?.onboardedAt || currentOwner.payment?.onboardedAt,
            },
          };
        });
      } catch (err) {
        if (err.status === 401) {
          navigate('/admin/login', {
            replace: true,
          });
          return;
        }

        setSettlementsError(err.message || 'PayU verification failed');
      } finally {
        setPayuVerificationLoading(null);
      }
    },
    [
      navigate,
      setOwners,
      setSelectedOwner,
      setSettlementsError,
      setPayuVerificationLoading,
    ],
  );

  return {
    handleSettlementAction,
    handlePayUOnboarding,
    handlePayUVerification,
  };
}

export default useOwnerActions;
