import { redirect } from 'next/navigation';
import { apiFetch } from '@lems/shared';
import { LoginForm } from './login-form';

interface LoginPageProps {
  params: Promise<{
    locale: string;
    event: string;
  }>;
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale, event: eventSlug } = await params;

  // Check if user is already authenticated
  const authResult = await apiFetch('/lems/auth/verify');
  if (authResult.ok) {
    redirect(`/${locale}/${eventSlug}/dashboard`);
  }

  // Validate event exists
  const eventResult = await apiFetch(`/lems/events/${eventSlug}`);
  if (!eventResult.ok) {
    redirect(`/${locale}`);
  }

  const recaptchaRequired = process.env.RECAPTCHA === 'true';

  return <LoginForm eventSlug={eventSlug} recaptchaRequired={recaptchaRequired} />;
}
