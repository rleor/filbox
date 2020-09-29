import pow from "../service/pow";
import db from "../service/database";
import urlencode from "urlencode";
const config = require('config-lite')(__dirname);
import { getUserByUsername } from "../service/user";

export const downloadFileByCid = async(req, res) => {
    let cid = req.params.cid;
    try {
        console.log(`download file cid: ${cid}`);

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
        console.log("get file by cid error: ", e);
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

    console.log(req.file.originalname);
    try {
        const {cid} = await pow.ffs.stage(req.file.buffer);
        console.log(`staged file: ${req.file.originalname} -> ${cid}`);

        let file = await getFileByCid(cid);
        if (file && file.error) {
            return res.status(500).send(file.error);
        } else if (file) {
            return res.status(500).send({error: true, errorCode: 'you have uploaded this file before.'});
        }

        let opts = Object.assign({}, config.default_storage_config);
        opts["storageConfig"]["cold"]["filecoin"]["addr"] = user.wallet_address;
        console.log(`storage configuration: ${JSON.stringify(opts)}`);
        const {jobId} = await pow.ffs.pushStorageConfig(cid, opts);

        // test
        const jobsCancel = pow.ffs.watchJobs(job => {
            console.log(`job.id: ${job.id}`);
            console.log(`job.cid: ${job.cid}`);
            if (job.status === 0) {
                console.log(`job.status: unspecified`);
            } else if (job.status === 1) {
                console.log(`job.status: queued`);
            } else if (job.status === 2) {
                console.log(`job.status: executing`);
            } else if (job.status === 3) {
                console.log(`job.status: failed`);
                console.log(`job.errCause: ${job.errCause}`);
                console.log(`job.dealErrorsList: ${JSON.stringify(job.dealErrorsList)}`);
            } else if (job.status === 4) {
                console.log(`job.status: canceled`);
            } else if (job.status === 5) {
                console.log(`job.status: canceled`);
            }
        }, jobId);
        const logsCancel = pow.ffs.watchLogs(logEvent => {
            console.log(`receive event for cid ${JSON.stringify(logEvent)}`);
        }, cid);

        // save to database
        let newFile = await insertFile({
            cid,
            filename: req.file.originalname,
            filesize: req.file.size,
            user_id: req.user.id,
        });

        return res.status(200).send({error: false, data: {id: newFile[0], cid: cid}});
    } catch (e) {
        return res.status(500).send({error: true, errorCode: 'files.store_error', errorObj: e});
    }
};

export const putFile = async (req, res) => {
    let newFile = await insertFile({
        cid: req.body.cid,
        filename: req.body.filename,
        filesize: req.body.size,
        user_id: req.body.user_id,
    });

    return res.status(200).send({error: false, data: newFile});
};

export const searchFiles = async (req, res) => {
    // TODO: pagination
    let result;
    if (req.query.q) {
        result = await db.select("*")
            .from("files")
            .where('user_id', req.user.id)
            .andWhere(function() {
                this.where('filename', 'like', `%${req.query.q}%`)
                    .orWhere('cid', req.query.q)
            });
    } else {
        result = await db.select("*")
            .from("files")
            .where('user_id', req.user.id);
    }
    console.log("search file result: ", result);
    return res.status(200).send({error: false, data: result});
};

const getFileByCid = async(cid) => {
    try {
        const result = await db.select("*")
            .from("files")
            .where({cid})
            .first();
        console.log(result);
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
        console.error("getFileByCid query error:", result.error);
        return { error: true, errorCode: 'internal.error', errorObj: e };
    }
};

const insertFile = async(file) => {
    try {
        return await db.insert(file).into("files");
    } catch (e) {
        console.log("insert file failed: ", e);
        return {error:true, errorCode: 'file.insert_error', errorObj: e};
    }
};