import { Layout, theme } from 'antd'

import styles from './index.module.css'

const { Footer } = Layout

const GlobalFooter = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  return (
    <Footer className={styles.footer} style={{ background: colorBgContainer }}>
      <span className={styles.copyright}>CopyRight@Albert.min97@gmail.com</span>
    </Footer>
  )
}

export default GlobalFooter
