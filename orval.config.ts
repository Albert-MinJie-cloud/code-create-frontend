// orval.config.ts
import { defineConfig } from 'orval'

// 配置说明：
// - input.target: OpenAPI 3.0 文档地址（Swagger JSON）
// - output.target: 生成的 API 请求代码文件路径（tags-split 模式下为目录）
// - output.schemas: 生成的 TypeScript 类型文件目录
// - output.mode: 'tags-split' 按 API 标签分割文件
// - output.formatter: 使用 Prettier 格式化生成的代码
// - output.clean: 清理旧的生成文件
// - override.mutator: 自定义 HTTP 客户端（使用 Axios）

export default defineConfig({
  CodeCreate: {
    output: {
      mode: 'tags',
      target: './src/api/endpoints',
      schemas: './src/api/models',
      formatter: 'prettier',
      clean: true,
      override: {
        mutator: {
          path: './src/utils/request.ts',
          name: 'MyAxios',
        },
      },
    },
    input: {
      target: 'http://localhost:8123/api/v3/api-docs',
    },
  },
})
