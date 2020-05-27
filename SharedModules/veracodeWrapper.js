const fetch = require('node-fetch');
const {generateHeader} = require('./hmacHandler.js');

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
    },
    getWorkspaceProjects: {
        path: '/srcclr/v3/workspaces/2a5d2d8e-fe51-4af7-bc31-b4eef4e96491/projects',
        host: 'api.veracode.com',
        method: 'GET'
    },
    getProjectDetails: {
        path: '/srcclr/v3/workspaces/2a5d2d8e-fe51-4af7-bc31-b4eef4e96491/projects/d27cc383-2ba7-44bc-935f-c969d8e46ab1',
        host: 'api.veracode.com',
        method: 'GET'
    },
    getWorkspaceIssues: {
        path: '/srcclr/v3/workspaces/2a5d2d8e-fe51-4af7-bc31-b4eef4e96491/issues',
        host: 'api.veracode.com',
        method: 'GET'
       // ,queryParams: '?project_id=d27cc383-2ba7-44bc-935f-c969d8e46ab1'
    }
}

const specificRequest = async (context,requestType,queryParams) => {
    context.log('specificRequest');
    let request = requests[requestType];
    let res = {
        message: 'No specific request found'
    };
    if (request !== undefined) {
        const header = await requestSpecificRequestHeader(context,requestType);
        if (header!==undefined) {
            const options = {
                method: request.method,
                headers: {Authorization:header}
            }
            let query = request.queryParams || '';
            const url = 'https://'+request.host+request.path+query;
            context.log(url);
            res = await fetch(url, options)
                .then(res => res.json())
                .catch(err => context.log.error(err));
        } else {
            res = {message: 'couldn\'t generate header'}
        }
    }
    return res;
}

const requestSpecificRequestHeader = async (context,requestType) => {
    context.log('generateSpecificRequestHeader');
    let request = requests[requestType];
    if (request !== undefined) {
        return generateHeader(context,request.host,request.path,request.method);
    }
} 

module.exports = {
    specificRequest
}