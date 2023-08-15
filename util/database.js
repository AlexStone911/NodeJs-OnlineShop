const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect('mongodb+srv://podgorodeczkij199:NtgcTu57qhJ4bxMn@cluster0.clayyy8.mongodb.net/')
  .then(client => {
    console.log('connected!');
    _db = client.db();
    callback();
  })
  .catch(err => {
    console.log(err);
    throw err;
  });
};

const getDb = () => {
  if(_db) {
    return _db;
  } else {
    throw 'No db!';
  }
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
