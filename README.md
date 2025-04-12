# UMater - YouTube Analytics Tool

UMater is a modern web application built with Next.js, TypeScript, and Tailwind CSS that provides detailed analytics for YouTube videos. The application allows users to analyze any YouTube video by simply entering its URL, providing insights on performance, engagement, and user interaction metrics.

## Features

- **YouTube Video Analysis**: Enter any YouTube URL to get detailed analytics.
- **Performance Metrics**: View statistics like views, likes, and comments.
- **Engagement Analysis**: See engagement ratios and comparisons.
- **Popular Videos**: Compare with currently trending videos in Bangladesh.
- **Responsive Design**: Works on desktop, tablet, and mobile devices.

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: For type safety and better developer experience
- **Tailwind CSS**: For styling and responsive design
- **Chart.js**: For data visualization
- **React Icons**: For UI icons
- **Axios**: For API requests

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/umater.git
cd umater
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Use

1. Enter a YouTube URL in the search box (e.g., https://www.youtube.com/watch?v=VIDEO_ID)
2. Click "Analyze" to process the video
3. View detailed analytics including:
   - Video details and metadata
   - Engagement metrics visualization
   - Comparison with popular videos

## API Information

This project uses the YouTube Data API v3 to fetch video data. The API endpoints used are:

1. `/videos` with `chart=mostPopular` parameter to get trending videos
2. `/videos` with specific `id` parameter to get video details and statistics

## License

This project is open source and available under the [MIT License](LICENSE).

# YouTube Keyword Explorer

A comprehensive tool for YouTube content creators and marketers to research, analyze, and optimize keywords for better visibility and reach.

## Features

### Keyword Research & Analysis
- Search volume trends visualization
- Keyword difficulty scoring
- Competition analysis
- Related keyword suggestions
- Recommendations based on intent and volume

### YouTube Video Transcription
- Easily transcribe any YouTube video
- Copy or download transcriptions
- Analyze video content for keyword optimization
- Integration with keyword research tools

## Technology Stack

- Next.js 13+ (App Router)
- TypeScript
- TailwindCSS
- React Icons
- API integrations for keyword data and transcription

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Keyword Explorer
Enter any keyword to get comprehensive analysis including search volume, competition, difficulty score, and related keywords.

### Transcription Tool
1. Navigate to the Transcribe page
2. Enter a YouTube video URL
3. Click "Transcribe" to generate the transcript
4. View, copy, or download the transcript for your content research

## License

MIT

## Real Data Video Analysis

UMater now supports real YouTube data analysis for video retention and engagement metrics! This feature combines multiple data sources to provide valuable insights into video performance.

### Setup Instructions

1. Create a `.env.local` file in the project root with your YouTube Data API key:
   ```
   NEXT_PUBLIC_YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY_HERE
   ```

2. Get a YouTube API key from the [Google Cloud Console](https://console.cloud.google.com/):
   - Create a new project
   - Enable the YouTube Data API v3
   - Create API credentials
   - Add the API key to your `.env.local` file

### Real Data Features

The retention analyzer now combines multiple sources of real data:

1. **YouTube Most Replayed Data**: 
   - Accesses YouTube's heatmap data when available through their API
   - Shows which parts of videos are most replayed by viewers

2. **Comment Analysis**:
   - Analyzes comments for timestamps mentioned by viewers
   - Performs sentiment analysis to gauge viewer reactions
   - Identifies common topics and issues

3. **Engagement Metrics**:
   - Calculates like-to-view ratio
   - Provides an overall engagement score
   - Compares performance to similar videos

4. **Smart Retention Modeling**:
   - Uses comment timestamps to identify high-interest sections
   - Generates a retention curve similar to YouTube Analytics
   - Falls back to machine learning model when heatmap data isn't available

### Technical Implementation

The system makes the following API calls:

1. Videos API call to get basic metadata:
   ```
   https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoId}&key=${apiKey}
   ```

2. Most Replayed heatmap data (reverse-engineered, not officially documented):
   ```
   https://www.youtube.com/youtubei/v1/browse
   ```

3. Comments API call to gather user feedback:
   ```
   https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&order=relevance&key=${apiKey}
   ```

### Fallback Strategy

If real data cannot be accessed, the system will fall back to a predictive model that generates representative retention data based on video type, length, and other metrics.

## Usage

1. Navigate to the "Retention" page
2. Enter a YouTube video URL
3. View the detailed retention analysis with real data insights
4. Review the recommendations for improving viewer retention
