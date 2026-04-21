import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import BasicLayout from '@/layouts'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  WithSuspenseGlobal,
  WithSuspenseLocal,
} from '@/components/WithSuspense'

const Home = WithSuspenseLocal(lazy(() => import('@/page/home')))
const About = WithSuspenseLocal(lazy(() => import('@/page/about')))
const Dashboard = WithSuspenseLocal(lazy(() => import('@/page/dashboard')))
const AppChat = WithSuspenseLocal(lazy(() => import('@/page/appChat')))

const Login = WithSuspenseGlobal(lazy(() => import('@/page/login')))
const Register = WithSuspenseGlobal(lazy(() => import('@/page/register')))
const UserManage = WithSuspenseGlobal(lazy(() => import('@/page/userManage')))
const AppManage = WithSuspenseGlobal(lazy(() => import('@/page/appManage')))
const AppEdit = WithSuspenseGlobal(lazy(() => import('@/page/appEdit')))
const Forbidden = WithSuspenseGlobal(lazy(() => import('@/page/403')))
const NotFound = WithSuspenseGlobal(lazy(() => import('@/page/404')))

const router = createBrowserRouter([
  {
    path: '/',
    element: <BasicLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/userManage',
        element: (
          <ProtectedRoute requiredRole="admin">
            <UserManage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/appManage',
        element: (
          <ProtectedRoute requiredRole="admin">
            <AppManage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/app/edit/:appId',
        element: (
          <ProtectedRoute>
            <AppEdit />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/app/chat/:appId',
    element: (
      <ProtectedRoute>
        <AppChat />
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/403',
    element: <Forbidden />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router
