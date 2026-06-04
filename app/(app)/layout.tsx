import { Sidebar } from '@/components/layout/sidebar'
import { NavMobile } from '@/components/layout/nav-mobile'
import { DEMO_PROFILE, DEMO_COUPLE } from '@/lib/demo-data'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar profile={DEMO_PROFILE} couple={DEMO_COUPLE} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>
      <NavMobile />
    </div>
  )
}
