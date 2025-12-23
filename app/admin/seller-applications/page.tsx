import { redirect } from 'next/navigation';

// Redirect to the existing applications page
export default function SellerApplicationsPage() {
  redirect('/admin/curators/applications');
}
