import { defineConfig } from 'astro/config';

// 纯静态网站配置 - 部署到 Cloudflare Pages
export default defineConfig({
  output: 'static',
});
