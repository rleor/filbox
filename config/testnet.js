module.exports = {
    jwt_secret: "jwtsecret",
    pow_host: "http://localhost:6002",
    pow_ffs_token: "ad652cf5-b1dc-40b3-878a-877f4415154c",
    knex_config: {
        client: 'mysql',
        connection: {
            host: '127.0.0.1',
            user: 'filbox',
            password: 'password',
            database: 'filbox'
        },
        pool: {
            min: 2,
            max: 10
        }
    },
    default_storage_config: {
        override: true,
        storageConfig: {
            cold: {
                enabled: true,
                filecoin: {
                    // addr:  to fill at runtime.
                    countryCodesList: null,
                    dealMinDuration: 1036800,
                    dealStartOffset: 8640,
                    excludedMinersList: null,
                    fastRetrieval: true,
                    maxPrice: 0,
                    renew: {
                        enabled: false,
                        threshold: 0,
                    },
                    repFactor: 1,
                    trustedMinersList: ["t01000"],
                }
            },
            hot: {
                enabled: true,
                allowUnfreeze: false,
                unfreezeMaxPrice: 0,
                ipfs: {
                    addTimeout: 30,
                }
            },
            repairable: false,
        }
    }
};
