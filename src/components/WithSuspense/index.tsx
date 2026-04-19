import { Suspense, type LazyExoticComponent, type ComponentType } from 'react'
import { LoadingFallback } from '@/components/LoadingFallback'

// 包装懒加载组件的高阶组件
export const WithSuspenseGlobal = <P extends object>(
  Component: LazyExoticComponent<ComponentType<P>>
) => {
  const WrappedComponent = (props: P) => (
    <Suspense fallback={<LoadingFallback fullPage />}>
      <Component {...props} />
    </Suspense>
  )

  return WrappedComponent
}

// 包装懒加载组件的高阶组件
export const WithSuspenseLocal = <P extends object>(
  Component: LazyExoticComponent<ComponentType<P>>
) => {
  const WrappedComponent = (props: P) => (
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  )

  return WrappedComponent
}
