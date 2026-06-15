import type { PageChatHistory } from './pageChatHistory'

export interface BaseResponsePageChatHistory {
  code?: number
  data?: PageChatHistory
  message?: string
}
