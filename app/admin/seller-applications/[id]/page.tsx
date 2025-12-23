import { requireAdmin } from '@/lib/admin/requireAdmin';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ApplicationActions from '../../curators/applications/ApplicationActions';
import AdminPageShell from '@/components/admin/AdminPageShell';

export const dynamic = 'force-dynamic';

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  // Get application details
  const application = await prisma.sellerApplication.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          avatar: true,
          role: true,
        },
      },
    },
  });

  if (!application) {
    notFound();
  }

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

  return (
    <AdminPageShell
      title="Application Details"
      subtitle={`Reviewing application from ${application.fullName}`}
    >

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{application.fullName}</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                {application.status}
              </span>
            </div>
          </div>

          <div className="px-6 py-4 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Applicant Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-sm text-gray-900">{application.user.email}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Current Role:</span>
                  <span className="ml-2 text-sm text-gray-900">{application.user.role}</span>
                </div>
                {application.socialLinks && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Social Links:</span>
                    <span className="ml-2 text-sm text-gray-900">{application.socialLinks}</span>
                  </div>
                )}
                {application.audienceBand && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Audience Size:</span>
                    <span className="ml-2 text-sm text-gray-900">{application.audienceBand}</span>
                  </div>
                )}
              </div>
            </div>

            {application.reason && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Reason / Motivation</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{application.reason}</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Application Details</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Application ID:</span>
                  <span className="ml-2 text-sm text-gray-900 font-mono">{application.id}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Submitted:</span>
                  <span className="ml-2 text-sm text-gray-900">
                    {new Date(application.createdAt).toLocaleString()}
                  </span>
                </div>
                {application.reviewedAt && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Reviewed:</span>
                    <span className="ml-2 text-sm text-gray-900">
                      {new Date(application.reviewedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                {application.decisionNote && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Decision Note:</span>
                    <span className="ml-2 text-sm text-gray-900">{application.decisionNote}</span>
                  </div>
                )}
              </div>
            </div>

            {application.status === 'PENDING' && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Actions</h3>
                <ApplicationActions applicationId={application.id} status={application.status} />
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8">
          <Link
            href="/admin/curators/applications"
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Applications
          </Link>
        </div>
      </AdminPageShell>
  );
}
