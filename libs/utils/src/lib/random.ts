const alphaNumericChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const specialChars = '!@#$%^&*()';

export const randomAlphanumericString = (length: number) => {
  return getRandomString(alphaNumericChars, length);
};

export const randomString = (length: number) => {
  return getRandomString(alphaNumericChars + specialChars, length);
};

const getRandomString = (characters: string, length: number) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};
