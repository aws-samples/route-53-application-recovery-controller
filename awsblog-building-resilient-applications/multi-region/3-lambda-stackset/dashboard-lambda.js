/*jshint multistr: true */
/*jshint esversion: 8 */

// Require dependencies
const { Resolver } = require('dns').promises;
const AWS = require('aws-sdk');

// Set up required parameters for Lambda operation based on environment variables
const lambdaParams = {};
lambdaParams.deploymentRegions = process.env.DeploymentRegions ? JSON.parse(process.env.DeploymentRegions) : null;
lambdaParams.vpcIds = process.env.VpcIds ? JSON.parse(process.env.VpcIds) : null;
lambdaParams.resolvers = process.env.Resolvers || "10.0.0.2";
lambdaParams.dns = process.env.Dns || "app.arcblog.aws";
lambdaParams.maxRows = process.env.MaxRows || 30;
lambdaParams.checkInterval = process.env.CheckInterval || 5;

// Catch errors in missing parameters for logging and exit
let paramErrors = [];
if (!lambdaParams.deploymentRegions) {
    paramErrors.push("DeploymentRegions");
}
if (!lambdaParams.vpcIds) {
    paramErrors.push("VpcIds");
}

// Instantiate required AWS SDK Clients:
// EC2 Client across all deploymentRegions
const ec2client = {};
const instantiateClients = () => {
    lambdaParams.deploymentRegions.forEach(deploymentRegion => {
        ec2client[deploymentRegion] = new AWS.EC2({ region: deploymentRegion });
    });
};
instantiateClients();

// Instantiate DNS resolver client and set resolvers
const resolver = new Resolver();
resolver.setServers([lambdaParams.resolvers]);

// Lambda Handler
exports.handler = async (event) => {
    console.log(event);
    console.log(`HTTP Path: ${event.path}`);

    // Craft blank response
    let response = {
        "statusCode": null,
        "statusDescription": null,
        "body": null,
        "isBase64Encoded": false,
        "headers": {
            "content-type": "text/html; charset=utf-8"
        }
    };

    // Exit early if any paramters are missing
    if (paramErrors.length > 0) {
        console.error(`${paramErrors.join(", ")} parameters are missing, aborting`);
        response = constructBlankResponse(response);
        console.log(`response: ${JSON.stringify(response)}`);
        return response;
    }

    // Handle 3 different request types: / = serve dashboard, /api or /api/ = serve API response to dashboard, everything else = send 500 error
    switch (event.path) {
        case '/':
            response = await constructDynamicResponse(response, event);
            break;
        case '/api':
        case '/api/':
            response = await constructEniBasedApiResponse(response, event);
            break;
        default: 
            response = constructBlankResponse(response);
    }

    // Send response
    console.log(`response: ${JSON.stringify(response)}`);
    return response;
};

// Set const containing style content for inclusion in other HTTP responses
const htmlStyle = `<style>
        body {
            font-family: Arial, sans-serif;
        }
        h1,h2 {
            text-align: center;
        }
        td {
            text-align: center;
        }
        .center {
            margin-left: auto;
            margin-right: auto;
            width: 100%;
        }
        div.fixed {
            position: fixed;
            bottom: 0;
            right: 0;
            width: 275px;
            border: 3px solid #FF9900;
        }
    </style>`;

// Set const containing script content for inclusion in other HTTP responses
const responseScript = `<script>
            const table = document.querySelector('#response-table');
            const tbody = table.querySelector('tbody');
            const insertRow = (response) => {
                const row = tbody.insertRow(0);
                row.innerHTML = \`<td class="p-2">\${response.responseTime}</td>\`;
                response.responseBody === "${lambdaParams.deploymentRegions[0]+'a'}" ? row.innerHTML += \`<td class="p-2">\${response.responseBody}</td>\` : row.innerHTML += "<td></td>";
                response.responseBody === "${lambdaParams.deploymentRegions[0]+'b'}" ? row.innerHTML += \`<td class="p-2">\${response.responseBody}</td>\` : row.innerHTML += "<td></td>";
                response.responseBody === "${lambdaParams.deploymentRegions[0]+'c'}" ? row.innerHTML += \`<td class="p-2">\${response.responseBody}</td>\` : row.innerHTML += "<td></td>";
                response.responseBody === "${lambdaParams.deploymentRegions[1]+'a'}" ? row.innerHTML += \`<td class="p-2">\${response.responseBody}</td>\` : row.innerHTML += "<td></td>";
                response.responseBody === "${lambdaParams.deploymentRegions[1]+'b'}" ? row.innerHTML += \`<td class="p-2">\${response.responseBody}</td>\` : row.innerHTML += "<td></td>";
                response.responseBody === "${lambdaParams.deploymentRegions[1]+'c'}" ? row.innerHTML += \`<td class="p-2">\${response.responseBody}</td>\` : row.innerHTML += "<td></td>";
                response.responseBody === "Maintenance" ? row.innerHTML += \`<td class="p-2">\${response.responseBody}</td>\` : row.innerHTML += "<td></td>";
            };
            const removeRow = () => {
                if (table.rows.length > ${lambdaParams.maxRows}) {
                    table.deleteRow(${lambdaParams.maxRows});
                }
            };
            const getUpdate = () => {
                const rand = Math.random();
                fetch(\`/api/?\${rand}\`)
                .then(response => response.json())
                .then(json => {
                    const responseTime = json?.responseTime;
                    const responseBody = json?.responseBody;
                    const statusCode = json?.statusCode;
                    const date = new Date();
                    const time = date.toTimeString().split(\" \")[0];
                    insertRow({
                        date: time,
                        responseBody: responseBody,
                        responseTime: responseTime,
                        statusCode: statusCode
                    });
                    removeRow();
                })
            };
            getUpdate();
            setInterval(() => {
                getUpdate();
            }, ${lambdaParams.checkInterval * 1000});
        </script>`;

