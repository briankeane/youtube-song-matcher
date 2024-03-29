const axios = require("axios");
const api = axios.create({
  baseURL: "https://www.googleapis.com/youtube/v3",
});
const defaultConfig = { responseType: "json", retry: 20, retryDelay: 1000 };
const scraper = require("./scraper");

api.interceptors.response.use(null, (error) => {
  // socket hang up
  if (error.code == "ECONNRESET") return performExponentialBackoff(api, error);

  // Too many requests
  if (error.response && error.response.status == 429)
    return performExponentialBackoff(api, error);

  return Promise.reject(error);
});

function performExponentialBackoff(api, err) {
  var config = err.config;
  console.log(
    "performing exponential backoff. retry count: ",
    config.__retryCount
  );

  // If config does not exist or the retry option is not set, reject
  if (!config || !config.retry) return Promise.reject(err);

  config.__retryCount = config.__retryCount || 0;

  if (config.__retryCount >= config.retry) return Promise.reject(err);

  config.__retryCount += 1;

  var backoff = new Promise((resolve) => {
    setTimeout(function () {
      resolve();
    }, config.retryDelay || 1);
  });

  return backoff.then(() => api(config));
}

class Api {
  constructor({ key, useScraper = false }) {
    this.key = key;
    this.useScraper = useScraper;
  }

  async musicVideoSearch({ q, useScraper = false }) {
    return this.useScraper
      ? await scraper.musicVideoSearch({ q })
      : await this._musicVideoSearch({ q });
  }

  async channelSearch({ q, useScraper = false }) {
    return this.useScraper
      ? await scraper.channelSearch({ q })
      : await this._channelSearch({ q });
  }

  async _musicVideoSearch({ q }) {
    const params = {
      q,
      key: this.key,
      part: "snippet",
      type: "video",
      maxResults: 50,
      videoCategoryId: "10",
    };
    const response = await api.get("/search", { params, ...defaultConfig });
    return response.data;
  }

  async _channelSearch({ q }) {
    const params = {
      q,
      key: this.key,
      part: "snippet",
      type: "channel",
      maxResults: 50,
    };
    const response = await api.get("/search", { params, ...defaultConfig });
    return response.data;
  }

  async getChannelDetails({ id }) {
    const params = {
      id: id,
      key: this.key,
      part: "snippet,contentDetails",
      maxResults: 50,
    };
    const response = await api.get("/channels", { params, ...defaultConfig });
    return response.data;
  }

  async getDetailsForVideos({ ids }) {
    if (ids.length > 50)
      throw new Error("Could not get video details: too many ids submitted");
    const params = {
      id: ids.join(","),
      key: this.key,
      part: "contentDetails,statistics,snippet",
      maxResults: 50,
    };
    const response = await api.get("/videos", { params, ...defaultConfig });
    return response.data;
  }

  async getPlaylistItems({ id, pageToken }) {
    const params = {
      playlistId: id,
      key: this.key,
      part: "snippet,contentDetails,status",
      maxResults: 50,
      pageToken,
    };
    const response = await api.get("/playlistItems", {
      params,
      ...defaultConfig,
    });
    return response.data;
  }
}

module.exports = (attrs) => new Api(attrs);
