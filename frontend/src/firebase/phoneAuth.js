import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

import auth from './auth';

export const setupRecaptcha = (containerId) => {
  if (window.recaptchaVerifier) {
    return window.recaptchaVerifier;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('RMA: reCAPTCHA verified.');
    },
    'expired-callback': () => {
      console.log('RMA: reCAPTCHA expired.');
    },
  });

  return window.recaptchaVerifier;
};

export const sendPhoneOtp = async (phoneNumber, containerId) => {
  const appVerifier = setupRecaptcha(containerId);

  const confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    appVerifier,
  );

  window.rmaConfirmationResult = confirmationResult;

  return confirmationResult;
};

export const verifyPhoneOtp = async (verificationCode) => {
  if (!window.rmaConfirmationResult) {
    throw new Error('OTP session has expired. Please request a new OTP.');
  }

  const result = await window.rmaConfirmationResult.confirm(verificationCode);

  return result.user;
};

export const clearPhoneAuth = () => {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }

  window.rmaConfirmationResult = null;
};
