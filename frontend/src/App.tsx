import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, redirect } from '@tanstack/react-router';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import ComplaintsDashboard from './pages/ComplaintsDashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import ComplaintDetail from './pages/ComplaintDetail';
import OfficersManagement from './pages/OfficersManagement';
import ChangePassword from './pages/ChangePassword';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: () => (
    <ProtectedRoute adminOnly>
      <ComplaintsDashboard />
    </ProtectedRoute>
  ),
});

const submitComplaintRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/submit-complaint',
  component: SubmitComplaint,
});

const complaintDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/complaint/$complaintNumber',
  component: ComplaintDetail,
});

const officersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/officers',
  component: () => (
    <ProtectedRoute adminOnly>
      <OfficersManagement />
    </ProtectedRoute>
  ),
});

const changePasswordRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/change-password',
  component: () => (
    <ProtectedRoute adminOnly>
      <ChangePassword />
    </ProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  layoutRoute.addChildren([
    dashboardRoute,
    submitComplaintRoute,
    complaintDetailRoute,
    officersRoute,
    changePasswordRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
