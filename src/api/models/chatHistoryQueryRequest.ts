export interface ChatHistoryQueryRequest {
  pageNum?: number
  pageSize?: number
  sortField?: string
  sortOrder?: string
  id?: number
  message?: string
  messageType?: string
  appId?: number
  userId?: number
  lastCreateTime?: string
}
