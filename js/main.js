var dbh = new mongodb_handler();
function setSMO(){
    dbh.schema = JSON.parse(document.getElementById('schema').value);
    dbh.modelObj = JSON.parse(document.getElementById('model').value);
    dbh.model = document.getElementById('collection').value;
}
function sendRequest(){
    dbh.request.conditions = JSON.parse(document.getElementById('conditions').value);
    dbh.request.fields = document.getElementById('fields').value;
    dbh.request.update = JSON.parse(document.getElementById('update').value);
    dbh.request.options = JSON.parse(document.getElementById('options').value);
    dbh.action = document.getElementById('action').value;
    dbh.createQuery(dbh.action);
    dbh.sendQuery(function(response) {
        document.getElementById('content').innerHTML = response;
    });
}

