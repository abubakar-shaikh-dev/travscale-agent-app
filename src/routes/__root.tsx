import { Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <>
      <header>Travscale</header>
      <Outlet />
    </>
  ),
})
