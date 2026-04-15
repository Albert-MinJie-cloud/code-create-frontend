import { createBrowserRouter } from 'react-router-dom'
import BasicLayout from '@/layouts'
import Home from '@/page/home'
import About from '@/page/about'
import Dashboard from '@/page/dashboard'

const router = createBrowserRouter([
  {
    path: '/',
    element: <BasicLayout />,
    children: [
      // {
      //   index: true,
      //   element: <Home />,
      // },
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
        element: <Dashboard />,
      },
      // 添加更多页面路由，它们都会使用 BasicLayout
    ],
  },
])

export default router
