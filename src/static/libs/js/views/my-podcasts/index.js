require('../../navbar.js');
require('../../auth.js');

import { subscribeToPodcast } from '../../podcastHelper.js';
import { unsubscribeFromPodcast } from '../../podcastHelper.js';



$('.podcast-item-subscribe').on('click', function () {
  if ($(this).children().hasClass('fa-star-o')) {
    $(this).html('<i class="fa fa-star"></i>');
    var podcastId = $(this).parent().data('id');
    subscribeToPodcast(podcastId);
  } else {
    $(this).html('<i class="fa fa-star-o"></i>');
    var podcastId = $(this).parent().data('id');
    unsubscribeFromPodcast(podcastId);
  }
});

$('#hide-until-truncation-finishes').hide();