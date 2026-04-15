import { Suspense, type LazyExoticComponent, type ComponentType } from 'react'
import { LoadingFallback } from '@/components/LoadingFallback'

// 包装懒加载组件的高阶组件
export const WithSuspense = <P extends object>(
  Component: LazyExoticComponent<ComponentType<P>>
) => {
  const WrappedComponent = (props: P) => (
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  )

  return WrappedComponent
}
