import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get the request body
    const data = await request.json();
    
    // Forward the request to the Tactiq API
    const response = await fetch('https://tactiq-apps-prod.tactiq.io/transcript', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        'origin': 'https://tactiq.io',
        'priority': 'u=1, i',
        'referer': 'https://tactiq.io/',
        'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
      },
      body: JSON.stringify(data)
    });

    // If the API returns an error
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Proxy API error:', errorText);
      return NextResponse.json({ error: `API error: ${response.status} ${response.statusText}` }, { status: response.status });
    }

    // Return the API response
    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Transcribe proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 