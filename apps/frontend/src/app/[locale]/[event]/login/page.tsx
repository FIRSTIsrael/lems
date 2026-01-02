import { redirect } from 'next/navigation';
import { apiFetch } from '@lems/shared';
import { getClient } from '../../../../lib/graphql/ssr-client';
import { GET_EVENT_BY_SLUG_QUERY, EventDetails } from './graphql';
import { LoginPageContent } from './components/login-page-content';

interface LoginPageProps {
  params: Promise<{ event: string }>;
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { event: eventSlug } = await params;

  const authResult = await apiFetch('/lems/auth/verify');
  if (authResult.ok) {
    redirect(`/lems`);
  }

  let event = null;

  try {
    const client = getClient();
    const result = await client.query<{ event: EventDetails | null }>({
      query: GET_EVENT_BY_SLUG_QUERY,
      variables: { slug: eventSlug }
    });

    if (!result.data?.event) {
      throw new Error('Event not found');
    }

    event = result.data.event;

    if (!event?.isFullySetUp) {
      throw new Error('Event not fully set up');
    }
  } catch (error) {
    console.log(`GraphQL error: ${error instanceof Error ? error.message : String(error)}`);
    redirect(`/`);
  }

  const recaptchaRequired = process.env.RECAPTCHA === 'true';

  return <LoginPageContent event={event} recaptchaRequired={recaptchaRequired} />;
}
