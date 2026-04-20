import classNames from 'classnames'
import { CodeOutlined } from '@ant-design/icons'
import { useThemeStore } from '@/store/themeStore'

import styles from './index.module.css'

interface LogoProps {
  size?: 'xsmall' | 'small' | 'medium' | 'large'
}

export const Logo = ({ size = 'medium' }: LogoProps) => {
  const themeStore = useThemeStore(state => state.themeStore)

  // 判断是否为暗色主题
  const isDark = themeStore === 'dark'

  return (
    <div
      className={classNames(
        styles.logo,
        styles[size],
        isDark ? styles.darklogo : styles.lightlogo
      )}
    >
      <CodeOutlined
        className={classNames(
          styles.logoIcon,
          isDark ? styles.darklogoIcon : styles.lightlogoIcon
        )}
      />
    </div>
  )
}
