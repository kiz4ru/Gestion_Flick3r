const express = require('express');
const querystring = require('querystring');
const crypto = require('crypto');
const cors = require('cors');
const OAuth = require('oauth-1.0a');
const fetch = require('node-fetch');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const session = require('express-session');
require('dotenv').config();
const app = express();
const port = 3000;
const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;
const redirectUri = 'http://localhost:3000/callback';
let open;

import('open').then((open) => {
  open.default('http://localhost:3000/authorize');
});


const oauth = OAuth({
  consumer: { key: apiKey, secret: apiSecret },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});



function getFilePaths(folderPath) {
  let filePaths = [];
  const filesInFolder = fs.readdirSync(folderPath);

  for (const file of filesInFolder) {
    const fullPath = path.join(folderPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      filePaths = [...filePaths, ...getFilePaths(fullPath)];
    } else {
      filePaths.push(fullPath);
    }
  }

  return filePaths;
}

app.use(session({
  secret: process.env.API_SECRET, // Llama a la variable de entorno SECRET desde el archivo .env
  resave: false,
  saveUninitialized: true,
}));


app.listen(port, () => {
  console.log(`Servidor web iniciado en http://localhost:${port}`);
});

app.use(express.static('public'));
app.use(cors());
app.options('*', cors());


app.get('/', (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;
  if (oauth_token && oauth_verifier) {
    res.redirect(`/callback?oauth_token=${oauth_token}&oauth_verifier=${oauth_verifier}`);
    return;
  }
  res.sendFile(path.join(__dirname, './static/index.html'));
});


