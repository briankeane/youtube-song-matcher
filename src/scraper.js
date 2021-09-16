const youtube = require("scrape-youtube").default;

async function musicVideoSearch({ q }) {
  const data = await youtube.search(q);
  return {
    items: data.videos.map((videoData) => scraperVideoToApiVideo(videoData)),
  };
}

async function channelSearch({ q }) {
  const data = await youtube.search(q, { type: "channel" });
  return {
    items: data.channels.map((channelData) =>
      scraperChannelToApiChannel(channelData)
    ),
  };
}

/*
 * Helper functions
 */
function scraperVideoToApiVideo(data) {
  return {
    id: { kind: "youtube#video", videoId: data.id },
    snippet: {
      title: data.title,
      description: data.description,
      channelTitle: data.channel ? data.channel.name : undefined,
    },
    durationMS: data.duration ? data.duration * 1000 : undefined,
    description: data.description,
  };
}

function scraperChannelToApiChannel(data) {
  return {
    id: { kind: "youtube#channel", channelId: data.id },
    snippet: {
      channelId: data.id,
      title: data.name,
      description: data.description,
      channelTitle: data.name,
    },
  };
}

module.exports = {
  musicVideoSearch,
  channelSearch,
};
