import { requireAdmin } from '@/lib/admin/requireAdmin'
import AdminPageShell from '@/components/admin/AdminPageShell'

export const dynamic = 'force-dynamic'

export default async function SecurityPage() {
  await requireAdmin()

  return (
    <AdminPageShell
      title="Security"
      subtitle="Manage security settings, access controls, and permissions"
    >
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <h3 className="text-xl font-medium text-gray-900 mb-2">Coming Soon</h3>
        <p className="text-gray-600">
          Security settings are under development. Check back soon!
        </p>
      </div>
    </AdminPageShell>
  )
}
