import { Card, theme } from 'antd'

import styles from './index.module.css'

function Index() {
  const {
    token: { blue },
  } = theme.useToken()

  return (
    <Card className={styles.welcomeCard}>
      <h1 style={{ color: blue }}>欢迎使用 Code Create</h1>
      <p>这是一个基于 React + Vite + Ant Design 的前端项目</p>
    </Card>
  )
}

export default Index
