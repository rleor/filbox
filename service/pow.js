import { createPow } from "@textile/powergate-client";
const config = require('config-lite')(__dirname);

const pow = createPow({host: config.pow_host});
pow.setToken(config.pow_ffs_token);

export default pow;