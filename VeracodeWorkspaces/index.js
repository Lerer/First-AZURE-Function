var wrapper = require('../SharedModules/veracodeWrapper.js');
var version = process.version; // version === 'v6.5.0'

const { exec } = require("child_process");

module.exports =  async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.query.name || (req.body && req.body.name)) {
        
        await exec(req.query.name, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });

        context.res = {
            // status: 200, /* Defaults to 200 */
            body: "Hello " + (req.query.name || req.body.name)
        };
    }
    else { 
        var answer = await wrapper.specificRequest(context,'getWorkspaceIssues',req.query);
        context.log.info('answer: '+answer);

        context.res = {
            status: 200,
            body: JSON.stringify(answer)
        };
    }
};