// Function to add relevant elements to the response for invalid / unexpected requests
const constructBlankResponse = (response) => {
    response.body = "";
    response.statusCode = 500;
    response.statusDescription = "500 Internal Server Error";

    return response;
};

// Function to construct the dashboard HTML in response to a request for /
const constructDynamicResponse = async (response) => {
    const responsebody = `
<html>
    <title>Status Dashboard</title>
    ${htmlStyle}
    <body>
        <h1>Status Dashboard</h1>
        <h2>Response Summary for ${lambdaParams.dns}</h2>
        <table id="response-table" class="center">
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>${lambdaParams.deploymentRegions[0]+'a'}</th>
                    <th>${lambdaParams.deploymentRegions[0]+'b'}</th>
                    <th>${lambdaParams.deploymentRegions[0]+'c'}</th>
                    <th>${lambdaParams.deploymentRegions[1]+'a'}</th>
                    <th>${lambdaParams.deploymentRegions[1]+'b'}</th>
                    <th>${lambdaParams.deploymentRegions[1]+'c'}</th>
                    <th>Maintenance</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
        ${responseScript}
    </body>
</html>`;
    
    response.statusCode = 200;
    response.statusDescription = "200 OK";
    response.body = responsebody;

    return response;
};

// Function to construct the API response to the dashboard, based on a mapping of DNS query responses to NLB ENI IPs
const constructEniBasedApiResponse = async (response) => {
    //console.log("Performing query for "+lambdaParams.dns);

    // Perform DNS query
    const dnsQueryResponse = await buildDnsQueryResponse(lambdaParams.dns);

    // Construct NLB ENI IP mapping
    const eniAZMapping = await buildEniAZMapping();

    // Record current date/time for response
    const responseDate = new Date();
    const responseTime = responseDate.toTimeString().split(" ")[0];
    //console.log(`responseTime: ${responseTime}`);

    // Add relevant API elements to response
    response.body = `{ "responseBody": "${eniAZMapping[dnsQueryResponse[0]] || "Maintenance" }", "responseTime": "${responseTime}" }`;
    response.statusCode = 200;
    response.statusDescription = "200 OK";

    return response;
};

// Function to query DNS resolvers for a given record
const buildDnsQueryResponse = async (dns) => {
    //console.log(`triggered buildDnsQueryArray, ${dns}`);
    const dnsQueryOptions = {
        ttl: false
    };
    
    // Perform DNS query and construct array of responses
    let dnsQueryResponse = [];
    try {
        dnsQueryResponse = await resolver.resolve4(dns, dnsQueryOptions);
        //console.log('DNS resolution succeeded');
    } catch (error) {
        console.error('DNS resolution failed '+error);
    }
    
    //console.log(`dnsQueryResponse: ${JSON.stringify(dnsQueryResponse)}`);
    return dnsQueryResponse;
};

// Function to build a mapping of NLB ENIs to IPs
const buildEniAZMapping = async () => {
    const ipArray = {};
    const describeNetworkInterfacesParams = {
    };    
    
    // Iterate through deploymentRegions and perform EC2 describeNetworkInterfacesResponse 
    for (let i = 0; i < lambdaParams.deploymentRegions.length; i++) {
        try {
            const describeNetworkInterfacesResponse = await ec2client[lambdaParams.deploymentRegions[i]].describeNetworkInterfaces(describeNetworkInterfacesParams).promise();
            describeNetworkInterfacesResponse.NetworkInterfaces.forEach(interface => {
                if (lambdaParams.vpcIds.includes(interface.VpcId) && interface.InterfaceType === "network_load_balancer") {
                    ipArray[interface.PrivateIpAddress] = interface.AvailabilityZone;
                }
            });
        } catch (error) {
            console.error('ENI AZ Mapping failed '+error);
        }
    }
    //console.log(`ipArray: ${JSON.stringify(ipArray)}`);
    return ipArray;
};

