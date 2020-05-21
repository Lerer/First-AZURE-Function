var wrapper = require('../SharedModules/veracodeWrapper.js');
var version = process.version; // version === 'v6.5.0'

module.exports =  async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.query.name || (req.body && req.body.name)) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: "Hello " + (req.query.name || req.body.name)
        };
    }
    else { 
        var answer = await wrapper.specificRequest('getWorkspaces');
        console.log('answer: '+answer);
        //answer = {a:2}
        context.res = {
            status: 200,
            body: JSON.stringify(answer)
        };
    }
};

