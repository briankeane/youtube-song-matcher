module.exports = {
  // https://www.googleapis.com/youtube/v3/search?q=Will Hoge Even If It Breaks Your Heart&part=snippet&type=video&maxResults=50&videoCategoryId=10&key=YOUR_YOUTUBE_API_KEY
  song_search_200: require('./song_search_200.json'),

  // https://www.googleapis.com/youtube/v3/search?q=Will Hoge -- Topic&part=snippet&type=channel&maxResults=50&key=YOUR_YOUTUBE_API_KEY
  channel_search_200: require('./channel_search_200.json'),

  // https://www.googleapis.com/youtube/v3/channels?id=UCuY1Z8ah-OtwBZ4jxcKqSSg&part=snippet,contentDetails&maxResults=50&key=YOUR_YOUTUBE_API_KEY
  channel_detail_200: require('./channel_detail_200.json')
};