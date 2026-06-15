import type {
  BaseResponsePageChatHistory,
  ChatHistoryQueryRequest,
  ListAppChatHistoryParams,
} from '../models'

import { MyAxios } from '@/utils/request'

export const listAllChatHistoryByPageForAdmin = (
  chatHistoryQueryRequest: ChatHistoryQueryRequest
) => {
  return MyAxios<BaseResponsePageChatHistory>({
    url: `/chatHistory/admin/list/page/vo`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: chatHistoryQueryRequest,
  })
}
export const listAppChatHistory = (
  appId: number,
  params?: ListAppChatHistoryParams
) => {
  return MyAxios<BaseResponsePageChatHistory>({
    url: `/chatHistory/app/${appId}`,
    method: 'GET',
    params,
  })
}
export type ListAllChatHistoryByPageForAdminResult = NonNullable<
  Awaited<ReturnType<typeof listAllChatHistoryByPageForAdmin>>
>
export type ListAppChatHistoryResult = NonNullable<
  Awaited<ReturnType<typeof listAppChatHistory>>
>
