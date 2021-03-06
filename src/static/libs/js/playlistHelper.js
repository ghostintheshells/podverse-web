import { sendGoogleAnalyticsEvent } from './googleAnalytics.js';
import { isNonAnonLoggedInUser } from './utility.js';

export function togglePlaylistWidget (_this) {
  sendGoogleAnalyticsEvent('Playlist', 'Toggle Playlist Widget');

  if (!isNonAnonLoggedInUser()) {
    alert('Login to create a playlist.');
    return;
  }

  if ($('#make-clip').css('display') !== 'block' && $('#recommend').css('display') !== 'block') {
    $('#player-description-truncated').hide();
    $('#player-description-full').hide();
    $('#player-description-show-more').hide();
    $('#player-clip-time').hide();
    $('.player-clip-edit').hide();
    $('#player-description-show-more').html(`<span class="text-primary">Show Notes</span>`);
    $('#playlist').hide();
  }

  if ($(_this).hasClass('active')) {
    $('#player-description-truncated').show();
    $('#player-description-show-more').show();
    $('#player-clip-time').show();
    $('.player-clip-edit').show();
    $('#playlist').show();
  }

  $('#make-clip').hide();
  $('#toggle-make-clip-btn').removeClass('active');

  $('#toggle-playlist-btn').toggleClass('active');
  $('#add-to-playlist').toggle();
}

export function createPlaylist (params, callback) {
  if (params.title === '') {
    alert('Please provide a playlist title.');
    return false;
  }

  $.ajax({
    type: 'POST',
    url: '/playlists/',
    headers: {
      Authorization: $.cookie('idToken')
    },
    data: {
      title: params.title,
      ownerName: params.ownerName
    },
    success: function (response) {
      if (callback) {
        callback(response);
      }
    },
    error: function (xhr, status, error) {
      alert('Failed to create playlist. Please check your internet connection and try again.');
    }
  });

  sendGoogleAnalyticsEvent('Playlist', 'Create Playlist');
}

export function addToPlaylist (playlistId, mediaRefId, callback) {

  $.ajax({
    type: 'POST',
    url: '/playlists/' + playlistId + '/addItem',
    headers: {
      Authorization: $.cookie('idToken')
    },
    data: {
      mediaRefId: mediaRefId
    },
    success: function (response) {
      if (callback) {
        callback(response);
      }
    },
    error: function (xhr, status, error) {
      alert('Failed to add to playlist. Please check your internet connection and try again.');
    }
  });

  sendGoogleAnalyticsEvent('Playlist', 'Add to Playlist');
}

export function removeFromPlaylist (playlistId, mediaRefId, callback) {
  $.ajax({
    type: 'POST',
    url: '/playlists/' + playlistId + '/removeItem',
    headers: {
      Authorization: $.cookie('idToken')
    },
    data: {
      mediaRefId: mediaRefId
    },
    success: function (response) {
      if (callback) {
        callback(response);
      }
    },
    error: function (xhr, status, error) {
      alert('Failed to remove from playlist. Please check your internet connection and try again.');
    }
  });

  sendGoogleAnalyticsEvent('Playlist', 'Remove from Playlist');
}

export function updatePlaylistItemCount(playlistId, total) {
  if (total) {
    $(".add-to-playlist-item[data-id=" + playlistId + "] .add-to-playlist-item-count-text")
      .html('items: ' + total);
  }
}

export function updateClipCreatedPlaylistItemCount(playlistId, total) {
  if (total) {
    $(".clip-created-modal-playlist[data-id=" + playlistId + "] .clip-created-modal-playlist-count-text")
      .html('items: ' + total);
  }
}

