'use strict';

const catalyst = require('zcatalyst-sdk-node');
const ZCRMRestClient = require('zcrmsdk');
require('./tokens');

module.exports = async (req, res) => {
	const app = catalyst.initialize(req);

	// Retrieve stored credentials from "creds" table
	const zcql = app.zcql();
	const query = "SELECT * from creds where app_name = 'crm'";
	const crmCreds = await zcql.executeZCQLQuery(query);
	const { client_id, client_secret, redirect_url, user_identifier } = crmCreds[0].creds;

	// Create config for CRM Server Side SDK
	const configJson = {
		"client_id": client_id, //mandatory
		"client_secret": client_secret, //mandatory
		"redirect_url": redirect_url, // "http://localhost:3000/server/api/"
		"user_identifier": user_identifier, // my email address
	}

	// console.log(configJson); // this works correctly

	const url = req.url;
	await ZCRMRestClient.initialize(configJson); // Connect to CRM

	/* Default example from CRM Server Side SDK Docs */
	const params = {};

	ZCRMRestClient.API.ORG.get(params).then(function (response) {

		// Response of the API call is returned in the 'body'

		// The organization details are obtained from the first JSON object of the JSON Array corresponding
		// to the 'org' key of the response

		response = JSON.parse(response.body).org;
		response = response[0];

		// For obtaining all the fields of the organization details, use the value of 'response' as such
		console.log(response);

		// For obtaining a particular field, use response.<api-name of field>
		// Sample API names: country, city
		console.log(response.country);

	});

	switch (url) {
		case '/':
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.write('<h1>Hello from index.js<h1>');
			break;
		default:
			res.writeHead(404);
			res.write('You might find the page you are looking for at "/" path');
			break;
	}
	res.end();
};