app.get('/authorize', cors(), async (req, res) => {
  try {
    const request_data = {
      url: 'https://www.flickr.com/services/oauth/request_token',
      method: 'GET',
      data: {
        oauth_callback: redirectUri,
        oauth_consumer_key: apiKey,
        oauth_nonce: Math.floor(Math.random() * 1e12).toString(),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_version: '1.0',
      },
    };

    const authorization = oauth.authorize(request_data);
    request_data.headers = { Authorization: constructAuthHeader(authorization) };

    const response = await fetch(request_data.url, request_data);
    if (!response.ok) {
      throw new Error('Failed to authorize');
    }

    const responseData = await response.text();
    const parsedData = querystring.parse(responseData);
    const oauthToken = parsedData.oauth_token;
    const oauthTokenSecret = parsedData.oauth_token_secret;

    // Guarda oauthTokenSecret en la sesión
    req.session.oauthTokenSecret = oauthTokenSecret;

    res.redirect(`https://www.flickr.com/services/oauth/authorize?oauth_token=${oauthToken}&perms=write`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to authorize');
  }
});



app.get('/callback', cors(), async (req, res) => {
  try {
    const oauthToken = req.query.oauth_token;
    const oauthVerifier = req.query.oauth_verifier;
    
    //recuperar de la sesion
    const oauthTokenSecret = req.session.oauthTokenSecret;

    const request_data = {
      url: 'https://www.flickr.com/services/oauth/access_token',
      method: 'POST',
      data: {
        oauth_consumer_key: apiKey,
        oauth_nonce: Math.floor(Math.random * 1e12).toString(),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_token: oauthToken,
        oauth_verifier: oauthVerifier,
        oauth_version: '1.0',
        oauth_token_secret: oauthTokenSecret,
      },
    };
    
    
      const authorization = oauth.authorize(request_data, { key: oauthToken, secret: oauthTokenSecret });
      request_data.headers = { Authorization: constructAuthHeader(authorization) };

const response = await fetch(request_data.url, request_data);
if (!response.ok) {
  throw new Error('Failed to get access token');
}

const responseData = await response.text();
const parsedData = querystring.parse(responseData);
const accessToken = parsedData.oauth_token;
const accessTokenSecret = parsedData.oauth_token_secret;

// Aquí puedes guardar accessToken y accessTokenSecret para usarlos en futuras solicitudes
req.session.accessToken = accessToken;
req.session.accessTokenSecret = accessTokenSecret;

// Llamar a la API de Flickr
await llamarApiFlickr(accessToken, accessTokenSecret);
const imagePathsFinal = getFilePaths('C:\\Users\\desarrollador3\\Documents\\Proyectos\\FINAL');
const imagePathsMontaje = getFilePaths('C:\\Users\\desarrollador3\\Documents\\Proyectos\\MONTAJE');

const photosetIdFinal = 'cambiaesto'; // Reemplaza con el ID de tu álbum "Final"
const photosetIdMontaje = 'cambiaesto'; // Reemplaza con el ID de tu álbum "Montaje"

for (const imagePath of imagePathsFinal) {
  await subirFotoAFlickr(accessToken, accessTokenSecret, imagePath, photosetIdFinal);
}
for (const imagePath of imagePathsMontaje) {
  await subirFotoAFlickr(accessToken, accessTokenSecret, imagePath, photosetIdMontaje);
}
res.send(`
      <html>
        <head>
          <style>
            body {
              background-color: #f0f0f0;
              font-family: Arial, sans-serif;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 {
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>successful</h1>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to get access token');
  }
  // Espera 5 segundos antes de intentar subir la foto
  
});


// Define the request details
const request_data = {
  url: 'https://www.flickr.com/services/oauth/request_token',
  method: 'POST',
  data: {
      oauth_callback: redirectUri
  }
};

// Create the authorization header
const authorizationHeader = oauth.toHeader(oauth.authorize(request_data));

// Make the request
fetch(request_data.url, {
  method: request_data.method,
  headers: authorizationHeader
})
.then(response => response.text())
.then(data => {
  // Handle the response
  console.log(data);
})
.catch(error => {
  // Handle the error
  console.error('Error:', error);
});

async function llamarApiFlickr(accessToken, accessTokenSecret) {
  console.log('accessToken:', accessToken);
  console.log('accessTokenSecret:', accessTokenSecret);
  try {
    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('Invalid or missing accessToken');
    }
    if (!accessTokenSecret || typeof accessTokenSecret !== 'string') {
      throw new Error('Invalid or missing accessTokenSecret');
    }

    const oauthParams = {
      oauth_consumer_key: apiKey,
      oauth_nonce: Math.floor(Math.random() * 1e12).toString(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: accessToken,
      oauth_version: '1.0',
      format: 'json',
      nojsoncallback: 1,
      method: 'flickr.test.login'
    };

    const request_data = {
      url: 'https://www.flickr.com/services/rest',
      method: 'GET',
      data: oauthParams
    };

    // Generar la firma OAuth
    const authorization = oauth.authorize(request_data, { key: accessToken, secret: accessTokenSecret });

    const requestOptions = {
      method: 'GET',
      headers: {
        Authorization: constructAuthHeader(authorization)
      },
    };

    const response = await fetch(`${request_data.url}?${new URLSearchParams(request_data.data).toString()}`, requestOptions);
    if (!response.ok) {
      console.log(response);
      throw new Error('Failed to call Flickr API');
    }

    const responseData = await response.json();
    console.log('Flickr API response:', responseData);
  } catch (error) {
    console.error(error);
  }
}
function constructAuthHeader(params) {
  return `OAuth ${Object.entries(params)
    .map(([name, value]) => `${name}="${encodeURIComponent(value)}"`)
    .join(', ')}`;
}

async function subirFotoAFlickr(accessToken, accessTokenSecret, imagePath, photosetId) {
  try {
    if (!accessToken || typeof accessToken !== 'string') {
      throw new Error('Invalid or missing accessToken');
    }
    if (!accessTokenSecret || typeof accessTokenSecret !== 'string') {
      throw new Error('Invalid or missing accessTokenSecret');
    }
    if (!imagePath || typeof imagePath !== 'string') {
      throw new Error('Invalid or missing imagePath');
    }

    const oauthParams = {
      oauth_consumer_key: apiKey,
      oauth_nonce: Math.floor(Math.random() * 1e12).toString(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: accessToken,
      oauth_version: '1.0',
      format: 'json',
      nojsoncallback: 1,
      method: 'flickr.photo.upload'
    };

    const request_data = {
      url: 'https://up.flickr.com/services/upload/',
      method: 'POST',
      data: oauthParams
    };
    
    const form = new FormData();
    form.append('photo', fs.createReadStream(imagePath));
     //Añadir los parámetros OAuth al formulario
      for (let key in oauthParams) {
        form.append(key, oauthParams[key]);
      }

    // Generar la firma OAuth
    const authorization = oauth.authorize(request_data, { key: accessToken, secret: accessTokenSecret });

    const requestOptions = {
      method: 'POST',
      headers: {
        ...form.getHeaders(),
        //'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: constructAuthHeader(authorization)
      },
      body: form,
    };
    const xml2js = require('xml2js');
    const response = await fetch(request_data.url, requestOptions);
    if (!response.ok) {
      console.log(response);
      throw new Error('Failed to call Flickr API');
    }

    const responseData = await response.text();
    console.log('Flickr API response:', responseData);

    // Convertir la respuesta en un objeto
    let responseObj;
    xml2js.parseString(responseData, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      responseObj = result;
    });

    // Añadir la foto al álbum
    const photoId = responseObj.rsp.photoid[0]; // Extrae el photoId de la respuesta

    await anadirfotoalbum(accessToken, accessTokenSecret, photoId, photosetId);
  } catch (error) {
    console.error(error);
  }
}

async function anadirfotoalbum(accessToken, accessTokenSecret, photoId, photosetId) {
  const oauthParams = {
    oauth_consumer_key: apiKey,
    oauth_nonce: Math.floor(Math.random() * 1e12).toString(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
    format: 'json',
    nojsoncallback: 1,
    method: 'flickr.photosets.addPhoto',
    photo_id: photoId,
    photoset_id: photosetId
  };

  const request_data = {
    url: 'https://www.flickr.com/services/rest',
    method: 'POST',
    data: oauthParams
  };

  const authorization = oauth.authorize(request_data, { key: accessToken, secret: accessTokenSecret });

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: constructAuthHeader(authorization)
    },
    body:querystring.stringify(oauthParams),
  };

  const response = await fetch(request_data.url, requestOptions);
  if (!response.ok) {
    console.log(response);
    throw new Error('Failed to call Flickr API');
  }

  const responseData = await response.json();
  console.log('Flickr API response:', responseData);
}
