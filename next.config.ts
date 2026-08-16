import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  trailingSlash: true,
  compiler: {
    // 启用 styled-components 的 SSR 支持
    // 让 Next.js 在编译时识别 styled-components 的 class 名生成逻辑
    styledComponents: true,
  },
}

export default nextConfig
