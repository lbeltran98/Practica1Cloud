var AWS = require('aws-sdk');
AWS
  .config
  .loadFromPath('./config.json');

var db = new AWS.DynamoDB();

function keyvaluestore(table) {
  this.LRU = require("lru-cache");
  this.cache = new this.LRU({max: 500});
  this.tableName = table;
};

/**
   * Initialize the tables
   *
   */
keyvaluestore.prototype.init = function (whendone) {

  var tableName = this.tableName;
  var self = this;

  var params = {
    TableName: tableName
  }

  db.describeTable(params, (err, data) => {
    if (err) 
      console.log(err)
    else 
      whendone(); //Call Callback function.
    }
  );
};

/**
   * Get result(s) by key
   *
   * @param search
   *
   * Callback returns a list of objects with keys "inx" and "value"
   */

keyvaluestore.prototype.get = function (search, callback) {
  var self = this;

  if (self.cache.get(search)) 
    callback(null, self.cache.get(search));
  else {

    var items = [];

    if (this.tableName == "images") {
      let params = {
        TableName: this.tableName,
        ExpressionAttributeNames: {
          '#keyword': 'key',
          '#mlink': 'link'
        },
        ExpressionAttributeValues: {
          ":key": {
            S: search
          }
        },
        KeyConditionExpression: '#keyword = :key',
        ProjectionExpression: '#mlink,#keyword'
      };

      db.query(params, (err, data) => {
        if (err) 
          console.log("Error in query on images table: " + err)
        else {
          let items = [];
          data
            .Items
            .forEach(item => {
              items.push({"key": item.key.S, "link": item.link.S})
            })

          self
            .cache
            .set(search, items)
          callback(null, items)
        }
      })
    } else if (this.tableName == "labels") {
      var params = {
        TableName: this.tableName,
        ExpressionAttributeNames: {
          '#keyword': 'key',
          '#cat': 'category'
        },
        ExpressionAttributeValues: {
          ":key": {
            S: search
          }
        },
        KeyConditionExpression: '#keyword = :key',
        ProjectionExpression: 'sort,#cat,#keyword'
      };

      db.query(params, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let items = [];
          data
            .Items
            .forEach(item => {
              items.push({"key": item.key.S, "sort": item.sort.N, "category": item.category.S});
            });
          self
            .cache
            .set(search, items);
          callback(null, items);
        };
      });
    }

    /*
       *
       * La función QUERY debe generar un arreglo de objetos JSON son cada
       * una de los resultados obtenidos. (sort, category, key).
       * Al final este arreglo debe ser insertado al cache. Y llamar a callback
       *
       * Ejemplo:
       *    var items = [];
       *    items.push({"sort": data.Items[0].sort.N, "category": data.Items[0].value.S, "key": data.Items[0].key});
       *    self.cache.set(search, items)
       *    callback(err, items);
       */
  }
};

module.exports = keyvaluestore;