export function addNewPlaylistElement(playlist) {
  var playlistId = playlist.id,
      playlistTitle = playlist.title,
      isRecommendation = playlist.isRecommendation;

  // Create and prepend the new playlist in the main add to playlist / recommend menus
  var el = '<div class="add-to-playlist-item" data-id="' + playlistId +'">';
      el +=   ('<a class="add-to-playlist-item-link" href="/playlists/' + playlistId + '">');
      el +=     '<i class="fa fa-link"></i>';
      el +=   '</a>';
      el +=   '<div class="add-to-playlist-item-text">';
      el +=     '<div class="add-to-playlist-item-count">';
      el +=       '<span class="add-to-playlist-item-count-text">items: 0</span>';
      el +=       '<span class="add-to-playlist-item-pending">';
      el +=         '<i class="fa fa-spinner fa-spin"></i>';
      el +=       '</span>';
      el +=     '</div>';
      el +=     '<div class="add-to-playlist-item-title">';
      el +=       playlistTitle;
      el +=     '</div>';
      el +=   '</div>'
      el += '</div>';

  if (isRecommendation) {
    $('#recommend .col-xs-12').prepend(el);
  } else {
    $("#add-to-playlist .col-xs-12").prepend(el);
  }

  $(".add-to-playlist-item[data-id=" + playlistId + "] .add-to-playlist-item-text").on('click', function () {
    var playlistId = $(this).parent().data('id');
    var mediaRefId = $('#player').attr('data-id'); // $('#player').data('id') failed to grab updated values
    toggleAddToPlaylistItemPending(playlistId);
    addToPlaylist(playlistId, mediaRefId, function (updatedPlaylistItemCount) {
      setTimeout(function() {
        toggleAddToPlaylistItemPending(playlistId);
        updatePlaylistItemCount(playlistId, updatedPlaylistItemCount);
        updateClipCreatedPlaylistItemCount(playlistId, updatedPlaylistItemCount);
      }, 200);
    });
  })

  // Also create and prepend playlist in the clip created modal
  $(".clip-created-modal-playlist[data-id=" + playlistId + "] .clip-created-modal-playlist-link").on('click', function () {
    var playlistId = $(this).parent().data('id');
    window.location.href = '/playlists/' + playlistId;
  });

  var playlistId = playlist.id,
      playlistTitle = playlist.title,
      isRecommendation = playlist.isRecommendation;

  var el = '<div class="clip-created-modal-playlist" data-id="' + playlistId +'">';
      el +=   '<div class="clip-created-modal-playlist-count">';
      el +=     '<span class="clip-created-modal-playlist-count-text">items: 0</span>';
      el +=     '<span class="clip-created-modal-playlist-pending">';
      el +=       '<i class="fa fa-spinner fa-spin"></i>'
      el +=     '</span>';
      el +=   '</div>';
      el +=   '<div class="clip-created-modal-playlist-title">';
      el +=     playlistTitle
      el +=   '</div>';
      el += '</div>';

  if (isRecommendation) {
    $('#clip-created-modal-recommend-menu').prepend(el);
  } else {
    $('#clip-created-modal-add-to-playlist-menu').prepend(el);
  }

  $(".clip-created-modal-playlist[data-id=" + playlistId + "]").on('click', function () {
    var playlistId = $(this).data('id');
    var mediaRefId = $('#clip-created-modal').attr('data-id');
    toggleClipCreatedAddToPlaylistItemPending(playlistId);
    addToPlaylist(playlistId, mediaRefId, function (updatedPlaylistItemCount) {
      setTimeout(function() {
        toggleClipCreatedAddToPlaylistItemPending(playlistId);
        updatePlaylistItemCount(playlistId, updatedPlaylistItemCount);
        updateClipCreatedPlaylistItemCount(playlistId, updatedPlaylistItemCount);
      }, 200);
    });
  })

}

function toggleAddToPlaylistItemPending (playlistId) {
  $(".add-to-playlist-item[data-id=" + playlistId + "]").toggleClass('pending');
}

function toggleClipCreatedAddToPlaylistItemPending (playlistId) {
  $(".clip-created-modal-playlist[data-id=" + playlistId + "]").toggleClass('pending');
}

export function subscribeToPlaylist(url, successCallback) {
  var id = url.substr(url.lastIndexOf('/') + 1);

  $.ajax({
    type: 'POST',
    url: '/playlists/subscribe/' + id,
    headers: {
      Authorization: $.cookie('idToken')
    },
    success: function (res) {
      if (successCallback) { successCallback(); }
    },
    error: function (xhr, status, error) {
      alert('Failed to subscribe to playlist. Please check your internet connection and try again.');
    }
  });

  sendGoogleAnalyticsEvent('Playlist', 'Subscribe to Playlist');
}

export function unsubscribeFromPlaylist (url, successCallback) {
  var id = url.substr(url.lastIndexOf('/') + 1);

  $.ajax({
    type: 'POST',
    url: '/playlists/unsubscribe/' + id,
    headers: {
      Authorization: $.cookie('idToken')
    },
    success: function (res) {
      if (successCallback) { successCallback(); }
    },
    error: function (xhr, status, error) {
      alert('Failed to unsubscribe from playlist. Please check your internet connection and try again.');
    }
  });

  sendGoogleAnalyticsEvent('Playlist', 'Unsubscribe to Playlist');
}

export function togglePlaylistEditView() {
  if ($('#playlist-edit small').html() === 'edit') {
    $('.playlist-item').addClass('edit-view');
    $('#playlist-edit').html('<small>done</small> <i class="fa fa-check"></i>');
  } else {
    $('.playlist-item').removeClass('edit-view');
    $('#playlist-edit').html('<small>edit</small> <i class="fa fa-gear"></i>');
  }
}

export function scrapeElementsAndAddToPlaylist (_this) {
  var playlistId,
      mediaRefId;

  if ($(_this).hasClass('clip-created-modal-playlist')) {
    playlistId = $(_this).data('id');
    mediaRefId = $('#clip-created-modal').attr('data-id');
    toggleClipCreatedAddToPlaylistItemPending(playlistId);
  } else {
    playlistId = $(_this).parent().data('id');
    mediaRefId = $('#player').attr('data-id'); // $('#player').data('id') failed to grab updated values
    toggleAddToPlaylistItemPending(playlistId);
  }

  addToPlaylist(playlistId, mediaRefId, function (updatedPlaylistItemCount) {
    if ($(_this).hasClass('clip-created-modal-playlist')) {
      setTimeout(function() {
        toggleClipCreatedAddToPlaylistItemPending(playlistId);
      }, 200);
    } else {
      setTimeout(function() {
        toggleAddToPlaylistItemPending(playlistId);
      }, 200);
    }

    setTimeout(function() {
      updatePlaylistItemCount(playlistId, updatedPlaylistItemCount);
      updateClipCreatedPlaylistItemCount(playlistId, updatedPlaylistItemCount);
    }, 200);
  });
}
