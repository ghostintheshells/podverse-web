const SqlEngine = require('repositories/sequelize/engineFactory.js');
const registerModels = require('repositories/sequelize/models');

const {locator} = require('locator.js');
const appFactory = require('appFactory.js');
const PodcastService = require('services/podcast/PodcastService.js');
const PlaylistService = require('services/playlist/PlaylistService.js');

const {createToken} = new (require('services/auth/AuthService.js'))();

function configureDatabaseModels (resolve) {

  beforeEach(function (done) {

    this._sqlEngine = new SqlEngine({storagePath: ':memory:'});
    const Models = registerModels(this._sqlEngine);

    this._sqlEngine.sync()
      .then(() => {
        locator.set('Models', Models);
        resolve.apply(this, [Models]);
        done();
      });
  });

  afterEach(function (done) {
    locator.set('Models', undefined);
    this._sqlEngine.dropAllSchemas()
      .then(() => done());
  });
}

function createTestApp (Models) {
  return appFactory({
    podcastService: new PodcastService({Models: Models}),
    playlistService: new PlaylistService({Models: Models})
  });
}

function createValidTestJWT () {

  const fakeReq = {
    body: {
      username: 'curly@podverse.fm'
    }
  }

  return createToken(fakeReq);
}

function createTestPodcastAndEpisode (Models) {

  const {Podcast, Episode} = Models;

  return Podcast.create({'feedURL': 'http://example.com/test333'})
    .then(podcast => {

      return Promise.all([
        Promise.resolve(podcast),
        Episode.create({
          podcastId: podcast.id,
          mediaURL: 'http://example.com/test333'
        })
      ]);
    });
}

function createTestPlaylist (Models) {

  const {Playlist} = Models;

  return Playlist.create({
    'title': 'Abobo smash',
    'slug': 'abobo-slug',
    'ownerId': 'abobo'
  });

}

module.exports = {
  configureDatabaseModels,
  createTestApp,
  createValidTestJWT,
  createTestPodcastAndEpisode,
  createTestPlaylist
};