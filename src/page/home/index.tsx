import { Card, theme } from 'antd'

import { healthCheck } from '@/api'

import styles from './index.module.css'

function Index() {
  const {
    token: { blue },
  } = theme.useToken()

  return (
    <Card className={styles.welcomeCard}>
      <h1
        style={{ color: blue }}
        onClick={() => {
          healthCheck()
        }}
      >
        欢迎使用 Code Create
      </h1>
      <p>这是一个基于 React + Vite + Ant Design 的前端项目</p>
      <a href="https://github.com/Albert-MinJie-cloud">MJ</a>
    </Card>
  )
}

export default Index
