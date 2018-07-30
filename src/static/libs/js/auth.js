import { sendGoogleAnalyticsEvent } from './googleAnalytics.js';
import { getParameterByName } from './utility';

var clientId = __AUTH0_CLIENTID__,
    domain = __AUTH0_DOMAIN__,
    customDomain = __AUTH0_CUSTOM_DOMAIN__;

// Auth0Lock stuff
var options = {
  allowShowPassword: false,
  usernameStyle: 'email',
  configurationBaseUrl: 'https://cdn.auth0.com',
  overrides: {
    __tenant: customDomain,
    __token_issuer: domain
  },
  auth: {
    params: {
      scope: 'openid name email user_metadata'
    },
    responseType: 'token',
    redirect: true,
    redirectUrl: __BASE_URL__ + '/login-redirect?redirectTo=' + location.href
  },
  additionalSignUpFields: [{
    name: 'name',
    placeholder: 'your name (public)'
  }],
  theme: {
    primaryColor: '#2968B1'
  },
  languageDictionary: {
    emailInputPlaceholder: "email address",
    passwordInputPlaceholder: "password"
  },
};

let lock = new Auth0Lock.default(clientId, domain, options);

$(window).ready(() => {
  $('#login-btn').on('click', () => {
      lock.show();
      sendGoogleAnalyticsEvent('Auth', 'Show Lock Modal');
  });
});

lock.on('authenticated', function (authResult) {

  debugger;

  // Remove # from end of url
  window.location.replace("#");
  if (typeof window.history.replaceState == 'function') {
    history.replaceState({}, '', window.location.href.slice(0, -1));
  }

  lock.getProfile(authResult.accessToken, function (error, profile) {

    if (error) {
      alert('Authentication error. Please check your internet connection and try again.');
      return;
    }

    $.cookie('user_id', authResult.idTokenPayload.user_id, {
      secure: __IS_PROD__,
      path: '/',
      expires: 365
    });

    $.cookie('idToken', authResult.idToken, {
      secure: __IS_PROD__,
      path: '/',
      expires: 365
    });

    findOrCreateUserOnServer(profile);
  })
});

lock.on('unrecoverable_error', (err) => {
  debugger;
  console.log(err);
  alert('Authentication error. Please check your internet connection and try again.');
});

lock.on('authorization_error', (err) => {
  debugger;
  console.log(err);
  alert('Authentication error. Please check your internet connection and try again.');
});



function findOrCreateUserOnServer (profile) {
  var name = profile.user_metadata && profile.user_metadata.name;

  $.ajax({
    beforeSend: function (request) {
      request.setRequestHeader('Authorization', $.cookie('idToken'));
    },
    type: 'POST',
    url: '/users',
    data: {
      name: name,
      nickname: profile.nickname
    },
    dataType: 'json',
    success: function () {
      console.log('success')
      const redirectUrl = getParameterByName('redirectTo');
      window.location.href = redirectUrl;
    },
    error: function (err) {
      console.log('errrrror');
      
      console.log(err);
    }
  });

}

export function logoutUser () {
  $.removeCookie('idToken', { path: '/' });
  sendGoogleAnalyticsEvent('Auth', 'Logout User');
  location.reload();
}
