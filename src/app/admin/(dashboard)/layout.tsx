import AdminShell from '@/components/Admin/AdminShell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
