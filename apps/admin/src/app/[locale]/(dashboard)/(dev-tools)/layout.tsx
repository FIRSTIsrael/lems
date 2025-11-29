'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '../components/session-context';

export default function DevToolsLayout({ children }: { children: React.ReactNode }) {
  const { permissions } = useSession();
  const router = useRouter();

  if (!permissions.includes('DEV_TOOLS')) {
    router.push('/');
    return null;
  }

  return <>{children}</>;
}
