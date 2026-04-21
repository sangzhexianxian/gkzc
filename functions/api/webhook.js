/**
 * Cloudflare Worker - Webhook 处理
 * 接收扣子(Coze)推送的文章
 */

export async function onRequest(context) {
  const { request, env } = context;
  
  // 只处理 POST 请求
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ 
      success: false, 
      message: '只支持 POST 请求' 
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { title, content, category = 'general', tags = [], source = '扣子AI', publishTime } = body;

    // 验证必填字段
    if (!title || !content) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '缺少必填字段：title 和 content' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 生成文章 ID
    const id = `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newArticle = {
      id,
      title: title.trim(),
      content: content.trim(),
      category,
      tags,
      source,
      publishTime: publishTime || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      views: 0
    };

    // 存储到 KV
    await env.ARTICLES_KV.put(`article:${id}`, JSON.stringify(newArticle));
    
    // 更新文章列表（获取现有列表，添加新文章）
    const listKey = 'articles:list';
    let articleList = [];
    const existingList = await env.ARTICLES_KV.get(listKey, 'json');
    if (existingList) {
      articleList = existingList;
    }
    articleList.unshift(id);
    await env.ARTICLES_KV.put(listKey, JSON.stringify(articleList));

    console.log(`[${new Date().toISOString()}] 新文章已同步: ${title}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: '文章同步成功',
      articleId: id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook错误:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: '同步失败: ' + error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
