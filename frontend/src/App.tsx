import {
  RouterProvider,
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import SubmitComplaint from './pages/SubmitComplaint';
import ComplaintsDashboard from './pages/ComplaintsDashboard';
import ComplaintDetail from './pages/ComplaintDetail';
import OfficersManagement from './pages/OfficersManagement';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <Outlet />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  beforeLoad: () => {
    const stored = localStorage.getItem('ps_sadar_session');
    if (!stored) {
      throw redirect({ to: '/login' });
    }
    try {
      const sess = JSON.parse(stored);
      if (sess.role === 'admin') {
        throw redirect({ to: '/dashboard' });
      } else {
        throw redirect({ to: '/submit-complaint' });
      }
    } catch (e) {
      if (e instanceof Response || (e as { _isRedirect?: boolean })?._isRedirect) throw e;
      throw redirect({ to: '/login' });
    }
  },
  component: () => null,
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute requireAdmin>
      <ComplaintsDashboard />
    </ProtectedRoute>
  ),
});

const submitComplaintRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/submit-complaint',
  component: () => (
    <ProtectedRoute>
      <SubmitComplaint />
    </ProtectedRoute>
  ),
});

const complaintDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/complaint/$complaintNumber',
  component: () => (
    <ProtectedRoute>
      <ComplaintDetail />
    </ProtectedRoute>
  ),
});

const officersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/officers',
  component: () => (
    <ProtectedRoute requireAdmin>
      <OfficersManagement />
    </ProtectedRoute>
  ),
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  layoutRoute.addChildren([
    indexRoute,
    dashboardRoute,
    submitComplaintRoute,
    complaintDetailRoute,
    officersRoute,
  ]),
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
