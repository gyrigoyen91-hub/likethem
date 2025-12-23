import { requireAdmin } from '@/lib/admin/requireAdmin';
import { prisma } from '@/lib/prisma';
import AdminPageShell from '@/components/admin/AdminPageShell';
import Link from 'next/link';
import ApplicationActions from './ApplicationActions';

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage() {
  await requireAdmin();

  // Get all applications, PENDING first
  const applications = await prisma.sellerApplication.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      },
    },
    orderBy: [
      {
        status: 'asc', // PENDING comes first alphabetically
      },
      {
        createdAt: 'desc',
      },
    ],
  });

  // Sort to ensure PENDING is truly first
  const sortedApplications = [...applications].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'APPROVED':
        return '✅';
      case 'REJECTED':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <AdminPageShell
      title="Curator Applications"
      subtitle="Review and manage curator applications"
    >

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Audience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {app.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {app.user.email}
                        </div>
                        {app.socialLinks && (
                          <div className="text-xs text-gray-400 mt-1">
                            {app.socialLinks}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.audienceBand || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {getStatusEmoji(app.status)} {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-1">
                        <Link
                          href={`/admin/seller-applications/${app.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm"
                        >
                          View Details
                        </Link>
                        <ApplicationActions applicationId={app.id} status={app.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedApplications.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No applications found.</p>
            </div>
          )}
        </div>

      <div className="mt-8">
        <Link
          href="/admin"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          ← Back to Admin Dashboard
        </Link>
      </div>
    </AdminPageShell>
  );
}
