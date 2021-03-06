import { copyToClipboard } from './copyToClipboard.js';
import { sendGoogleAnalyticsEvent } from './googleAnalytics.js';
import { scrapeElementsAndAddToPlaylist } from './playlistHelper.js';

function clipCreatedCopyUrl () {
  copyToClipboard(document.getElementById('clip-created-modal-link'));
  $('#clip-created-modal-copy-btn').html('Copied Link!');
  setTimeout(function () {
    $('#clip-created-modal-copy-btn').html('<i class="fa fa-copy"></i>&nbsp; Copy');
    $('#clip-created-modal-copy-btn').blur();
    if (!$('#clip-created-modal').hasClass('is-logged-in')) {
      $('#clip-created-modal').modal('hide');
    }
  }, 1250);

  sendGoogleAnalyticsEvent('Clip Created Modal', 'Copy Link');
}

function toggleAddToPlaylistMenu () {
  $('#clip-created-modal-recommend-btn').removeClass('selected');
  $('#clip-created-modal-recommend-menu').hide();

  $('#clip-created-modal-add-to-playlist-btn').toggleClass('selected');
  $('#clip-created-modal-add-to-playlist-menu').toggle();
}

$('#clip-created-modal-copy-btn').on('click', function () {
  clipCreatedCopyUrl();
});

$('#clip-created-modal-add-to-playlist-btn').on('click', function () {
  toggleAddToPlaylistMenu();
});

// Playlist Item onclick events
$('.clip-created-modal-playlist').on('click', function () {
  scrapeElementsAndAddToPlaylist(this);
});
