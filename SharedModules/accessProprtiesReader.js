const path = require('path');
const os = require('os');
const configparser = require('configparser');

const getLocalAuthorization = (authProfile) => {
    //let authProfile = context.request.getEnvironmentVariable('veracode_auth_profile');
    if (!authProfile) {
        authProfile = 'default';
    }
    let veracodeCredsFile = path.join(os.homedir(), '.veracode', 'credentials');
    let config = new configparser();
    config.read(veracodeCredsFile);
    let id = config.get(authProfile, 'veracode_api_key_id');
    let key = config.get(authProfile, 'veracode_api_key_secret'); 

    return {API_ID:id,KEY:key};
}

module.exports = {getLocalAuthorization};