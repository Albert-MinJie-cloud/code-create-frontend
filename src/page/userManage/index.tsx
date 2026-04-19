import { Card } from 'antd'

import styles from './index.module.css'

function Index() {
  return (
    <Card className={styles.welcomeCard}>
      <h1>about</h1>
      <p>这是一个基于 React + Vite + Ant Design 的前端项目</p>
    </Card>
  )
}

export default Index
