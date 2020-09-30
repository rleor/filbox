module.exports = {
    jwt_secret: "",
    pow_host: "",
    pow_ffs_token: "",
    knex_config: {}, // refer to knex documentation.
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
                    trustedMinersList: [""],
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
