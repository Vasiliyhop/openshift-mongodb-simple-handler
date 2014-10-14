#!/bin/env node
//  file_server + mongodb handler for openshift v0.1 (c)Vasiliy Shevchuk 2014
var http = require('http') ,
    url = require('url') ,
    path = require('path') ,
    fs = require('fs') ;
//default ip and ports
var ipadress   = '127.0.0.1';
var port       = 8080;
var app_name   = 'db';
//get process environment variables and set connection options
var pe = process.env;
var server_env = {
    appname          : pe.OPENSHIFT_APP_NAME || app_name ,
    ipaddress        : pe.OPENSHIFT_NODEJS_IP || ipadress ,
    port             : pe.OPENSHIFT_NODEJS_PORT || port ,
    mongo_username   : pe.OPENSHIFT_MONGODB_DB_USERNAME ,
    mongo_password   : pe.OPENSHIFT_MONGODB_DB_PASSWORD ,
    mongo_host       : pe.OPENSHIFT_MONGODB_DB_HOST ,
    mongo_port       : pe.OPENSHIFT_MONGODB_DB_PORT ,
    mongo_url        : pe.OPENSHIFT_MONGODB_DB_URL ,
    mongo_connection : 'mongodb://localhost/db'
};
if(server_env.mongo_password) {
    server_env.mongo_connection = server_env.mongo_username + ':' + server_env.mongo_password + '@' + server_env.mongo_host + ':' + server_env.mongo_port + '/' + server_env.appname;
}
//...............
var mimeTypes = {
    "html": "text/html",
    "css": "text/css",
    "js": "text/javascript",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "ico": "image/gif",
    "png": "image/png",
    "mp3": "audio/mpeg",
    "ogg": "audio/ogg",
    "wav": "audio/wav",
    "pdf": "application/pdf"};
http.createServer(function(req, res) {
    var status_code = 200;
    var header = {'Content-Type': 'text/plain'};
    var uri = url.parse(req.url).pathname;
    if (uri == '/') {
        uri = '/index.html';
    }
    var filename = path.join(process.cwd(), uri);
    var Ext = path.extname(filename).split(".")[1];
    var mimeType = mimeTypes[Ext];
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    if(Object.getOwnPropertyNames(query).length !== 0) {
        var qh = require('./qh');
        qh.handle(query, server_env.mongo_connection, res);
    } else {
        path.exists(filename, function(exists) {
            if((!exists)||(!mimeType)) {
                console.log("not exists: " + filename);
                res.writeHead(status_code, header);
                res.write('404 Not Found\n');
                res.end();
            }else{
                if (mimeType=='audio/mpeg'||mimeType=='audio/ogg'||mimeType=='audio/wav') {
                    var stat = fs.statSync(filename);
                    status_code = 200;
                    header = {
                        'Cache-Control': 'max-age=29030400',
                        'Content-Transfer-Encoding': 'binary',
                        'Content-Length': stat.size,
                        "Content-Type": mimeType,
                        "Date":new Date,
                        "Server":'node'
                    }
                } else {
                   status_code = 200;
                   header = {'Content-Type':mimeType};
                }
                res.writeHead(status_code, header);

                var fileStream = fs.createReadStream(filename);
                if (filename.split(".")[1] != 'ico') {
                    console.log('Reading ...'+ filename);
                }

                fileStream.on('data', function (data) {
                    res.write(data);
                });
                fileStream.on('end', function() {
                    res.end();
                });
            }
        });
    }
}).listen(server_env.port, server_env.ipaddress);
