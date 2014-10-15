var mongoose = require('mongoose');
var response;  // xhr response
exports.handle = function (query, mongo_connection, res) {
    response = res; // set
    //sendResponse(mongo_connection);
    if (!mongoose) return console.warn('mongoose not exists!');
    var db = mongoose.connection;
    db.on('error', function(err){return console.warn(err)});
    db.once('open', function() {
        queryToMongo(query);
    });
    mongoose.connect(mongo_connection);
};
var schemaParser = function (schema){
    typesObj = {
        String : String,
        Number : Number,
        Boolean: Boolean,
        Date   : Date
    };
    for(var key in schema) {
        if (typesObj[schema[key]]) schema[key] = typesObj[schema[key]];
    }
    return schema;
}
var queryParse = function(_query) {
    var query = _query;
    try {
        query = JSON.parse(_query);
    } catch(e) {
        //console.log(e);
    }
    return query;
}
var findOneInDB = function(Model, db_req) {
    Model.findOne(db_req.conditions, db_req.fields, db_req.options, function(err, model) {
        if (err) {
            sendResponse(JSON.stringify(err));
            mongoose.disconnect();
        }else if (!model) {
            sendResponse('model not exist!');
            mongoose.disconnect();
        } else {
            sendResponse(JSON.stringify(model));
            mongoose.disconnect();
        }
    });
}
var findAllInDB = function(Model, db_req) {
    Model.find(db_req.conditions, db_req.fields, db_req.options, function(err, model) {
        if (err) {
            sendResponse(JSON.stringify(err));
            mongoose.disconnect();
        }else if (!model) {
            sendResponse('model not exist!');
            mongoose.disconnect();
        } else {
            sendResponse(JSON.stringify(model));
            mongoose.disconnect();
        }
    });
}
var queryToMongo = function (_query) {
    var query = queryParse(_query['query']);
    //stage 1 (model)
    //set model
    var query_model = query.model;
    var Model;
    try {
        //search existing model
        if (mongoose.model(query_model)) Model = mongoose.model(query_model);
    } catch(e) {
        if (e.name === 'MissingSchemaError') {
            //create schema
            if (!query.schema) return console.warn('Schema not exist!');
            var parsed_schema = schemaParser(query.schema);
            var Schema = new mongoose.Schema(parsed_schema);
            //create new model
            Model = mongoose.model(query_model, Schema);
        }
    }
    //stage 2 (action with db)
    var db_req = query.request;
    switch(query['action']) {
        case 'findOne':
            findOneInDB(Model, db_req);
            break;
        case 'find':
            findAllInDB(Model, db_req);
            break;
        case 'save':
            //create model instance
            var modelObj = query.modelObj;
            var modelInst = new Model(modelObj);
            modelInst.save(function(err, model) {
                if (err) {
                    sendResponse(JSON.stringify(err));
                } else {
                    sendResponse(JSON.stringify(model));
                }
                mongoose.disconnect();
            });
            break;
        case 'update':
            Model.update(db_req.conditions, db_req.update, db_req.options, function(err, numberAffected, raw){
                if (err) {
                    sendResponse(JSON.stringify(err));
                } else {
                    sendResponse(JSON.stringify({numberAffected:numberAffected, raw: raw}));
                }
                mongoose.disconnect();
                });
            break;
        case 'remove':
            Model.remove(db_req.conditions, function (err) {
                if (err) {
                    sendResponse(JSON.stringify(err));
                } else {
                    sendResponse('model was removed');
                }
                mongoose.disconnect();
            });
            break;
        default:
            sendResponse('request incorrect!');
            mongoose.disconnect();
            break;
    }
};
//stage 3 (send response)
var sendResponse = function (data) {
    response.writeHead(200, {"Content-Type": "application/json",
                             "Content-Length": data.length,
                             "Access-Control-Allow-Origin": "*",
                             "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept" });
    response.end(data);
};
