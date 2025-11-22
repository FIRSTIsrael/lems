import { apiFetch } from '@lems/shared';
import { LemsUser } from '@lems/types/api/lems';
import { UserProvider } from './components/user-context';

interface LemsAuthResponse {
  ok: boolean;
  user: LemsUser;
}

export default async function LemsLayout({ children }: { children: React.ReactNode }) {
  const result = await apiFetch('/lems/auth/verify');

  if (!result.ok) {
    throw new Error('Failed to verify LEMS authentication');
  }

  const { user } = result.data as LemsAuthResponse;

  return <UserProvider value={user}>{children}</UserProvider>;
}
