const API_TOKEN = 'VOuT4dJrmvR8j7wp-0AABytmalJ39dtnBqLILez_Kz4';

exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    headers: {
      'content-type': 'application/json',
    },
    body: ''
  };

  if (!event.httpMethod === 'GET') {
    response.statusCode = '405';
    return response;
  };

  if (!event.queryStringParameters.domain) {
    response.statusCode = 400;
    return response;
  }

  const domain = event.queryStringParameters.domain.trim();

  response.body = await getdns(API_TOKEN, domain);

  response.body = JSON.stringify(response.body);

  return response;
};

const getdns = (function () {
  const md5 = require('md5');
  const NetlifyAPI = require('netlify');

  const getdns = async (apiToken, domain) => {
    const netlifyClient = new NetlifyAPI(apiToken);
    const domainHash = md5(domain);

    let listSites = [];

    try {
      listSites = await netlifyClient.listSites();
    } catch (error) {
      return '';
    }

    const site = listSites.find(site => site.name === domainHash);
    if(!site) {
      return '';
    }

    return {
      'alias': `${site.name}.netlify.app.`
    };
  };

  return getdns;
})();