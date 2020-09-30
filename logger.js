var log4js = require("log4js");

if (process.env.NODE_ENV !== 'development') {
    log4js.configure({
        appenders: {
            rolling_file: {
                type: 'dateFile',
                filename: `logs/${process.env.NODE_ENV}/filbox.log`,
                daysToKeep: 30
            }
        },
        categories: {
            default: {
                appenders: ["rolling_file"],
                level: "info"
            }
        }
    });
} else {
    log4js.configure({
        appenders: {
            console: {
                type: 'console'
            }
        },
        categories: {
            default: {
                appenders: ["console"],
                level: "debug"
            }
        }
    });
}

export default log4js;
