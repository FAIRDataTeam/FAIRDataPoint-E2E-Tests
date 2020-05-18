// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const { MongoClient } = require('mongodb')


const withMongoDB = (config, callback) => {
  return new Promise((resolve, reject) => {
    const client = new MongoClient(config.env.mongoUrl, {
      useNewUrlParser: true
    })
    client.connect((err) => {
      if (err) {
        reject(err)
      } else {
        const db = client.db(config.env.mongoDBName)
        const result = callback(db)
        client.close()
        resolve(result)
      }
    })
  })
}


module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('task', {
    'mongo:find': ({ collection, args}) => withMongoDB(config, db => {
      return db.collection(collection).find(args).toArray()
    }),
    'mongo:findOne': ({ collection, args }) => withMongoDB(config, db => {
      return db.collection(collection).findOne(args)
    }),
    'mongo:delete': ({ collection, args }) => withMongoDB(config, db => {
      return db.collection(collection).deleteMany(args)
    }),
    'mongo:updateOne': ({ collection, query, update }) => withMongoDB(config, db => {
      return db.collection(collection).updateOne(query, update)
    }),
    'mongo:insert': ({ collection, objects }) => withMongoDB(config, db => {
      return db.collection(collection).insertMany(objects)
    })
  })
}
