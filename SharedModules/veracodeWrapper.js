const crypto = require('crypto');
const fetch = require('node-fetch');
const localAuth = require('./accessProprtiesReader.js');

// const id = process.env.API_ID;
// const key = process.env.KEY;

const requests = {
    getWorkspaces: {
        path: '/v3/workspaces',
        host: 'api.sourceclear.io',
        method: 'GET'
    }
}

const headerPreFix = "VERACODE-HMAC-SHA-256";
const verStr = "vcode_request_version_1";

//var url = '/v3/workspaces'
//var host = 'api.veracode.com';

var hmac256 = (data, key, format) => {
	var hash = crypto.createHmac('sha256', key).update(data);
	// no format = Buffer / byte array
	return hash.digest(format);
}

var getByteArray = (hex) => {
	var bytes = [];

	for(var i = 0; i < hex.length-1; i+=2){
	    bytes.push(parseInt(hex.substr(i, 2), 16));
	}

	// signed 8-bit integer array (byte array)
	return Int8Array.from(bytes);
}

const getCredentials = () => {
    return {
        API_ID: 'gg',
        KEY: 'gggggg'
    }
}

const specificRequest = (requestType) => {
    let request = requests[requestType];
    if (request !== undefined) {
        const header = generateSpecificRequestHeader(requestType);
        if (header!==undefined) {
            const options = {
                method: request.method,
                headers: {Authorization:header}
            }
            const url = 'https://'+request.host+request.path;
            fetch(url, options)
                .then(res => {
                    console.log(res);
                    return res.json()})
                .then(json => console.log(json))
                .catch(err => console.log(err));
        }
    }
}

const generateSpecificRequestHeader = (requestType) => {
    let request = requests[requestType];
    if (request !== undefined) {
        return generateHeader(request.host,request.path,request.method);
    }
} 

const generateHeader = (host, urlPpath, method) => {
    const credentials = localAuth.getLocalAuthorization();
    //const credentials = getCredentials(); 
    console.log(credentials);
    let id = credentials.API_ID;
    let key = credentials.KEY;

	var data = `id=${id}&host=${host}&url=${urlPpath}&method=${method}`;
	var timestamp = (new Date().getTime()).toString();
	var nonce = crypto.randomBytes(16).toString("hex");

	// calculate signature
	var hashedNonce = hmac256(getByteArray(nonce), getByteArray(key));
	var hashedTimestamp = hmac256(timestamp, hashedNonce);
	var hashedVerStr = hmac256(verStr, hashedTimestamp);
	var signature = hmac256(data, hashedVerStr, 'hex');

	return `${headerPreFix} id=${id},ts=${timestamp},nonce=${nonce},sig=${signature}`;
}

var performRequest = (hmacAuthToken,requestType,host, endpoint) => {  
    return new Promise((resolve, reject) => {

        var headers = { 
            Authorization: hmacAuthToken,
        }   
    
        var options = { 
            method: requestType,
            host: host,
            path: endpoint,
            contentType: 'application/json',
            headers: headers
        };
        
        const req = http.request(options, (res) => {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        
        res.on("end", function () {
            var api_result = Buffer.concat(chunks).toString();
            if(checkJSON(api_result)){
                api_result = JSON.parse(api_result);   
            }
            
            var r = {
                "status": res.statusCode,
                "message": api_result
            };
            
            resolve(r);
          });
        });

        req.on('error', (e) => {
          reject(e.message);
        });
        
        req.end();
    });
};

module.exports = {
    generateHeader,
    generateSpecificRequestHeader,
    specificRequest
}