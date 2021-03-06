let mcache = require('memory-cache');

// Thanks to Guilherme Oenning
// https://goenning.net/2016/02/10/simple-server-side-cache-for-expressjs/

let cache = (duration) => {
  return (req, res, next) => {
    let key = `__express__${req.originalUrl || req.url}`;
    let cachedBody = mcache.get(key);
    // TODO: how can we handle caching, but still load logged in user data on
    // the page?
    if (cachedBody && res.locals && !res.locals.isLoggedIn) {
      res.send(cachedBody)
      return
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body);
      }
      next();
    }
  }
}

module.exports = {
  cache
};
