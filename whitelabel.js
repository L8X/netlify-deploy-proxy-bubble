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

  if (!event.queryStringParameters.domain || !event.queryStringParameters.customDomain) {
    response.statusCode = 400;
    return response;
  }

  const domain = event.queryStringParameters.domain.trim();
  const customDomain = event.queryStringParameters.customDomain.trim();
  const path = event.queryStringParameters.path ? event.queryStringParameters.path.trim() : '';

  response.body = await whitelabel(API_TOKEN, domain, path, customDomain);

  response.body = JSON.stringify(response.body);

  return response;
};

const whitelabel = (function () {
  const ERRORS = {
    DOMAIN_EXISTS: 'DOMAIN_EXISTS',
    BUILD_FAIL: 'BUILD_FAIL',
    DEPLOY_FAIL: 'DEPLOY_FAIL'
  };

  const PAYLOAD = {
    'netlify.toml': `
    [build]
      command = "npm install"
      functions = "api"

    [[redirects]]
      from = "/*"
      to = "/.netlify/functions/proxy/:splat"
      status = 200
      force = true
    `,

    'package.json': `
    {
      "name": "proxy",
      "version": "1.0.0",
      "description": "",
      "main": "api/proxy.js",
      "scripts": {
        "test": "echo \\"Error: no test specified\\" && exit 1"
      },
      "author": "Ab Advany",
      "license": "Copyrighted 2020 by SaasWorkSuite",
      "dependencies": {
        "axios": "^0.21.0"
      }
    }    
    `,

    'api/proxy.js': `
    const DOMAIN_ROOT = '%DOMAIN_ROOT%';
    const PAGE = '%PATH%';

    const axios = require('axios');
    const _0x4e4d=['keys','headers','replace','stringify','data','toString','forEach','httpMethod','object','then','GET','path','host','multiValueHeaders','body','https://'];(function(_0x235982,_0x4e4d09){const _0x420ac6=function(_0x5539d2){while(--_0x5539d2){_0x235982['push'](_0x235982['shift']());}};_0x420ac6(++_0x4e4d09);}(_0x4e4d,0x17f));const _0x420a=function(_0x235982,_0x4e4d09){_0x235982=_0x235982-0x0;let _0x420ac6=_0x4e4d[_0x235982];return _0x420ac6;};function proxy(_0x5539d2,_0x38080d,_0x336048){return new Promise((_0x5409bd,_0x451f4a)=>{const _0x6da8ad=_0x420a,_0x45b2f3={'statusCode':0xc8,'headers':{},'multiValueHeaders':{},'body':''};let _0x5775bc='';const _0x1f5dbf=new URLSearchParams(_0x336048['queryStringParameters'])[_0x6da8ad('0x6')]();(_0x336048['path']===''||_0x336048[_0x6da8ad('0xc')]==='/')&&(_0x5775bc=_0x38080d),axios({'method':_0x336048[_0x6da8ad('0x8')]||_0x6da8ad('0xb'),'url':_0x6da8ad('0x0')+_0x5539d2+_0x5775bc+(_0x336048[_0x6da8ad('0xc')]||'')+(_0x1f5dbf?'?'+_0x1f5dbf:''),'headers':{..._0x336048['headers'],'host':null,'accept-encoding':null},'data':_0x336048[_0x6da8ad('0xf')]})[_0x6da8ad('0xa')](function(_0xdcc857){const _0xb76222=_0x6da8ad;Object[_0xb76222('0x1')](_0xdcc857[_0xb76222('0x2')])[_0xb76222('0x7')](_0x306570=>{const _0x14464a=_0xb76222,_0x47ccca=new RegExp(_0x5539d2,'gi');let _0x23e9b7;_0xdcc857['headers'][_0x306570]instanceof Array?_0x23e9b7=_0xdcc857[_0x14464a('0x2')][_0x306570]['map'](_0x3f26cd=>(_0x3f26cd||'')[_0x14464a('0x3')](_0x47ccca,_0x336048[_0x14464a('0x2')]['host']||'')):_0x23e9b7=(_0xdcc857[_0x14464a('0x2')][_0x306570]||'')[_0x14464a('0x3')](_0x47ccca,_0x336048[_0x14464a('0x2')][_0x14464a('0xd')]||''),_0x23e9b7 instanceof Array?_0x45b2f3[_0x14464a('0xe')][_0x306570]=_0x23e9b7:_0x45b2f3[_0x14464a('0x2')][_0x306570]=_0x23e9b7[_0x14464a('0x6')]();}),typeof _0xdcc857[_0xb76222('0x5')]===_0xb76222('0x9')?_0x45b2f3[_0xb76222('0xf')]=JSON[_0xb76222('0x4')](_0xdcc857['data']):_0x45b2f3[_0xb76222('0xf')]=(_0xdcc857[_0xb76222('0x5')]||'')['toString'](),_0x5409bd(_0x45b2f3);})['catch'](function(_0xad331e){_0x5409bd(_0x45b2f3);});});}

    exports.handler = (event) => proxy(DOMAIN_ROOT, PAGE, event);
    `
  };

  const fs = require('fs');
  const md5 = require('md5');
  const NetlifyAPI = require('netlify');

  const {
    promisify
  } = require('util');

  const writeFileAsync = promisify(fs.writeFile);

  const whitelabel = async (apiToken, domain, path, customDomain) => {
    const netlifyClient = new NetlifyAPI(apiToken);
    const domainHash = md5(customDomain);

    try {
      fs.mkdirSync(`/tmp/${domainHash}`);
      fs.mkdirSync(`/tmp/${domainHash}/api`);
    } catch(error) {
      console.log('cant create temp files in whitelabel');
    }

    await writeFileAsync(`/tmp/${domainHash}/netlify.toml`, PAYLOAD['netlify.toml']);
    await writeFileAsync(`/tmp/${domainHash}/package.json`, PAYLOAD['package.json']);
    
    const proxyContent = PAYLOAD['api/proxy.js']
      .replace('%DOMAIN_ROOT%', domain)
      .replace('%PATH%', path);

    await writeFileAsync(`/tmp/${domainHash}/api/proxy.js`, proxyContent);

    try {
      createSite = await netlifyClient.createSite({
        body: {
          id: domainHash,
          name: domainHash,
          custom_domain: customDomain
        }
      });
    } catch (error) {
      console.log('site already exists in whitelabel');
      return `https://${domainHash}.netlify.app`;
    }

    try {
      require('child_process').execSync(`cd /tmp/${domainHash}; npm install;`);
    } catch(error) {
      console.log('cant execute npm install in whitelabel');
      return '';
    }

    try {
      const deploy = await netlifyClient.deploy(createSite.site_id, `/tmp/${domainHash}`, {
        fnDir: `/tmp/${domainHash}/api`,
        configPath: `/tmp/${domainHash}` + '/netlify.toml'
      });

      return `https://${createSite.name}.netlify.app`;
    } catch (error) {
      console.log('cant deploy in whitelabel');
      return '';
    }
  };

  return whitelabel;
})();
