const lineDecoder = (t, e) => {
    for (var n, o, u = 0, l = 0, r = 0, d = [], h = 0, i = 0, a = null, c = Math.pow(10, e || 5); u < t.length; ) {
      (a = null), (h = 0), (i = 0);
      do (a = t.charCodeAt(u++) - 63), (i |= (31 & a) << h), (h += 5);
      while (a >= 32);
      (n = 1 & i ? ~(i >> 1) : i >> 1), (h = i = 0);
      do (a = t.charCodeAt(u++) - 63), (i |= (31 & a) << h), (h += 5);
      while (a >= 32);
      (o = 1 & i ? ~(i >> 1) : i >> 1), (l += n), (r += o), d.push([l / c, r / c]);
    }
    return (d = d.map(function (t) {
      return { latitude: t[0], longitude: t[1] };
    }));
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
  
  export { lineDecoder, foxArray, getLocation };
  