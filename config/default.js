module.exports = {
    port: 3000,
    password_rounds: 5,
    jwt_expire_in: 90*24*60*60,
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