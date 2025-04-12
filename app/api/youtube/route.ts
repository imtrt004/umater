import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { endpoint, params } = await request.json();
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    
    console.log(`YouTube API Proxy: Request for ${endpoint} with videoId: ${params.videoId}`);
    
    let url: string;
    let options: RequestInit = { method: 'GET' };
    
    if (endpoint === 'videos') {
      url = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${params.videoId}&key=${apiKey}`;
    } else if (endpoint === 'comments') {
      url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${params.videoId}&maxResults=100&order=relevance&key=${apiKey}`;
    } else if (endpoint === 'heatmap') {
      url = 'https://www.youtube.com/youtubei/v1/browse';
      options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            client: { clientName: 'WEB', clientVersion: '2.20230331.00.00' }
          },
          videoId: params.videoId,
          params: 'YAHI5eBipAI'
        })
      };
    } else {
      console.log(`YouTube API Proxy: Invalid endpoint: ${endpoint}`);
      return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
    }
    
    console.log(`YouTube API Proxy: Fetching from ${url.split('?')[0]}`);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      console.error(`YouTube API Proxy: Error response ${response.status} - ${response.statusText}`);
      return NextResponse.json({ 
        error: `API responded with status ${response.status}`,
        details: await response.text()
      }, { status: response.status });
    }
    
    const data = await response.json();
    console.log(`YouTube API Proxy: Successfully fetched data for ${endpoint}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('YouTube API proxy error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch data',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 