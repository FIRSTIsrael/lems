import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function LemsPage() {
  const headersList = await headers();
  const userRole = headersList.get('x-user-role');

  if (userRole) {
    // Redirect to the role-specific page
    redirect(`/lems/${userRole}`);
  }

  // If no role is found, redirect to homepage
  // (this shouldn't happen because middleware should have caught it)
  redirect('/');
}
