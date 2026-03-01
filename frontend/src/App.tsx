import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import Layout from './components/Layout';
import SubmitComplaint from './pages/SubmitComplaint';
import ComplaintsDashboard from './pages/ComplaintsDashboard';
import ComplaintDetail from './pages/ComplaintDetail';
import OfficersManagement from './pages/OfficersManagement';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <Toaster richColors position="top-right" />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/dashboard' });
  },
  component: () => null,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: ComplaintsDashboard,
});

const submitComplaintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/submit-complaint',
  component: SubmitComplaint,
});

const complaintDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/complaint/$complaintNumber',
  component: ComplaintDetail,
});

const officersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/officers',
  component: OfficersManagement,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  submitComplaintRoute,
  complaintDetailRoute,
  officersRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
