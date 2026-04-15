import { Suspense } from 'react'
import { Spin } from 'antd'

interface LoadingFallbackProps {
  tip?: string
}

export const LoadingFallback = ({
  tip = '加载中...',
}: LoadingFallbackProps) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
    }}
  >
    <Spin size="large" tip={tip} />
  </div>
)

interface WithSuspenseProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const WithSuspense = ({ children, fallback }: WithSuspenseProps) => (
  <Suspense fallback={fallback || <LoadingFallback />}>{children}</Suspense>
)
