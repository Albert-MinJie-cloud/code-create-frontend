import { MyAxios } from '@/utils/request'

export const serveStaticResource = (deployKey: string) => {
  return MyAxios<Blob>({ url: `/static/${deployKey}/**`, method: 'GET' })
}
export type ServeStaticResourceResult = NonNullable<
  Awaited<ReturnType<typeof serveStaticResource>>
>
