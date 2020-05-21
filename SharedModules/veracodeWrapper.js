const crypto = require('crypto');
const fetch = require('node-fetch');
const localAuth = require('./accessProprtiesReader.js');

// const id = process.env.API_ID;
// const key = process.env.KEY;

const requests = {
    getWorkspaces: {
        path: '/srcclr/v3/workspaces',
        host: 'api.veracode.com',
        method: 'GET'
    },
    getApplications: {
        path: '/appsec/v1/applications',
        host: 'api.veracode.com',
        method: 'GET'
    }
}

const headerPreFix = "VERACODE-HMAC-SHA-256";
const verStr = "vcode_request_version_1";

const hmac256 = (data, key, format) => {
	var hash = crypto.createHmac('sha256', key).update(data);
	// no format = Buffer / byte array
	return hash.digest(format);
}

const getByteArray = (hex) => {
	var bytes = [];

	for(var i = 0; i < hex.length-1; i+=2){
	    bytes.push(parseInt(hex.substr(i, 2), 16));
	}

	// signed 8-bit integer array (byte array)
	return Int8Array.from(bytes);
}

const specificRequest = async (context,requestType) => {
    context.log('specificRequest');
    let request = requests[requestType];
    let res = {
        message: 'No specific request found'
    };
    if (request !== undefined) {
        const header = await generateSpecificRequestHeader(context,requestType);
        if (header!==undefined) {
            const options = {
                method: request.method,
                headers: {Authorization:header}
            }
            const url = 'https://'+request.host+request.path;
            res = await fetch(url, options)
                .then(res => res.json())
                .catch(err => context.log.error(err));
        } else {
            res = {message: 'couldn\'t generate header'}
        }
    }
    return res;
}

const generateSpecificRequestHeader = async (context,requestType) => {
    context.log('generateSpecificRequestHeader');
    let request = requests[requestType];
    if (request !== undefined) {
        return generateHeader(context,request.host,request.path,request.method);
    }
} 

const generateHeader = (context,host, urlPpath, method) => {
    context.log('generateHeader');
    // Replace with your own profile
    const credentials = localAuth.getLocalAuthorization('azure_api');
    context.log(credentials);
    let id = credentials.API_ID;
    let key = credentials.KEY;

    var data = `id=${id}&host=${host}&url=${urlPpath}&method=${method}`;
    context.log('data: '+data);
	var timestamp = (new Date().getTime()).toString();
	var nonce = crypto.randomBytes(16).toString("hex");

	// calculate signature
	var hashedNonce = hmac256(getByteArray(nonce), getByteArray(key));
	var hashedTimestamp = hmac256(timestamp, hashedNonce);
	var hashedVerStr = hmac256(verStr, hashedTimestamp);
	var signature = hmac256(data, hashedVerStr, 'hex');

	return `${headerPreFix} id=${id},ts=${timestamp},nonce=${nonce},sig=${signature}`;
}

module.exports = {
    generateHeader,
    generateSpecificRequestHeader,
    specificRequest
}