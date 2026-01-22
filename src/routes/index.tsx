import { createFileRoute } from '@tanstack/react-router'
import SidebarLayout from '@/components/sidebar'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarLayout>
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Welcome to Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          This is your home page with the sidebar navigation.
        </p>
      </main>
    </SidebarLayout>
  )
}
