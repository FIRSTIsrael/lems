import { redirect } from 'next/navigation';
import { apiFetch } from '@lems/shared';
import { LoginForm } from './components/login-form';
import { fetchEventBySlug } from './graphql/event.graphql';

interface LoginPageProps {
  params: Promise<{ event: string }>;
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { event: eventSlug } = await params;

  const authResult = await apiFetch('/lems/auth/verify');
  if (authResult.ok) {
    redirect(`/${eventSlug}/dashboard`);
  }

  let event = null;

  try {
    event = await fetchEventBySlug(eventSlug);
  } catch {
    redirect(`/`);
  }

  const recaptchaRequired = process.env.RECAPTCHA === 'true';

  return <LoginForm event={event} recaptchaRequired={recaptchaRequired} />;
}
