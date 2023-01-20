const axios = require('axios');
const jwtDecode = require('jwt-decode');
const { deletePassword, getPassword, setPassword } = require('keytar');
const { userInfo } = require('os');
const { parse } = require('url');
const {
  AUTH0_APP_DOMAIN,
  AUTH0_AUDIENCE,
  AUTH0_CLIENT_ID,
  AUTH0_REDIRECT_URI,
} = require('../main/constants');

const keytarService = 'electron-openid-oauth';
const keytarAccount = userInfo().username;

let accessToken = null;
let profile = null;
let refreshToken = null;

function getAccessToken() {
  return accessToken;
}

function getProfile() {
  return profile;
}

function getAuthenticationURL() {
  return (
    'https://' +
    AUTH0_APP_DOMAIN +
    '/authorize?' +
    'audience=' +
    AUTH0_AUDIENCE +
    '&' +
    'scope=openid profile offline_access&' +
    'response_type=code&' +
    'client_id=' +
    AUTH0_CLIENT_ID +
    '&' +
    'redirect_uri=' +
    AUTH0_REDIRECT_URI
  );
}

async function refreshTokens() {
  const refreshToken = await getPassword(keytarService, keytarAccount);

  if (refreshToken) {
    const refreshOptions = {
      method: 'POST',
      url: `https://${AUTH0_APP_DOMAIN}/oauth/token`,
      headers: { 'content-type': 'application/json' },
      data: {
        grant_type: 'refresh_token',
        client_id: AUTH0_CLIENT_ID,
        refresh_token: refreshToken,
      },
    };

    try {
      const response = await axios(refreshOptions);

      accessToken = response.data.access_token;
      profile = jwtDecode(response.data.id_token);
    } catch (error) {
      await logout();

      throw error;
    }
  } else {
    throw new Error('No available refresh token.');
  }
}

async function loadTokens(callbackURL) {
  const urlParts = parse(callbackURL, true);
  const query = urlParts.query;

  const exchangeOptions = {
    grant_type: 'authorization_code',
    client_id: AUTH0_CLIENT_ID,
    code: query.code,
    redirect_uri: AUTH0_REDIRECT_URI,
  };

  const options = {
    method: 'POST',
    url: `https://${AUTH0_APP_DOMAIN}/oauth/token`,
    headers: {
      'content-type': 'application/json',
    },
    data: JSON.stringify(exchangeOptions),
  };

  try {
    const response = await axios(options);

    accessToken = response.data.access_token;
    profile = jwtDecode(response.data.id_token);
    refreshToken = response.data.refresh_token;

    if (refreshToken) {
      await setPassword(keytarService, keytarAccount, refreshToken);
    }
  } catch (error) {
    await logout();

    throw error;
  }
}

async function logout() {
  await deletePassword(keytarService, keytarAccount);
  accessToken = null;
  profile = null;
  refreshToken = null;
}

function getLogOutUrl() {
  return `https://${AUTH0_APP_DOMAIN}/v2/logout`;
}

module.exports = {
  getAccessToken,
  getAuthenticationURL,
  getLogOutUrl,
  getProfile,
  loadTokens,
  logout,
  refreshTokens,
};
