const songFinder = require('../src/songFinder')({ key: 'myApiKey' });
const sinon = require('sinon');
const { assert } = require('chai');
const {
  details_for_videos_200,
  song_search_200,
  channel_search_200,
  channel_detail_200
} = require('./mockResponses');
const { youTubeTimeToMS } = require('../src/utils');
const resultsRanker = require('../src/resultsRanker');

function flattenIDs(videos) {
  for (let video of videos)
    video.id = video.id.videoId;
  return videos;
}

function cloneArray(arr) {
  return arr.map(a => Object.assign({}, a));
}

describe('SongFinder', function () {
  let getDetailsForVideosStub;

  describe('getVideoDetails', function () {
    beforeEach(function () {
      getDetailsForVideosStub = sinon.stub(songFinder.api, 'getDetailsForVideos').resolves(details_for_videos_200);
    });

    afterEach(function () {
      getDetailsForVideosStub.restore();
    });
  
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
    
    describe('addDetailsToVideos', function () {
      it ('adds details to videos', async function () {
        const videos = flattenIDs(cloneArray(song_search_200.items));
        const videosWithDetails = await songFinder.addDetailsToVideos({ videos });
        assert.equal(videos[0].durationMS, youTubeTimeToMS(details_for_videos_200.items[0].contentDetails.duration));
        assert.equal(videos[0].viewCount, details_for_videos_200.items[0].statistics.viewCount);
        assert.equal(videosWithDetails[0].description, details_for_videos_200.items[0].description);
      });
    });

    describe('getGenericMatches', function () {
      let musicVideoSearchStub;
      let resultsRankerStub;
      let songInfo = { artist: 'Will Hoge', title: 'Even If It Breaks Your Heart', durationMS: 220000 };

      beforeEach(function () {
        musicVideoSearchStub = sinon.stub(songFinder.api, 'musicVideoSearch').resolves(song_search_200);
        resultsRankerStub = sinon.stub(resultsRanker, 'rankAndSort').callsFake(attrs => attrs.videos);
      });

      afterEach(function () {
        musicVideoSearchStub.restore();
        resultsRankerStub.restore();
      });

      it ('gets generic matches', async function () {
        const matches = await songFinder.getGenericMatches(songInfo);
        assert.equal(matches.length, song_search_200.items.length);
        assert.equal(matches[0].durationMS, youTubeTimeToMS(details_for_videos_200['items'][0].contentDetails.duration));
        assert.equal(matches[0].snippet.title, song_search_200['items'][0].snippet.title);

        const resultsRankerArgs = resultsRankerStub.getCall(0).args[0];
        assert.deepEqual(resultsRankerArgs.data, songInfo);
      });
    });

    describe('findAutoGeneratedMatches', function () {
      let channelSearchStub;
      let channelDetailStub;

      beforeEach(function () {
        channelSearchStub = sinon.stub(songFinder.api, 'channelSearch').resolves(channel_search_200);
        channelDetailStub = sinon.stub(songFinder.api, 'getChannelDetails').resolves(channel_detail_200);
      });

      afterEach(function () {
        channelSearchStub.restore();
        channelDetailStub.restore();
      });

      describe('getArtistChannelID', function () {
        it ('gets a channel id for an exact match', async function () {
          let id = await songFinder.getArtistChannelID({ artist: 'Will Hoge' });
          assert.equal(id, 'UCuY1Z8ah-OtwBZ4jxcKqSSg');
          id = await songFinder.getArtistChannelID({ artist: 'Mathematics' });
          assert.equal(id, 'UCT4-UAcRfvBtO76gX2vexpA');
          id = await songFinder.getArtistChannelID({ artist: 'John Richardson'});
          assert.equal(id, 'UCwH2MqK8NfwmID4qKt6vwyw');
        });

        it ('ignores case for exact matches', async function() {
          let id = await songFinder.getArtistChannelID({ artist: 'Will HOGE' });
          assert.equal(id, 'UCuY1Z8ah-OtwBZ4jxcKqSSg');
          id = await songFinder.getArtistChannelID({ artist: 'MathEMATICS' });
          assert.equal(id, 'UCT4-UAcRfvBtO76gX2vexpA');
          id = await songFinder.getArtistChannelID({ artist: 'John RICHardson'});
          assert.equal(id, 'UCwH2MqK8NfwmID4qKt6vwyw');
        });

        it ('still works for close matches', async function () {
          let id = await songFinder.getArtistChannelID({ artist: 'Will HOGEs' });
          assert.equal(id, 'UCuY1Z8ah-OtwBZ4jxcKqSSg');
          id = await songFinder.getArtistChannelID({ artist: 'MathEMMTICS' });
          assert.equal(id, 'UCT4-UAcRfvBtO76gX2vexpA');
          id = await songFinder.getArtistChannelID({ artist: 'John RICH ardson'});
          assert.equal(id, 'UCwH2MqK8NfwmID4qKt6vwyw');
        });

        it ('returns Falsy if no matches found', async function () {
          let id = await songFinder.getArtistChannelID({ artist: 'fee fi fo fum' });
          assert.notOk(id);
        });
      });

      describe('getArtistChannelID', function () {
        it ('gets the details of a channel', async function () {
          let details = await songFinder.getChannelDetails({ id: '123' });
          sinon.assert.calledWith(channelDetailStub, { id: '123' });
          assert.deepEqual(details, channel_detail_200.items[0]);
        });
      });
    });
  });
});

