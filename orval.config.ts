// orval.config.ts
import { defineConfig } from 'orval'

// export default defineConfig({
//   // 你的 API 配置名（可以自定义）
//   api: {
//     // 👇 这里填你的 OpenAPI 3.0 文档地址
//     // 例如：http://localhost:8123/api/v3/api-docs
//     input: {
//       target: 'http://localhost:8123/api/v3/api-docs',
//       // 如果你本地有 Swagger JSON 文件，也可以填：
//       // target: './swagger.json',
//     },
//     output: {
//       // 👇 生成请求代码的主文件
//       target: './src/api/CodeCreate/api.ts',
//       // 👇 生成 TS 类型的文件
//       schemas: './src/api/CodeCreate/models',
//       // 👇 启用格式化
//       formatter: 'prettier',
//       // 👇 清理旧生成的文件
//       clean: true,
//       // 自定义
//       // 👇 核心配置：Custom HTTP client implementation
//       override: {
//         mutator: {
//           path: './src/utils/request.ts',
//           name: 'MyAxios',
//         },
//       },
//     },
//   },
// })

export default defineConfig({
  CodeCreate: {
    output: {
      mode: 'tags-split',
      target: './src/api/api.ts',
      schemas: './src/api/model',
      formatter: 'prettier',
      // clean: true,
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
