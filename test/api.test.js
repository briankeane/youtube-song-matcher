const nock = require('nock');
const { assert } = require('chai');
const Api = require('../src/api');
const {
  song_search_200
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

  
});