// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const unirest = require('unirest');
const axios = require('axios');
const bodyParser = require('body-parser');
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
//app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// http://expressjs.com/en/starter/basic-routing.html
app.get('/:email', function(request, response) {
  unirest.get('https://haveibeenpwned.com/api/v3/breachedaccount/'+ request.params.email)
  .set('User-Agent','isPwned-Indrajith')
  .set('api-version','3')
  .set('hibp-api-key', process.env.ISPWNED)
  .send()
  .end(function(resp){
    console.log(resp.body);
    response.send(resp.body)
  })
});

app.post('/domaindetails', function(request, response) {
  const requestData = request.body;
  if(requestData.domains && (requestData.domains.length > 0)) {
    let domainRequests = [];
    requestData.domains.forEach(_domains => {
      domainRequests = [
        ...domainRequests,
        generateDomainDetailsPromises(_domains)
      ]
    });
    Promise.all(domainRequests).then(allResponses => {
      const returnDomainResponse = allResponses.map(_response => _response.data);
      response.send(returnDomainResponse);
    }).catch(error => {
      response.sendStatus(404);
    });
    
  } else {
    response.sendStatus(404);
  }
})

function generateDomainDetailsPromises(domainName) {
  return axios.get(`https://haveibeenpwned.com/api/v3/breach/${domainName}`);
}

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
