import knex from "knex";
const config = require('config-lite')(__dirname);

const db = knex({
    client: 'mysql',
    connection: {
        host: config.db_host,
        user: config.db_user,
        password: config.db_password,
        database: 'filbox'
    },
    pool: {
        min: config.db_pool_size_min,
        max: config.db_pool_size_max
    }
});

export default db;