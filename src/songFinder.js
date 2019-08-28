const createAPI = require('./api');
const { youTubeTimeToMS, stringDistance } = require('./utils');
const resultsRanker = require('./resultsRanker');

function chunkArray(arr, chunkSize) {
  if (!arr.length) return [];
  return [
    arr.slice(0,chunkSize), 
    ...chunkArray(arr.slice(chunkSize), chunkSize)
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
  return exactChannelMatch(artist, channels) || closeChannelMatch(artist, channels);
}

function exactChannelMatch(artist, channels) {
  for (let channel of channels) {
    if (channel.snippet.channelTitle.toLowerCase() == `${artist} - Topic`.toLowerCase()) {
      return channel.snippet.channelId;
    }
  }
  return null;
}

function closeChannelMatch(artist, channels) {
  for (let channel of channels) {
    if (stringDistance(`${artist} - Topic`, channel.snippet.channelTitle) <= 1.5) {
      return channel.snippet.channelId;
    }
  }
  return null;
}

class SongFinder {
  constructor({ key }) {
    this.api = createAPI({ key });
  }

  async getGenericMatches({ artist, title, durationMS }) {
    function flattenIDs(videos) {
      for (let video of videos) {
        video.id = video.id.videoId;
      }
      return videos;
    }

    const data = await this.api.musicVideoSearch({ artist, title });
    let videos = flattenIDs(data.items);
    videos = await this.addDetailsToVideos({ videos });
    return await resultsRanker.rankAndSort({ data: { artist, title, durationMS }, videos });
  }

  async getVideoDetails ({ ids }) {
    const _getVideoDetails = async ({ ids }) => {
      const data = await this.api.getDetailsForVideos({ ids });
      return data.items;
    };

    const chunks = chunkArray(ids, 50);
    const responses = await Promise.all(chunks.map(chunk => _getVideoDetails({ ids: chunk })));
    return [].concat(...responses);  //flatten
  }

  async addDetailsToVideos({ videos }) {
    const details = await this.getVideoDetails({ ids: videos.map(video => video.id) });
    const detailsDict = createDetailsDict(details);
    for (let video of videos) {
      video.durationMS = youTubeTimeToMS(detailsDict[video.id].contentDetails.duration);
      video.viewCount = detailsDict[video.id].statistics.viewCount;
      video.description = detailsDict[video.id].description;
    }
    return videos;
  }

  async getArtistChannelID({ artist }) {
    const response = await this.api.channelSearch({ q: artist });
    return channelMatch(artist, response.items);
  }
}

module.exports = (attrs) => new SongFinder(attrs);