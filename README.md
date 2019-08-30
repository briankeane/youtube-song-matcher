## YouTube-Song-Searcher

### Installation
```
npm install --save youtube-song-matcher
```

### Usage
```
const matcher = require('youtube-song-matcher')({ key: YOUR_YOUTUBE_API_KEY });
const results = await matcher.getSongMatches({ 
  artist: 'Will Hoge', 
  title: 'Even If It Breaks Your Heart',
  durationMS: 222000
});
console.log(results);
```

will give you something like:

```
[
  { 
    kind: 'youtube#playlistItem',
    etag: '"8jEFfXBrqiSrcF6Ee7MQuz8XuAM/Y5KLxcdeyNZa-NiNzdbeIjPQaVc"',
    id: 'Q2SZ7t0dDGk',
    snippet: { 
      publishedAt: '2017-01-26T01:59:03.000Z',
      channelId: 'UCuY1Z8ah-OtwBZ4jxcKqSSg',
      title: 'Even If It Breaks Your Heart',
      description: 'Provided to YouTube by Rykodisc\n\nEven If It Breaks Your Heart · Will Hoge\n\nThe Wreckage\n\n℗ 2009 Will Hoge, Inc.\n\nAuto-generated by YouTube.',
      thumbnails: [Object],
      channelTitle: 'Will Hoge - Topic',
      playlistId: 'UUuY1Z8ah-OtwBZ4jxcKqSSg',
      position: 188,
      resourceId: [Object] 
    },
    contentDetails: { 
      videoId: 'Q2SZ7t0dDGk',
      videoPublishedAt: '2017-01-26T01:59:03.000Z' 
    },
    status: { 
      privacyStatus: 'public' 
    },
    durationMS: 222000,
    viewCount: 25,
    description: 'modified description',
    matchInfo: { 
      durationMatchRating: 0,
      titleMatchRating: 0.9997,
      artistMatchRating: 0.9994,
      containsOfficialRating: 0,
      containsProvidedToYouTubeBy: true,
      containsStandardLicense: false,
      totalScore: 22.991 
    }
  }, ...
]

```