const createAPI = require('./api')

function chunkArray(arr, chunkSize) {
  if (!arr.length) return [];
  return [
    arr.slice(0,chunkSize), 
    ...chunkArray(arr.slice(chunkSize), chunkSize)
  ];
}

class SongFinder {
  constructor({ key }) {
    this.api = createAPI({ key });
  }

  async getGenericMatches({ artist, title, durationMS }) {
    const data = await this.api.musicVideoSearch({ artist, title });
  }

  async getVideoDetails ({ ids }) {
    const _getVideoDetails = async ({ ids }) => {
      const data = await this.api.getDetailsForVideos({ ids });
      return data.items;
    }

    const chunks = chunkArray(ids, 50);
    const responses = await Promise.all(chunks.map(chunk => _getVideoDetails({ ids: chunk })));
    return [].concat(...responses);  //flatten
  }
}

module.exports = (attrs) => new SongFinder(attrs);