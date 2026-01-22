import { Link } from '@tanstack/react-router'
import SidebarLayout from './sidebar'
import { Button } from './ui/button'

export default function NotFound() {
  return (
    <SidebarLayout>
      <div className="flex flex-col items-center justify-center min-h-full p-6 text-center">
        <div className="flex flex-col items-center max-w-md mx-auto space-y-4">
          <h1 className="text-7xl font-bold text-muted-foreground/50">404</h1>
          <h2 className="text-2xl font-semibold tracking-tight">Page not found</h2>
          <p className="text-muted-foreground">
            Sorry, we couldn't find the page you're looking for.
          </p>
          <Button asChild className="mt-4">
            <Link to="/">Go back home</Link>
          </Button>
        </div>
      </div>
    </SidebarLayout>
  )
}
