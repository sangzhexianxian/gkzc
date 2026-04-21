/**
 * Cloudflare Worker - 获取文章列表
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
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const category = url.searchParams.get('category');

    const listKey = 'articles:list';
    let articleList = [];
    const existingList = await env.ARTICLES_KV.get(listKey, 'json');
    
    if (!existingList) {
      return new Response(JSON.stringify({ 
        success: true, 
        data: { articles: [], total: 0, page, totalPages: 0 }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    articleList = existingList;

    // 按分类筛选
    let filteredList = articleList;
    if (category) {
      const filtered = [];
      for (const id of articleList) {
        const article = await env.ARTICLES_KV.get(`article:${id}`, 'json');
        if (article && article.category === category) {
          filtered.push(id);
        }
      }
      filteredList = filtered;
    }

    // 分页
    const startIndex = (page - 1) * limit;
    const paginatedIds = filteredList.slice(startIndex, startIndex + limit);
    
    // 获取文章详情
    const articles = [];
    for (const id of paginatedIds) {
      const article = await env.ARTICLES_KV.get(`article:${id}`, 'json');
      if (article) {
        articles.push(article);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: {
        articles,
        total: filteredList.length,
        page,
        totalPages: Math.ceil(filteredList.length / limit)
      }
    }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' }
    });

  } catch (error) {
    console.error('获取文章列表错误:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      message: '服务器错误' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
