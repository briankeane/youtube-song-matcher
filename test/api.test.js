const nock = require('nock');
const { assert } = require('chai');
const Api = require('../src/api');
const {
  song_search_200,
  channel_search_200,
  channel_detail_200
} = require('./mockResponses');
const { checkAndClearNocks } = require('./testHelpers');

describe('api', function () {
  const key = 'thisIsMyAPIToken';
  let api;

  beforeEach(function () {
    api = new Api({ key });
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

    const response = await api.getChannelDetail({ id });
    assert.deepEqual(response, channel_detail_200);
  });



});