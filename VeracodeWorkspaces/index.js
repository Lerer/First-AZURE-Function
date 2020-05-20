var veracode = require('../SharedModules/veracodeLogin.js');
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
        var header = veracode.generateHeader('host','path','GET');
        context.res = {
            status: 400,
            body: version + '-' + header
        };
    }
};

