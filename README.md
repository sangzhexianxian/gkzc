# 公考资料网 - Astro + Cloudflare 版本

基于 Astro 框架重构的公考资料网站，使用 Cloudflare Pages 部署，无需备案。

## 技术栈

- **前端框架**: Astro 4.x
- **部署平台**: Cloudflare Pages
- **API**: Cloudflare Workers
- **数据存储**: Cloudflare KV
- **样式**: 纯 CSS（响应式）

## 项目结构

```
astro-gkzc/
├── functions/           # Cloudflare Workers API
│   └── api/
│       ├── webhook.js  # 扣子Webhook接收
│       ├── articles.js # 文章列表API
│       └── latest.js   # 最新文章API
├── public/             # 静态资源
│   ├── styles/
│   ├── images/
│   ├── sitemap.xml
│   └── robots.txt
├── src/
│   ├── components/      # Astro 组件
│   ├── layouts/         # 页面布局
│   ├── pages/           # 页面
│   └── styles/          # 样式
├── wrangler.toml       # Cloudflare 配置
└── package.json
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 部署到 Cloudflare Pages

### 1. 创建 KV 命名空间

```bash
# 登录 Cloudflare
npx wrangler login

# 创建 KV 命名空间
npx wrangler kv:namespace create ARTICLES_KV
```

### 2. 获取 KV ID 并更新配置

编辑 `wrangler.toml`，将 `YOUR_KV_NAMESPACE_ID` 替换为实际 ID：

```toml
[[kv_namespaces]]
binding = "ARTICLES_KV"
id = "你的KV_ID"
```

### 3. 部署

```bash
# 方式一：使用 Wrangler CLI
npm run deploy

# 方式二：连接 GitHub 自动部署
# 1. 将代码推送到 GitHub
# 2. 在 Cloudflare Dashboard 中创建 Pages 项目
# 3. 连接 GitHub 仓库
# 4. 设置构建命令: npm run build
# 5. 设置输出目录: dist
```

## 扣子Webhook配置

在扣子(Coze)平台配置Webhook：

- **URL**: `https://你的域名.com/api/webhook`
- **方法**: POST
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "title": "文章标题",
  "content": "文章内容（Markdown格式）",
  "category": "guokao",
  "tags": ["备考", "国考"],
  "source": "扣子AI"
}
```

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/webhook` | POST | 接收扣子文章推送 |
| `/api/articles` | GET | 获取文章列表 |
| `/api/latest` | GET | 获取最新6篇文章 |

## 环境变量

在 Cloudflare Dashboard 中设置：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `SITE_NAME` | 网站名称 | 公考资料网 |
| `SITE_DOMAIN` | 网站域名 | gkzc.example.com |

## SEO 优化

- ✅ Meta 标签优化
- ✅ Open Graph 支持
- ✅ Schema.org 结构化数据
- ✅ Sitemap.xml
- ✅ Robots.txt（支持百度爬虫）

## 后续扩展

如需创建其他9个网站，可以：
1. 复制此项目
2. 修改 `src/config.ts` 中的主题配置
3. 更换主题颜色
4. 部署到新的 Cloudflare Pages 项目
