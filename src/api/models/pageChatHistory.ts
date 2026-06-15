import type { ChatHistory } from './chatHistory'

export interface PageChatHistory {
  records?: ChatHistory[]
  pageNumber?: number
  pageSize?: number
  totalPage?: number
  totalRow?: number
  optimizeCountQuery?: boolean
}
