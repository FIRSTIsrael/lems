import { redirect } from 'next/navigation';
import { apiFetch } from '../../../../lib/utils/fetch';
import { LoginForm } from './login-form';

async function checkAuthStatus() {
  try {
    const response = await apiFetch('/admin/auth/verify');
    console.log('Login page verification response:', response.status);

    if (response.ok) {
      // User is already logged in, redirect to homepage
      console.log('User is already logged in, redirecting to homepage');
      redirect('/');
    }
  } catch (error) {
    // If verification fails, continue to show login form
    console.log('Auth verification failed, showing login form');
  }
}

export default async function LoginPage() {
  await checkAuthStatus();

  const recaptchaRequired = process.env.RECAPTCHA === 'true';

  return <LoginForm recaptchaRequired={recaptchaRequired} />;
}
