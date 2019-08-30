const nock = require('nock');
const { assert } = require('chai');
const key = 'thisIsMyAPIToken';
const api = require('../src/api')({ key });
const {
  song_search_200,
  channel_search_200,
  channel_detail_200,
  details_for_videos_200,
  playlist_items_200,
  playlist_items_200_p2
} = require('./mockResponses');
const { checkAndClearNocks } = require('./testHelpers');

describe('api', function () {
  afterEach(async function () {
    await checkAndClearNocks(nock);
  });

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

    const response = await api.getChannelDetails({ id });
    assert.deepEqual(response, channel_detail_200);
  });

  it ('video details fails if over 50 videos tried', async function () {
    try {
      await api.getDetailsForVideos({ ids: new Array(51) });
    } catch (err) {
      assert.equal(err.message, 'Could not get video details: too many ids submitted');
    }
  });

  it ('gets the details of some videos', async function () {
    const ids = song_search_200.items.map(item => item.id.videoId);
    nock('https://www.googleapis.com/youtube/v3')
      .get('/videos')
      .query({
        id: ids.join(','),
        key,
        part: 'contentDetails,statistics,snippet',
        maxResults: 50
      })
      .reply(200, details_for_videos_200);
    const response = await api.getDetailsForVideos({ ids });
    assert.deepEqual(response, details_for_videos_200);
  });

  it ('gets playlistItems', async function () {
    const id = '123';
    nock('https://www.googleapis.com/youtube/v3')
      .get('/playlistItems')
      .query({
        playlistId: id,
        key,
        part: 'snippet,contentDetails,status',
        maxResults: 50
      })
      .reply(200, playlist_items_200);
    const response = await api.getPlaylistItems({ id });
    assert.deepEqual(response, playlist_items_200);

  });

  it ('gets a second page of playlistItems (with pageToken)', async function () {
    const pageToken = 'abcd';
    const id = '123';
    nock('https://www.googleapis.com/youtube/v3')
      .get('/playlistItems')
      .query({
        playlistId: id,
        key,
        part: 'snippet,contentDetails,status',
        maxResults: 50,
        pageToken: 'abcd'
      })
      .reply(200, playlist_items_200_p2);
    const response = await api.getPlaylistItems({ id, pageToken });
    assert.deepEqual(response, playlist_items_200_p2);
  });
});