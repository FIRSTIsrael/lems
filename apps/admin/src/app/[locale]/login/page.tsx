import { redirect } from 'next/navigation';
import { apiFetch } from '@lems/admin/lib/fetch';
import { LoginForm } from './login-form';

async function checkAuthStatus() {
  try {
    const { response } = await apiFetch('/admin/auth/verify');
    if (response.ok) {
      // User is already logged in, redirect to homepage
      redirect('/');
    }
  } catch {
    // Do nothing, login required
  }
}

export default async function LoginPage() {
  await checkAuthStatus();

  const recaptchaRequired = process.env.RECAPTCHA === 'true';

  return <LoginForm recaptchaRequired={recaptchaRequired} />;
}
