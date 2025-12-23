import { requireAdmin } from '@/lib/admin/requireAdmin'
import { prisma } from '@/lib/prisma'
import AdminPageShell from '@/components/admin/AdminPageShell'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface UserDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  await requireAdmin()
  
  const { id } = await params
  
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      curatorProfile: {
        select: {
          id: true,
          storeName: true,
          slug: true,
          isPublic: true,
          isEditorsPick: true,
        },
      },
      sellerApplication: {
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  return (
    <AdminPageShell
      title="User Details"
      subtitle={`Viewing details for ${user.email}`}
    >
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Email</h3>
            <p className="text-lg text-gray-900">{user.email}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Full Name</h3>
            <p className="text-lg text-gray-900">{user.fullName || '—'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Role</h3>
            <p className="text-lg text-gray-900">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                user.role === 'CURATOR' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {user.role}
              </span>
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Provider</h3>
            <p className="text-lg text-gray-900">{user.provider || '—'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Email Verified</h3>
            <p className="text-lg text-gray-900">
              {user.emailVerified ? `Yes (${new Date(user.emailVerified).toLocaleDateString()})` : 'No'}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Created At</h3>
            <p className="text-lg text-gray-900">
              {new Date(user.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {user.curatorProfile && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Curator Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Store Name</h4>
                <p className="text-gray-900">{user.curatorProfile.storeName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Slug</h4>
                <p className="text-gray-900">{user.curatorProfile.slug}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Public</h4>
                <p className="text-gray-900">{user.curatorProfile.isPublic ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Editor's Pick</h4>
                <p className="text-gray-900">{user.curatorProfile.isEditorsPick ? 'Yes' : 'No'}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href={`/admin/curators/${user.curatorProfile.id}`}
                className="text-blue-600 hover:text-blue-700"
              >
                View Curator Profile →
              </Link>
            </div>
          </div>
        )}

        {user.sellerApplication && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Seller Application</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                <p className="text-gray-900">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.sellerApplication.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    user.sellerApplication.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.sellerApplication.status}
                  </span>
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Applied At</h4>
                <p className="text-gray-900">
                  {new Date(user.sellerApplication.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href={`/admin/curators/applications/${user.sellerApplication.id}`}
                className="text-blue-600 hover:text-blue-700"
              >
                View Application →
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/admin/users"
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Users
          </Link>
        </div>
      </div>
    </AdminPageShell>
  )
}
