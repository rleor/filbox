module.exports = {
    port: 3000,
    password_rounds: 5,
    jwt_expire_in: 90*24*60*60,
    db_pool_size_min: 2,
    db_pool_size_max: 10,
    knex_config: {
        client: 'mysql',
        connection: {
            database: 'filbox'
        },
        pool: {
            min: 2,
            max: 10
        }
    }
};