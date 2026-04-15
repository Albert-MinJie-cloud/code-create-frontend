import { Card, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import styles from './index.module.css'

function NotFound() {
  const navigate = useNavigate()

  return (
    <Card className={styles.notFoundCard}>
      <h1>404</h1>
      <p>抱歉，您访问的页面不存在</p>
      <Button type="primary" onClick={() => navigate('/')}>
        返回首页
      </Button>
    </Card>
  )
}

export default NotFound
