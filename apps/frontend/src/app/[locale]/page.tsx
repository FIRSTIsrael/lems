import { redirect } from 'next/navigation';
import { apiFetch } from '@lems/shared';
import { HomePage } from './components/homepage/homepage';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  // Check if user is already authenticated
  const authResult = await apiFetch('/lems/auth/verify');
  if (authResult.ok) {
    // TODO: Redirect to role-specific page based on user role
    // For now, redirect to a generic dashboard or home
    redirect(`/${locale}/dashboard`);
  }

  return <HomePage />;
}
