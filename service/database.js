import knex from "knex";
const config = require('config-lite')(__dirname);

const db = knex(config.knex_config);

export default db;