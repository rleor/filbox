import pow from "../service/pow";
import db from "../service/database";
import urlencode from "urlencode";
const config = require('config-lite')(__dirname);
import { getUserByUsername } from "../service/user";
import log4js from "../logger";

var logger = log4js.getLogger("files");

export const downloadFileByCid = async(req, res) => {
    let cid = req.params.cid;
    try {
        let file = await getFileByCid(cid);
        if (file && file.error) {
            return res.status(500).send(file.error);
        } else if (!file) {
            return res.status(404).send({error: true, errorCode: 'file.not_found'});
        }

        res.set('Content-Type', 'application/octet-stream');
        // TODO: chinese encoding issue
        res.set('Content-Disposition', 'attachment;filename="' + urlencode(file.filename, "utf8") + '"');

        let filedata = await pow.ffs.get(cid);
        res.status(200).send(Buffer.from(filedata));
    } catch (e) {
        logger.error("get file by cid error: ", e);
        res.status(500).send({error: true, errorCode: 'error.download_file', errorObj: e});
    }
};

export const uploadFile = async (req, res) => {
    let user = await getUserByUsername(req.user.username);
    if (user && user.error) {
        return res.status(500).send(user.error);
    }
    if (!user) {
        return res.status(404)
            .send({error: true, errorCode: 'user.not_found'});
    }

    try {
        logger.info(`staging file: ${req.file.originalname}...`);
        const {cid} = await pow.ffs.stage(req.file.buffer);
        logger.info(`file staged: ${req.file.originalname} -> ${cid}`);

        let file = await getFileByCid(cid);
        if (file && file.error) {
            logger.error("get file by cid error: ", file.error);
            return res.status(500).send(file.error);
        } else if (file) {
            logger.error(`upload a duplicated file: cid= ${cid}`);
            return res.status(500).send({error: true, errorCode: 'you have uploaded this file before.'});
        }

        let opts = Object.assign({}, config.default_storage_config);
        opts["storageConfig"]["cold"]["filecoin"]["addr"] = user.wallet_address;
        logger.info(`push file ${cid} with storage configuration: ${JSON.stringify(opts)}`);
        const {jobId} = await pow.ffs.pushStorageConfig(cid, opts);
        logger.info(`file ${cid} is pushed under jobid ${jobId}`);

        // TODO:
        const jobsCancel = pow.ffs.watchJobs(job => {
            logger.info(`job.id: ${job.id}`);
            logger.info(`job.cid: ${job.cid}`);
            if (job.status === 0) {
                logger.info(`job.status: unspecified`);
            } else if (job.status === 1) {
                logger.info(`job.status: queued`);
            } else if (job.status === 2) {
                logger.info(`job.status: executing`);
            } else if (job.status === 3) {
                logger.info(`job.status: failed`);
                logger.info(`job.errCause: ${job.errCause}`);
                logger.info(`job.dealErrorsList: ${JSON.stringify(job.dealErrorsList)}`);
            } else if (job.status === 4) {
                logger.info(`job.status: canceled`);
            } else if (job.status === 5) {
                logger.info(`job.status: canceled`);
            }
        }, jobId);
        const logsCancel = pow.ffs.watchLogs(logEvent => {
            logger.info(`receive event for cid ${JSON.stringify(logEvent)}`);
        }, cid);

        // save to database
        let fileObj = {
            cid,
            filename: req.file.originalname,
            filesize: req.file.size,
            user_id: req.user.id,
        };
        let newFile = await insertFile(fileObj);

        return res.status(200).send({error: false, data: { ...fileObj, id: newFile[0]}});
    } catch (e) {
        return res.status(500).send({error: true, errorCode: 'files.store_error', errorObj: e});
    }
};

export const putFile = async (req, res) => {
    let newFile = await insertFile({
        cid: req.body.cid,
        filename: req.body.filename,
        filesize: req.body.size,
        user_id: req.user.id,
    });

    return res.status(200).send({error: false, data: newFile});
};

export const searchFiles = async (req, res) => {
    // TODO: pagination
    try {
        let result;
        if (req.query.q) {
            result = await db.select("*")
                .from("files")
                .where('user_id', req.user.id)
                .andWhere(function () {
                    this.where('filename', 'like', `%${req.query.q}%`)
                        .orWhere('cid', req.query.q)
                });
        } else {
            result = await db.select("*")
                .from("files")
                .where('user_id', req.user.id);
        }
        return res.status(200).send({error: false, data: result});
    } catch (e) {
        logger.error(`search files failed: `, e);
        return res.status(500).send({ error: true, errorCode: 'files.search_error', errorObj: e});
    }
};

const getFileByCid = async(cid) => {
    try {
        const result = await db.select("*")
            .from("files")
            .where({cid})
            .first();
        if (!result) {
            return null;
        }
        if (result.error) {
            return {error: true, errorCode: 'internal.error', errorObj: result.error};
        }
        if (result.id) {
            return JSON.parse(JSON.stringify(result));
        }
        return null;
    } catch (e) {
        logger.error("getFileByCid query error:", e);
        return { error: true, errorCode: 'internal.error', errorObj: e };
    }
};

const insertFile = async(file) => {
    try {
        logger.info(`inserting ${file.cid} into database...`);
        return await db.insert(file).into("files");
    } catch (e) {
        logger.error("insert file ${file.cid} failed: ", e);
        return {error:true, errorCode: 'file.insert_error', errorObj: e};
    }
};