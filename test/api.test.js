const nock = require('nock');
const { assert } = require('chai');
const key = 'thisIsMyAPIToken';
const api = require('../src/api')({ key });
const {
  song_search_200,
  channel_search_200,
  channel_detail_200,
  details_for_videos_200
} = require('./mockResponses');
const { checkAndClearNocks } = require('./testHelpers');

describe('api', function () {
  it ('searches for a music video', async function () {
    const q = 'Will Hoge Even If It Breaks Your Heart';
    nock('https://www.googleapis.com/youtube/v3')
      .get('/search')
      .query({ 
        q,
        part: 'snippet',
        type: 'video',
        maxResults: 50,
        videoCategoryId: 10,
        key
      })
      .reply(200, song_search_200);

    const response = await api.musicVideoSearch({ q });
    assert.deepEqual(response, song_search_200);
  });

  it ('searches for an artist channel', async function () {
    const q = 'Will Hoge - Topic';
    nock('https://www.googleapis.com/youtube/v3')
      .get('/search')
      .query({ 
        q,
        key,
        part: 'snippet',
        type: 'channel',
        maxResults: 50
      })
      .reply(200, channel_search_200);
  
    const response = await api.channelSearch({ q });
    assert.deepEqual(response, channel_search_200);
  });

  it ('gets a channel detail', async function () {
    const id = 'UCuY1Z8ah-OtwBZ4jxcKqSSg&part';
    nock('https://www.googleapis.com/youtube/v3')
      .get('/channels')
      .query({
        id,
        key,
        part: 'snippet,contentDetails',
        maxResults: 50
      })
      .reply(200, channel_detail_200);

    const response = await api.getChannelDetail({ id });
    assert.deepEqual(response, channel_detail_200);
  });

  it ('video details fails if over 50 videos tried', async function () {
    try {
      await api.getDetailsForVideos({ ids: new Array(51) });
    } catch (err) {
      assert.equal(err.message, 'Could not get video details: too many ids submitted');
    }
  })

  it ('gets the details of some videos', async function () {
    const ids = song_search_200.items.map(item => item.id.videoId);
    nock('https://www.googleapis.com/youtube/v3')
      .get('/videos')
      .query({
        id: ids,
        key,
        part: 'contentDetails,statistics,snipped',
        maxResults: 50
      })
      .reply(200, details_for_videos_200);
  });



});