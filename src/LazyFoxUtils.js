const lineDecoder = (t) => {
  let points = [];
  for (let step of t) {
    let encoded = step.polyline.points;
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;
    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      let dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({ latitude: (lat / 1E5), longitude: (lng / 1E5) });
    }
  }
  return points;
};

const foxArray = (arr) => {
  const chunk = (size) => {
    if (size < 1) throw new Error('Size must be positive');

    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };
  return { chunk };
};

const getLocation = (arr) => {
  let temp = [];
  for (let i = 0; i < arr.length; i++) {
    temp.push(`${arr[i].latitude},${arr[i].longitude}`);
  }
  return temp;
};


const WaitingFrameRefresh = () => {
  return new Promise(function (resolve, reject) {
    requestAnimationFrame(function () {
      resolve();
    });
  });
};

/* Applies `fn` to each element of `collection`, iterating once per frame */
WaitingFrameRefresh.mapInFrames = function (collection, fn) {
  var queue = Promise.resolve();
  var values = [];
  collection.forEach((item) => {
    queue = queue.then(() => nextFrame().then(() => values.push(fn(item))));
  });
  return queue.then(() => values);
};

export { lineDecoder, foxArray, getLocation, WaitingFrameRefresh };
