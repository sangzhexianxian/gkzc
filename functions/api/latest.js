/**
 * Cloudflare Worker - 获取最新文章
 */

export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ 
      success: false, 
      message: '只支持 GET 请求' 
    }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const listKey = 'articles:list';
    const existingList = await env.ARTICLES_KV.get(listKey, 'json');
    
    if (!existingList || existingList.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        data: []
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 获取前6篇
    const latestIds = existingList.slice(0, 6);
    const articles = [];
    
    for (const id of latestIds) {
      const article = await env.ARTICLES_KV.get(`article:${id}`, 'json');
      if (article) {
        articles.push(article);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: articles
    }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' }
    });

  } catch (error) {
    console.error('获取最新文章错误:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: '服务器错误' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
