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

  response.body = await checkdns(API_TOKEN, domain);

  response.body = JSON.stringify(response.body);

  return response;
};

const checkdns = (function () {
  const md5 = require('md5');
  const axios = require('axios');
  const NetlifyAPI = require('netlify');

  const checkdns = async (apiToken, domain) => {
    const netlifyClient = new NetlifyAPI(apiToken);
    const domainHash = md5(domain);

    let listSites = [];

    try {
      listSites = await netlifyClient.listSites();
    } catch (error) {
      console.log('no site found in checkdns');
      return '';
    }

    const site = listSites.find(site => site.name === domainHash);
    if(!site) {
      console.log('no site found in checkdns');
      return '';
    }

    try {
      const verifyResult = await axios.get(`https://api.netlify.com/api/v1/sites/${site.id}/ssl/verify_custom_domain`, {
      headers: {
        authorization: `Bearer ${apiToken}`
      }
    });

    return verifyResult.data;
    } catch(error) {
      console.log('error in checkdns');
      return '';
    }
    
  };

  return checkdns;
})();
