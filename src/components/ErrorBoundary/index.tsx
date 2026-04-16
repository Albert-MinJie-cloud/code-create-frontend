import { Component, type ReactNode } from 'react'
import { Button, Result } from 'antd'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 可以在这里上报错误到日志服务
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="页面出错了"
          subTitle={
            import.meta.env.DEV
              ? this.state.error?.message
              : '抱歉，页面遇到了一些问题，请稍后重试'
          }
          extra={
            <>
              <Button type="primary" onClick={this.handleReset}>
                重新加载
              </Button>
              <Button onClick={() => (window.location.href = '/')}>
                返回首页
              </Button>
            </>
          }
        />
      )
    }

    return this.props.children
  }
}
