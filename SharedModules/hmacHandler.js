const crypto = require('crypto');
const localAuth = require('./accessProprtiesReader.js');

const headerPreFix = "VERACODE-HMAC-SHA-256";
const verStr = "vcode_request_version_1";

const generateHeader = (context,host, urlPpath, method) => {
    context.log('generateHeader');

    // for cloud deployment - these should be the credentials
    let id = process.env.veracode_api_key_id;
    let secret = process.env.veracode_api_key_secret;

    // Replace with your own profile in local.settings.json for local debugging
    if (id === undefined || id.length==0){
        var authProfile = process.env.veracode_auth_profile;
        if (authProfile !== undefined && authProfile.length>0) {
            const credentials = localAuth.getLocalAuthorization(authProfile);
            context.log(credentials);
            id = credentials.API_ID;
            secret = credentials.SECRET;
        }
    }

    if (id === undefined || id.length==0){
        context.log.error('No credentials provided');
        return;
    }

    var data = `id=${id}&host=${host}&url=${urlPpath}&method=${method}`;
    context.log('data: '+data);
	var timestamp = (new Date().getTime()).toString();
	var nonce = crypto.randomBytes(16).toString("hex");

	// calculate signature
	var hashedNonce = hmac256(getByteArray(nonce), getByteArray(secret));
	var hashedTimestamp = hmac256(timestamp, hashedNonce);
	var hashedVerStr = hmac256(verStr, hashedTimestamp);
	var signature = hmac256(data, hashedVerStr, 'hex');

	return `${headerPreFix} id=${id},ts=${timestamp},nonce=${nonce},sig=${signature}`;
}


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


module.exports = {
    generateHeader
}