const axios = require('axios');

const DOMAIN_ROOT = 'test.saasworksuite.com';
const PAGE = '/index2';

exports.handler = (event) => {
  return new Promise((resolve, reject) => {
    const response = {
      statusCode: 200,
      headers: {},
      multiValueHeaders: {},
      body: ''
    };

    let pre = '';

    const queryString = new URLSearchParams(event.queryStringParameters).toString();

    if(event.path === '' || event.path === '/') {
      pre = PAGE;
    }

    axios({
      method: event.httpMethod || 'GET',
      url: `https://${DOMAIN_ROOT}${pre}${event.path || ''}${queryString ? ('?' + queryString) : ''}`,
      headers: {
        ...event.headers,
        host: null,
        'accept-encoding': null
      },
      data: event.body,
    }).then(function (axiosResponse) {
      Object.keys(axiosResponse.headers).forEach((headerKey) => {
        const regex = new RegExp(DOMAIN_ROOT, 'gi');
        let headerValue;

        if (axiosResponse.headers[headerKey] instanceof Array) {
          headerValue = axiosResponse.headers[headerKey].map(value => (value || '').replace(regex, event.headers.host || ''))
        } else {
          headerValue = (axiosResponse.headers[headerKey] || '').replace(regex, event.headers.host || '');
        }

        if(headerValue instanceof Array) {
          response.multiValueHeaders[headerKey] = headerValue;
        } else {
          response.headers[headerKey] = headerValue.toString();
        }
      });

      if (typeof axiosResponse.data === 'object') {
        response.body = JSON.stringify(axiosResponse.data);
      } else {
        response.body = (axiosResponse.data || '').toString();
      }

      resolve(response);
    }).catch(function (error) {
      resolve(response);
    });
  });
}
