import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Components } from 'react-markdown'
import styles from './index.module.css'

interface MarkdownRendererProps {
  content: string
}

const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    const codeString = String(children).replace(/\n$/, '')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (match) {
      return (
        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>
            <span className={styles.codeLang}>{match[1]}</span>
          </div>
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: '0 0 8px 8px',
              fontSize: 13,
            }}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      )
    }

    return (
      <code className={styles.inlineCode} {...props}>
        {children}
      </code>
    )
  },
  a({ href, children }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  },
}

const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
}: MarkdownRendererProps) {
  return (
    <div className={styles.markdownBody}>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  )
})

export default MarkdownRenderer
