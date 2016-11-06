require('../../navbar.js');
require('../../auth.js');

import { subscribeToPodcast } from '../../podcastHelper.js';
import { unsubscribeFromPodcast } from '../../podcastHelper.js';

import { isNonAnonLoggedInUser } from '../../utility.js';

$('#podcast-subscribe').on('click', function () {
  if (!isNonAnonLoggedInUser()) {
    alert('Please login to subscribe to this podcast.');
    return;
  }

  if ($(this).children().hasClass('fa-star-o')) {
    $('#podcast-subscribe').html('<i class="fa fa-star"></i>');
    $('#podcast-subscribe').attr('title', 'Unsubscribe from podcast');
    subscribeToPodcast(podcastId);
  } else {
    $('#podcast-subscribe').html('<i class="fa fa-star-o"></i>');
    $('#podcast-subscribe').attr('title', 'Subscribe to podcast');
    unsubscribeFromPodcast(podcastId);
  }
});

$('#podcast-summary-truncated').truncate({ lines: 4 });
$('#podcast-summary-truncated, #podcast-summary-full').on('click', function () {
  $('#podcast-summary-truncated, #podcast-summary-full').toggle();
})

$(document).ready(function ($) {
  $('.clickable-row').click(function() {
    window.location = $(this).data('href');
  });
});

$('#hide-until-truncation-finishes').hide();