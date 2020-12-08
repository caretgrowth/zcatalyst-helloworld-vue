const catalyst = require('zcatalyst-sdk-node');
console.log('tokens loaded...');
module.exports = {
    saveOAuthTokens: (tokenobject) => {
        // This method will be called automatically when generateAuthTokens() and generateAuthTokenfromRefreshToken() methods are being called.
        const tokens = tokenobject.user_identifier;
        const user_identifier = tokens.user_identifier;
        const app = catalyst.initialize(tokens.contexts);

        return app.zcql().executeZCQLQuery(`SELECT ROWID FROM Tokens where user_identifier = ${user_identifier}`).then(queryResult => {
            // We have queried the datastore with user identifier and if it returns any value, it is exisiting user and if not, new user.
            if (queryResult.length !== 0) {
                //Updating the datatsore with new Access token value
                return app.datastore().table('Tokens').updateRow({
                    access_token: tokenobject.access_token,
                    expires_in: tokenobject.expires_in,
                    ROWID: queryResult[0].Tokens.ROWID
                });
            }
            else {
                //Inserting a new row in Datastore for a New user
                return app.datastore().table('Tokens').insertRow({
                    access_token: tokenobject.access_token,
                    refresh_token: tokenobject.refresh_token,
                    expires_in: tokenobject.expires_in,
                    user_identifier: user_identifier
                });
            }
        });
    },
    getOAuthTokens: (user_identifier) => {
        // This method will be called automatically when you use the Node SDK to perform any operations  
        const query = `SELECT * FROM Tokens where user_identifier = ${user_identifier.user_identifier}`;
        return catalyst.initialize(user_identifier.contexts).zcql().executeZCQLQuery(query).then(queryResult => {
            return {
                access_token: queryResult[0].Tokens.access_token,
                expires_in: queryResult[0].Tokens.expires_in,
                refresh_token: queryResult[0].Tokens.refresh_token,
                user_identifier: user_identifier.user_identifier
            }
        });
    },
    updateOAuthTokens: (tokenobject) => {
        //This method is where the authtokens get updated in the Catalyst Datastore. 
        //This gets called automatically if access token expires. When called internally, it will have the new access token value.
        const crmclient = require('zcrmsdk');
        const app = catalyst.initialize(crmclient.getUserIdentifier().contexts);
        const query = `SELECT ROWID FROM Tokens where user_identifier = ${crmclient.getUserIdentifier().user_identifier}`;
        return app.zcql().executeZCQLQuery(query).then(queryResult => {
            return app.datastore().table('Tokens').updateRow({
                access_token: tokenobject.access_token,
                expires_in: tokenobject.expires_in,
                ROWID: queryResult[0].Tokens.ROWID
            });
        });
    }
}