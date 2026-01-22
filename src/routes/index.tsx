import { createFileRoute } from '@tanstack/react-router'
import SidebarLayout from '@/components/sidebar-layout'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarLayout>
      <h1 className="text-2xl font-bold">Welcome to Dashboard</h1>
      <p className="text-muted-foreground">
        This is your home page.
      </p>
    </SidebarLayout>
  )
}


