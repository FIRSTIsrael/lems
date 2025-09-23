import { redirect } from 'next/navigation';
import { apiFetch } from '@lems/shared';
import { LoginForm } from './login-form';

async function checkAuthStatus() {
  const result = await apiFetch('/admin/auth/verify');
  if (result.ok) {
    // Redirect to the home page if already authenticated
    // otherwise, the login form will be displayed
    redirect('/');
  }
}

export default async function LoginPage() {
  await checkAuthStatus();

  const recaptchaRequired = process.env.RECAPTCHA === 'true';

  return <LoginForm recaptchaRequired={recaptchaRequired} />;
}
