const createAPI = require("./api");
const { youTubeTimeToMS, stringDistance } = require("./utils");
const resultsRanker = require("./resultsRanker");

class SongFinder {
  constructor({ key, useScraper = false }) {
    this.api = createAPI({ key, useScraper });
  }

  async getSongMatches({ artist, title, durationMS, useScraper = false }) {
    const [autoGenerated, generic] = await Promise.all([
      this.getAutoGeneratedMatches({ artist, title, durationMS }),
      this.getGenericMatches({ artist, title, durationMS }),
    ]);
    const videos = deduplicate(autoGenerated.concat(generic));
    return resultsRanker.rankAndSort({
      data: { artist, title, durationMS },
      videos,
    });
  }

  async getGenericMatches({ artist, title, durationMS, useScraper = false }) {
    function flattenIDs(videos) {
      return videos.map((video) => ({ ...video, id: video.id.videoId }));
    }

    const data = await this.api.musicVideoSearch({ q: `${artist} ${title}` });
    let videos = flattenIDs(data.items);
    return await this.addDetailsToVideos({ videos });
  }

  async getAutoGeneratedMatches({
    artist,
    title,
    durationMS,
    useScraper = false,
  }) {
    function flattenIDs(playlistItems) {
      return playlistItems.map((item) => ({
        ...item,
        id: item.contentDetails.videoId,
      }));
    }
    const channelID = await this.getArtistChannelID({ artist });
    if (!channelID) return [];
    const channelDetails = await this.getChannelDetails({ id: channelID });
    const videos = flattenIDs(
      await this.getPlaylistItems({
        id: channelDetails.contentDetails.relatedPlaylists.uploads,
      })
    );
    return await this.addDetailsToVideos({ videos });
  }

  async getVideoDetails({ ids }) {
    const _getVideoDetails = async ({ ids }) => {
      const data = await this.api.getDetailsForVideos({ ids });
      return data.items;
    };

    const chunks = chunkArray(ids, 50);
    const responses = await Promise.all(
      chunks.map((chunk) => _getVideoDetails({ ids: chunk }))
    );
    return [].concat(...responses); //flatten
  }

  async addDetailsToVideos({ videos }) {
    const details = await this.getVideoDetails({
      ids: videos.map((video) => video.id),
    });
    const detailsDict = createDetailsDict(details);
    for (let video of videos) {
      video.durationMS = youTubeTimeToMS(
        detailsDict[video.id].contentDetails.duration
      );
      video.viewCount = detailsDict[video.id].statistics.viewCount;
      video.description = detailsDict[video.id].description;
    }
    return videos;
  }

  async getArtistChannelID({ artist }) {
    const response = await this.api.channelSearch({ q: artist });
    return channelMatch(artist, response.items);
  }

  async getChannelDetails({ id }) {
    const response = await this.api.getChannelDetails({ id });
    return response.items[0];
  }

  async getPlaylistItems({ id, pageToken, pageCount = 0 }) {
    const response = await this.api.getPlaylistItems({ id, pageToken });
    const { nextPageToken } = response;
    if (!nextPageToken || pageCount >= 20) return response.items;
    return response.items.concat(
      await this.getPlaylistItems({
        id,
        pageToken: nextPageToken,
        pageCount: pageCount++,
      })
    );
  }
}

/*
 * Helper Functions
 */
function chunkArray(arr, chunkSize) {
  if (!arr.length) return [];
  return [
    arr.slice(0, chunkSize),
    ...chunkArray(arr.slice(chunkSize), chunkSize),
  ];
}

function createDetailsDict(details) {
  const dict = {};
  for (let detail of details) {
    dict[detail.id] = detail;
  }
  return dict;
}

function channelMatch(artist, channels) {
  return (
    exactChannelMatch(artist, channels) || closeChannelMatch(artist, channels)
  );
}

function exactChannelMatch(artist, channels) {
  for (let channel of channels) {
    if (
      channel.snippet.channelTitle.toLowerCase() ==
      `${artist} - Topic`.toLowerCase()
    ) {
      return channel.snippet.channelId;
    }
  }
  return null;
}

function closeChannelMatch(artist, channels) {
  for (let channel of channels) {
    if (
      stringDistance(`${artist} - Topic`, channel.snippet.channelTitle) <= 1.5
    ) {
      return channel.snippet.channelId;
    }
  }
  return null;
}

function deduplicate(videos) {
  const alreadySeen = {};
  const deduped = [];
  for (let video of videos) {
    if (!alreadySeen[video.id]) {
      alreadySeen[video.id] = true;
      deduped.push(video);
    }
  }
  return deduped;
}

module.exports = (attrs) => new SongFinder(attrs);
