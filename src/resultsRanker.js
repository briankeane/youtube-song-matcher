const Fuse = require("fuse.js");

const minMatchCharLength = 4;
const defaultFuseOptions = {
  shouldSort: false,
  caseSensitive: false,
  includeScore: true,
  threshold: 1.0,
  location: 0,
  distance: 10000,
  maxPatternLength: 32,
  minMatchCharLength: 4,
};

function rankAndSort({ data, videos }) {
  videos = filterByDuration({ data, videos });
  videos = rankTitleMatch({ data, videos });
  videos = rankArtistMatch({ data, videos });
  videos = rankContainsOfficial({ data, videos });
  videos = markContainsProvidedToYouTubeBy({ data, videos });
  videos = markContainsStandardLicense({ data, videos });
  videos = rankTotalScore({ data, videos });
  return sortVideos(videos);
}

function rankTotalScore({ videos }) {
  return videos.map((video) => {
    let totalScore = 0;

    if (video.matchInfo.artistMatchRating)
      totalScore += 10 * video.matchInfo.artistMatchRating;

    if (video.matchInfo.titleMatchRating)
      totalScore += 10 * video.matchInfo.titleMatchRating;

    if (video.matchInfo.containsOfficialRating)
      totalScore += 3 * video.matchInfo.containsOfficialRating;

    if (video.matchInfo.containsProvidedToYouTubeBy) totalScore += 3.0;

    if (video.matchInfo.containsStandardLicense) totalScore += 3.0;

    video.matchInfo.totalScore = totalScore;

    return video;
  });
}

function rankArtistMatch({ data, videos }) {
  const options = {
    ...defaultFuseOptions,
    keys: [
      {
        name: "snippet.title",
        weight: 0.4,
      },
      {
        name: "snippet.channelTitle",
        weight: 0.4,
      },
      {
        name: "description",
        weight: 0.2,
      },
    ],
  };
  const fuse = new Fuse(videos, options);
  const results = fuse.search(data.artist);
  return flattenFuseResults(results, "artistMatchRating");
}

function rankTitleMatch({ data, videos }) {
  const options = {
    ...defaultFuseOptions,
    keys: [
      { name: "snippet.title", weight: 0.7 },
      { name: "snippet.description", weight: 0.3 },
    ],
  };
  const fuse = new Fuse(videos, options);
  const results = fuse.search(data.title);
  return flattenFuseResults(results, "titleMatchRating");
}

function rankContainsOfficial({ data, videos }) {
  return videos.map((video) => {
    var containsOfficialRating = 0;
    if (video.snippet.title.toLowerCase().includes("official"))
      containsOfficialRating += 0.4;
    if (
      video.snippet.channelTitle &&
      video.snippet.channelTitle.toLowerCase().includes("official")
    )
      containsOfficialRating += 0.4;
    if (video.snippet.description.toLowerCase().includes("official"))
      containsOfficialRating += 0.2;

    return {
      ...video,
      minMatchCharLength: Math.min(data.title.length, minMatchCharLength),
      matchInfo: {
        ...(video.matchInfo || {}),
        containsOfficialRating,
      },
    };
  });
}

function filterByDuration({ data, videos }) {
  return videos.filter((video) => {
    const difference = Math.abs(data.durationMS - video.durationMS);
    video.matchInfo = {
      ...(video.matchInfo || {}),
      durationMatchRating: difference / 3000,
    };
    return difference <= 3000;
  });
}

function sortVideos(videos) {
  return videos.sort((a, b) => b.matchInfo.totalScore - a.matchInfo.totalScore);
}

function markContainsProvidedToYouTubeBy({ videos }) {
  for (let video of videos) {
    video.matchInfo = {
      ...(video.matchInfo || {}),
      containsProvidedToYouTubeBy: video.snippet.description
        .toLowerCase()
        .includes("provided to youtube by"),
    };
  }
  return videos;
}

function markContainsStandardLicense({ videos }) {
  for (let video of videos) {
    video.matchInfo = {
      ...(video.matchInfo || {}),
      containsStandardLicense: video.snippet.description
        .toLowerCase()
        .includes("standard youtube license"),
    };
  }
  return videos;
}

function flattenFuseResults(results, propName) {
  return results.map((result) => {
    result.item.matchInfo = result.item.matchInfo || {};
    result.item.matchInfo[propName] = 1.0 - result.score;
    return result.item;
  });
}

module.exports = {
  rankAndSort,
  filterByDuration,
  markContainsStandardLicense,
  markContainsProvidedToYouTubeBy,
  rankContainsOfficial,
  rankTitleMatch,
  rankArtistMatch,
};
