import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  // 未登录，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 需要特定角色权限，但是没有对应权限
  if (requiredRole && user?.userRole !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
