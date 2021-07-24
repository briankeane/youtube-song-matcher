const resultsRanker = require("../src/resultsRanker");
const { assert } = require("chai");

describe("resultsRanker", function () {
  let videos;
  let data = {
    artist: "Will Hoge",
    title: "Even If It Breaks Your Heart",
    durationMS: 222000,
  };

  beforeEach(function () {
    videos = JSON.parse(JSON.stringify(require("./resultsRankerInputs")));
  });

  describe("filterByDuration", function () {
    it("filters by duration", function () {
      for (let i = 0; i < 50; i++) {
        videos[i].durationMS = 218000;
      }
      for (let i = 50; i < 100; i++) {
        videos[i].durationMS = 226000;
      }
      const result = resultsRanker.filterByDuration({ data, videos });
      assert.equal(result.length, 106);
      assert.exists(result[0].matchInfo.durationMatchRating);
    });
  });

  describe("rankTitleMatches", function () {
    it("ranks title matches", function () {});
  });

  describe("markContainsStandardYouTubeLicense", function () {
    it("marks a song if standard youtube license is included", function () {
      videos[0].snippet.description =
        "This should Contain Standard YouTube License";
      videos[1].snippet.description =
        "This should countain sTandard youtube License";
      const results = resultsRanker.markContainsStandardLicense({ videos });
      assert.isTrue(results[0].matchInfo.containsStandardLicense);
      assert.isTrue(results[1].matchInfo.containsStandardLicense);
      assert.isNotOk(
        results[2].matchInfo && results[2].matchInfo.containsStandardLicense
      );
    });

    it("marks a song if standard youtube license is included", function () {
      videos[0].snippet.description =
        "This song was provided to youtube by Will Hoge Records";
      videos[1].snippet.description =
        "This song was Provided to YouTube by Will Hoge Records";
      videos[2].snippet.description = "Nope";
      const results = resultsRanker.markContainsProvidedToYouTubeBy({ videos });
      assert.isTrue(results[0].matchInfo.containsProvidedToYouTubeBy);
      assert.isTrue(results[1].matchInfo.containsProvidedToYouTubeBy);

      assert.isNotOk(
        results[2].matchInfo && results[2].matchInfo.containsProvidedToYouTubeBy
      );
    });

    it("rank title contains official", function () {
      videos[0].snippet.title = "This is an official video";
      videos[0].snippet.channelTitle = "Official Will Hoge";
      videos[0].snippet.description = "This is so OFFICIAL";
      videos[1].snippet.description = "No it was not";
      videos[1].snippet.channelTitle = "Nope";
      videos[1].snippet.title = "Nope";
      const results = resultsRanker.rankContainsOfficial({ data, videos });
      assert.equal(results[0].matchInfo.containsOfficialRating, 1);
      assert.equal(results[3].matchInfo.containsOfficialRating, 0);
    });

    it("ranks the closeness of the title match", function () {
      const titleVideos = [
        {
          snippet: {
            title: "even if it breaks your heart",
            description: "even if it breaks your heart",
          },
        },
        {
          snippet: {
            title: "Even tif it breaks YOUR HEART",
            description: "even if it breaks your heart",
          },
        },
        {
          snippet: {
            title: "even if it steaks your heart",
            description: "even if it breaks your heart",
          },
        },
        {
          snippet: {
            title: "nothing to see here ",
            description: "nothing at all",
          },
        },
      ];
      const results = resultsRanker.rankTitleMatch({
        data,
        videos: titleVideos,
      });
      assert.isAbove(results[0].matchInfo.titleMatchRating, 0.95);
      assert.isAbove(results[1].matchInfo.titleMatchRating, 0.95);
      assert.isAbove(results[2].matchInfo.titleMatchRating, 0.95);
      assert.isBelow(results[3].matchInfo.titleMatchRating, 0.8);
    });

    it("rank the closesness of the artist match", function () {
      videos[0].snippet.title = "Even If It Breaks Your Heart by Will Hoge";
      videos[0].snippet.channelTitle = "Will Hoge - Topic";
      videos[0].snippet.description =
        "Even If it Breaks Your Heart by Will Hoge";
      videos[1].snippet.description = "No it was not";
      videos[1].snippet.channelTitle = "Nope";
      videos[1].snippet.title = "Nope";
      const results = resultsRanker.rankArtistMatch({ data, videos });
      assert.isAbove(results[0].matchInfo.artistMatchRating, 0.95);
      assert.isBelow(results[1].matchInfo.artistMatchRating, 0.6);
    });
  });

  describe("rankAndSort", function () {
    it("ranks and sorts", function () {
      const results = resultsRanker.rankAndSort({ data, videos });
      // for now just make sure the first video is one of the acceptable ones.
      assert.include(["Q2SZ7t0dDGk", "pQmjL5U-O38"], results[0].id);
    });
  });
});
