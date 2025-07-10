import { RecaptchaResponse } from '../../types/auth';

export const getRecaptchaResponse = (captchaToken: string): Promise<RecaptchaResponse> => {
  return fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
    { method: 'POST' }
  ).then(res => res.json());
};
