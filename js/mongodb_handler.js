var mongodb_handler = function() {
  this.schema        = {};
  this.model         = '';
  this.modelObj      = {};
  this.query         = {};
  this.query_url     = '';
  this.request       = {};
  this.createQuery = function (action) {
    this.query.action = action;
    this.query.model = this.model;
    this.query.modelObj = this.modelObj;
    this.query.request = this.request;
    this.query.schema = this.schema;
  };
  this.sendQuery = function (callback) {
    if (!this.query) return console.log("query not exist!");
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET","?query=" + JSON.stringify(this.query) , true);
    xmlhttp.onreadystatechange=function(){
      if (xmlhttp.readyState==4 && xmlhttp.status==200){
        callback(xmlhttp.response);
      }
    }
    xmlhttp.send();
  }
}
