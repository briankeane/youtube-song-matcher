// taken from http://stackoverflow.com/questions/22148885/converting-youtube-data-api-v3-video-duration-format-to-seconds-in-javascript-no
function youTubeTimeToMS(duration) {
  var a = duration.match(/\d+/g);

  if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
    a = [0, a[0], 0];
  }

  if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
    a = [a[0], 0, a[1]];
  }
  if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
    a = [a[0], 0, 0];
  }

  duration = 0;

  if (a.length == 3) {
    duration = duration + parseInt(a[0]) * 3600;
    duration = duration + parseInt(a[1]) * 60;
    duration = duration + parseInt(a[2]);
  }

  if (a.length == 2) {
    duration = duration + parseInt(a[0]) * 60;
    duration = duration + parseInt(a[1]);
  }

  if (a.length == 1) {
    duration = duration + parseInt(a[0]);
  }
  return duration * 1000;
}

// returns an integer.  0 = perfect match, 1.5 and up pretty good, 5 and up no way
function stringDistance(s1, s2) {
  // lowercase
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  // remove intro 'the ' if it's there
  s1 = removeThe(s1);
  s2 = removeThe(s2);

  if (s1 == null || s1.length === 0) {
    if (s2 == null || s2.length === 0) {
      return 0;
    } else {
      return s2.length;
    }
  }

  if (s2 == null || s2.length === 0) {
    return s1.length;
  }

  var c = 0;
  var offset1 = 0;
  var offset2 = 0;
  var lcs = 0;
  var maxOffset = 5;

  while ((c + offset1 < s1.length) && (c + offset2 < s2.length)) {
    if (s1.charAt(c + offset1) == s2.charAt(c + offset2)) {
      lcs++;
    } else {
      offset1 = 0;
      offset2 = 0;
      for (var i = 0; i < maxOffset; i++) {
        if ((c + i < s1.length) && (s1.charAt(c + i) == s2.charAt(c))) {
          offset1 = i;
          break;
        }
        if ((c + i < s2.length) && (s1.charAt(c) == s2.charAt(c + i))) {
          offset2 = i;
          break;
        }
      }
    }
    c++;
  }
  return (s1.length + s2.length) / 2 - lcs;
}

function removeThe(word) {
  if (word.toLowerCase().substr(0,4) == 'the ') {
    return word.substr(4);
  }
  return word;
}

module.exports = {
  youTubeTimeToMS,
  stringDistance
};