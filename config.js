/**
* @desc Configs
*
* @returns {Object} - config
*/

module.exports = {
  
  database: {
    db: 'test',
    host: process.env.RDB_HOST || 'localhost',
    port: process.env.RDB_PORT || 28015
  },

  port: 8090
}
