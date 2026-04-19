/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import BasicLayout from '@/layouts'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  WithSuspenseGlobal,
  WithSuspenseLocal,
} from '@/components/WithSuspense'

// 懒加载页面组件
const Home = WithSuspenseLocal(lazy(() => import('@/page/home')))
const About = WithSuspenseLocal(lazy(() => import('@/page/about')))
const Dashboard = WithSuspenseLocal(lazy(() => import('@/page/dashboard')))

const Login = WithSuspenseGlobal(lazy(() => import('@/page/login')))
const Register = WithSuspenseGlobal(lazy(() => import('@/page/register')))
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
      // 可以添加需要特定角色的路由
      // 需要登录才能访问
      // {
      //   path: 'admin',
      //   element: (
      //     <ProtectedRoute requiredRole="admin">
      //       <AdminPage />
      //     </ProtectedRoute>
      //   ),
      // },
    ],
  },
  // 登录页面（不使用 BasicLayout）
  {
    path: '/login',
    element: <Login />,
  },
  // 注册页面（不使用 BasicLayout）
  {
    path: '/register',
    element: <Register />,
  },
  // 403 页面
  {
    path: '/403',
    element: <Forbidden />,
  },
  // 404 页面
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router
