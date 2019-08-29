module.exports = {
  // https://www.googleapis.com/youtube/v3/search?q=Will Hoge Even If It Breaks Your Heart&part=snippet&type=video&maxResults=50&videoCategoryId=10&key=YOUR_YOUTUBE_API_KEY
  song_search_200: require('./song_search_200.json'),

  // https://www.googleapis.com/youtube/v3/search?q=Will Hoge -- Topic&part=snippet&type=channel&maxResults=50&key=YOUR_YOUTUBE_API_KEY
  channel_search_200: require('./channel_search_200.json'),

  // https://www.googleapis.com/youtube/v3/channels?id=UCuY1Z8ah-OtwBZ4jxcKqSSg&part=snippet,contentDetails&maxResults=50&key=YOUR_YOUTUBE_API_KEY
  channel_detail_200: require('./channel_detail_200.json'),

  // https://www.googleapis.com/youtube/v3/videos?id=t6P4KwtZ0Ic,hfYBvtrTsts,6lIpnORssVE,63De445Iy4Y,Q2SZ7t0dDGk,P-nvT9a0xbM,r0t9AVwHJng,IGserj5uwQA,0pyVF0FWvYw,nWWvbo6F4ss,eVF3vuD9snI,bdHhqOrwtSM,jU-iNoeiVU8,BAMe6CllCO4,e_fjJ7Gyp64,fj3HqYdZaS8,lopzLQdAW_I,3PCVA5j5-J4,poWZeshOVLI,mGTQckqGrX0,dfjsP6bgf1I,RvNZX_AAjQU,3RZ_yhC7yjY,2aWB6LD2jtQ,Ztx2P5zc064,eq_0bx7bsw0,wtQP9EBfpsQ,vgh61W9vnqQ,a4CvVell34E,nEIsw_2Nt_o,hCX339p6fGo,POnYsARUXdM,tms9vXxyx6k,0Jprg-7-OkU,wmojACmS4ow,6ub4g1tLBYw,vyU5k3Gqf2Q,xzvzmRP_MZc,vwUMNVdn0P4,wXTfXRzU7Mo,6wrfRBi4-hY,04Fm49PFpR0,hY8GYy8C7gI,Sv2YXAd5bdU,AwlO1d8yptI,0nPjjKEAcWI,zXPcLJxMaXc,KOzrBVhwXBo,4PqbY2FdcFs,_uMJ26zOKAI&key=YOUR_YOUTUBE_API_KEY&part=contentDetails,statistics,snippet&maxResults=50
  details_for_videos_200: require('./details_for_videos_200.json'),

  // https://www.googleapis.com/youtube/v3/playlistItems?playlistId=UUuY1Z8ah-OtwBZ4jxcKqSSg&part=snippet,contentDetails,status&maxResults=50&key=YOUR_YOUTUBE_API_KEY
  playlist_items_200: require('./playlist_items_200'),

  // https://www.googleapis.com/youtube/v3/playlistItems?playlistId=UUuY1Z8ah-OtwBZ4jxcKqSSg&part=snippet,contentDetails,status&maxResults=50&pageToken=CDIQAA&key=YOUR_YOUTUBE_API_KEY
  playlist_items_200_p2: require('./playlist_items_200_p2'),

  // https://www.googleapis.com/youtube/v3/playlistItems?playlistId=UUuY1Z8ah-OtwBZ4jxcKqSSg&part=snippet,contentDetails,status&maxResults=50&pageToken=CGQQAA&key=YOUR_YOUTUBE_API_KEY
  playlist_items_200_p3: require('./playlist_items_200_p3'),

  // https://www.googleapis.com/youtube/v3/playlistItems?playlistId=UUuY1Z8ah-OtwBZ4jxcKqSSg&part=snippet,contentDetails,status&maxResults=50&pageToken=CJYBEAA&key=YOUR_YOUTUBE_API_KEY
  playlist_items_200_p4: require('./playlist_items_200_p4'),

  // https://www.googleapis.com/youtube/v3/playlistItems?playlistId=UUuY1Z8ah-OtwBZ4jxcKqSSg&part=snippet,contentDetails,status&maxResults=50&pageToken=CMgBEAA&key=YOUR_YOUTUBE_API_KEY
  playlist_items_200_p5: require('./playlist_items_200_p5'),
};