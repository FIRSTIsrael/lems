const waitForRecaptcha = () => new Promise<void>(grecaptcha.ready);

export const createRecaptchaToken = () =>
  waitForRecaptcha().then(() =>
    grecaptcha.execute(`${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`, { action: 'submit' })
  );
