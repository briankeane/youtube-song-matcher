const nock = require("nock");
const { assert } = require("chai");
const key = "thisIsMyAPIToken";
const api = require("../src/api")({ key });
const scraperApi = require("../src/api")({ key, useScraper: true });
const scraper = require("scrape-youtube");
const sinon = require("sinon");
const {
  song_search_200,
  channel_search_200,
  channel_detail_200,
  details_for_videos_200,
  playlist_items_200,
  playlist_items_200_p2,
  scrape_song_search,
  scrape_channel_search,
} = require("./mockResponses");
const { checkAndClearNocks } = require("./testHelpers");
const { default: youtube } = require("scrape-youtube");

describe("api", function () {
  afterEach(async function () {
    await checkAndClearNocks(nock);
  });

  it("searches for a music video", async function () {
    const q = "Will Hoge Even If It Breaks Your Heart";
    nock("https://www.googleapis.com/youtube/v3")
      .get("/search")
      .query({
        q,
        part: "snippet",
        type: "video",
        maxResults: 50,
        videoCategoryId: 10,
        key,
      })
      .reply(200, song_search_200);

    const response = await api.musicVideoSearch({ q });
    assert.deepEqual(response, song_search_200);
  });

  it("searches for an artist channel", async function () {
    const q = "Will Hoge - Topic";
    nock("https://www.googleapis.com/youtube/v3")
      .get("/search")
      .query({
        q,
        key,
        part: "snippet",
        type: "channel",
        maxResults: 50,
      })
      .reply(200, channel_search_200);

    const response = await api.channelSearch({ q });
    assert.deepEqual(response, channel_search_200);
  });

  it("gets a channel detail", async function () {
    const id = "UCuY1Z8ah-OtwBZ4jxcKqSSg&part";
    nock("https://www.googleapis.com/youtube/v3")
      .get("/channels")
      .query({
        id,
        key,
        part: "snippet,contentDetails",
        maxResults: 50,
      })
      .reply(200, channel_detail_200);

    const response = await api.getChannelDetails({ id });
    assert.deepEqual(response, channel_detail_200);
  });

  it("video details fails if over 50 videos tried", async function () {
    try {
      await api.getDetailsForVideos({ ids: new Array(51) });
    } catch (err) {
      assert.equal(
        err.message,
        "Could not get video details: too many ids submitted"
      );
    }
  });

  it("gets the details of some videos", async function () {
    const ids = song_search_200.items.map((item) => item.id.videoId);
    nock("https://www.googleapis.com/youtube/v3")
      .get("/videos")
      .query({
        id: ids.join(","),
        key,
        part: "contentDetails,statistics,snippet",
        maxResults: 50,
      })
      .reply(200, details_for_videos_200);
    const response = await api.getDetailsForVideos({ ids });
    assert.deepEqual(response, details_for_videos_200);
  });

  it("gets playlistItems", async function () {
    const id = "123";
    nock("https://www.googleapis.com/youtube/v3")
      .get("/playlistItems")
      .query({
        playlistId: id,
        key,
        part: "snippet,contentDetails,status",
        maxResults: 50,
      })
      .reply(200, playlist_items_200);
    const response = await api.getPlaylistItems({ id });
    assert.deepEqual(response, playlist_items_200);
  });

  it("gets a second page of playlistItems (with pageToken)", async function () {
    const pageToken = "abcd";
    const id = "123";
    nock("https://www.googleapis.com/youtube/v3")
      .get("/playlistItems")
      .query({
        playlistId: id,
        key,
        part: "snippet,contentDetails,status",
        maxResults: 50,
        pageToken: "abcd",
      })
      .reply(200, playlist_items_200_p2);
    const response = await api.getPlaylistItems({ id, pageToken });
    assert.deepEqual(response, playlist_items_200_p2);
  });

  describe("with scraper", function () {
    afterEach(function () {
      scraper.default.search.restore();
    });

    it("searchies for a music video with scraper", async function () {
      const q = "Will Hoge Even If It Breaks Your Heart";
      sinon
        .stub(scraper.default, "search")
        .returns(Promise.resolve(scrape_song_search));
      const response = await scraperApi.musicVideoSearch({ q });
      assert.equal(response.items.length, scrape_song_search.videos.length);
      for (let i = 0; i < response.items.length; i++) {
        assertLooksLikeAProperlyFormattedSong(
          response.items[i],
          scrape_song_search.videos[i]
        );
      }
    });

    it("searches for an artist channel via scraper", async function () {
      const q = "Will Hoge - Topic";
      sinon
        .stub(scraper.default, "search")
        .returns(Promise.resolve(scrape_channel_search));
      const response = await scraperApi.channelSearch({ q });
      assert.equal(
        response.items.length,
        scrape_channel_search.channels.length
      );
      for (let i = 0; i < response.items.length; i++) {
        assertLooksLikeAProperlyFormattedChannel(
          response.items[i],
          scrape_channel_search.channels[i]
        );
      }
    });
  });
});

function assertLooksLikeAProperlyFormattedSong(item, scrapeResult) {
  assert.equal(item.id.kind, "youtube#video");
  assert.equal(item.id.videoId, scrapeResult.id);
  assert.equal(item.snippet.title, scrapeResult.title);
  assert.equal(item.snippet.description, scrapeResult.description);
  assert.equal(item.snippet.channelTitle, scrapeResult.channel.name);
  assert.equal(item.durationMS, scrapeResult.duration * 1000);
  assert.equal(item.description, scrapeResult.description);
}

function assertLooksLikeAProperlyFormattedChannel(item, scrapeResult) {
  assert.equal(item.id.kind, "youtube#channel");
  assert.equal(item.id.channelId, scrapeResult.id);
  assert.equal(item.snippet.channelId, scrapeResult.id);
  assert.equal(item.snippet.title, scrapeResult.name);
  assert.equal(item.snippet.description, scrapeResult.description);
  assert.equal(item.snippet.channelTitle, scrapeResult.name);
}
