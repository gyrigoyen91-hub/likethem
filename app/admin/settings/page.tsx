import { requireAdmin } from '@/lib/admin/requireAdmin'
import AdminPageShell from '@/components/admin/AdminPageShell'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  await requireAdmin()

  return (
    <AdminPageShell
      title="Platform Settings"
      subtitle="Configure platform settings, features, and integrations"
    >
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <h3 className="text-xl font-medium text-gray-900 mb-2">Coming Soon</h3>
        <p className="text-gray-600">
          Platform settings are under development. Check back soon!
        </p>
      </div>
    </AdminPageShell>
  )
}
