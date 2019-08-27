const songFinder = require('../src/songFinder')({ key: 'myApiKey' });
const sinon = require('sinon');
const { assert } = require('chai');
const {
  details_for_videos_200
} = require('./mockResponses');


describe('SongFinder', function () {
  let getDetailsForVideosStub;

  beforeEach(function () {
    getDetailsForVideosStub = sinon.stub(songFinder.api, 'getDetailsForVideos').resolves(details_for_videos_200);
  });

  afterEach(function () {
    getDetailsForVideosStub.restore();
  });

  describe('getVideoDetails', function () {
    it ('gets video details', async function () {
      const ids = ['1','2','3','4'];
      const result = await songFinder.getVideoDetails({ ids });
      assert.deepEqual(result, details_for_videos_200.items);
      sinon.assert.calledOnce(getDetailsForVideosStub);
      sinon.assert.calledWith(getDetailsForVideosStub, { ids });
    });

    it ('makes separate calls for over 50 ids', async function () {
      const ids = [...Array(100).keys()].map(number => `${number}`);
      getDetailsForVideosStub.onCall(0).resolves(details_for_videos_200);
      getDetailsForVideosStub.onCall(1).resolves(details_for_videos_200);
      const result = await songFinder.getVideoDetails({ ids });
      sinon.assert.calledTwice(getDetailsForVideosStub);
      sinon.assert.calledWith(getDetailsForVideosStub.firstCall, { ids: ids.slice(0,50) });
      sinon.assert.calledWith(getDetailsForVideosStub.secondCall, { ids: ids.slice(50) });
      assert.deepEqual(result, details_for_videos_200.items.concat(details_for_videos_200.items));
    });
  });
});