import { Logo } from '@/components/Logo'

import styles from './index.module.css'

interface LoadingFallbackProps {
  fullPage?: boolean
  tip?: string
}

export const LoadingFallback = ({
  fullPage = false,
  tip = '加载中...',
}: LoadingFallbackProps) => {
  return (
    <div
      className={fullPage ? styles.loadingFullPage : styles.loadingInContainer}
    >
      <div className={styles.loadingContent}>
        <Logo />
        <div className={styles.tip}>{tip}</div>
      </div>
    </div>
  )
}
