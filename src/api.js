const axios = require('axios');
const api = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3'
});

const defaultConfig = { responseType: 'json', retry: 20, retryDelay: 1000 };

api.interceptors.response.use(null, (error) => {
  // socket hang up
  if (error.code == 'ECONNRESET') 
    return performExponentialBackoff(api, error);
  
  // Too many requests
  if (error.response && error.response.status == 429) 
    return performExponentialBackoff(api, error);

  return Promise.reject(error);
});

function performExponentialBackoff(api, err) {
  var config = err.config;
  console.log('performing exponential backoff. retry count: ', config.__retryCount);

  // If config does not exist or the retry option is not set, reject
  if(!config || !config.retry) 
    return Promise.reject(err);
  
  config.__retryCount = config.__retryCount || 0;
  
  if(config.__retryCount >= config.retry) 
    return Promise.reject(err);
  
  config.__retryCount += 1;
  
  var backoff = new Promise((resolve) => {
    setTimeout(function() {
      resolve();
    }, config.retryDelay || 1);
  });
  
  return backoff.then(() => api(config));
}

class Api {
  constructor({ key }) {
    this.key = key;
  }

  async musicVideoSearch({ q }) {
    const params = {
      q,
      key: this.key,
      part: 'snippet',
      type: 'video',
      maxResults: 50,
      videoCategoryId: '10'
    };
    const response = await api.get('/search', { params, ...defaultConfig });
    return response.data;
  }

  async channelSearch({ q }) {
    const params = {
      q,
      key: this.key,
      part: 'snippet',
      type: 'channel',
      maxResults: 50   
    };
    const response = await api.get('/search', { params, ...defaultConfig });
    return response.data;
  }

  async getChannelDetail({ ids }) {
    const params = {
      id: ids,
      key: this.key,
      part: 'snippet,contentDetails',
      maxResults: 50   
    };
    const response = await api.get('/channels', { params, ...defaultConfig });
    return response.data;
  }

  async getDetailsForVideos({ ids }) {
    if (ids.length > 50) throw new Error('Could not get video details: too many ids submitted');
    const params = {
      id: ids,
      key: this.key,
      part: 'contentDetails,statistics,snippet',
      maxResults: 50
    };
    const response = await api.get('/videos', { params, ...defaultConfig });
    return response.data;
  }
}

module.exports = (attrs) => new Api(attrs);