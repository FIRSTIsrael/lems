import { redirect } from 'next/navigation';
import { apiFetch } from '@lems/shared';
import { LoginForm } from './components/login-form';

interface LoginPageProps {
  params: Promise<{
    locale: string;
    event: string;
  }>;
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { event: eventSlug } = await params;

  const authResult = await apiFetch('/lems/auth/verify');
  if (authResult.ok) {
    redirect(`/${eventSlug}/dashboard`);
  }

  const eventResult = await apiFetch(`/lems/events/${eventSlug}`);
  if (!eventResult.ok) {
    redirect(`/`);
  }

  const recaptchaRequired = process.env.RECAPTCHA === 'true';

  return <LoginForm eventSlug={eventSlug} recaptchaRequired={recaptchaRequired} />;
}
