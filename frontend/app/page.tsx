import { redirect } from 'next/navigation';

// Redirect root route to public layout
export default function RootPage() {
  redirect('/');
}
