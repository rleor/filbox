import db from "../service/database";
import pow from "../service/pow";
import { isStringEmpty, validatePassword, validateUsername } from "../util";
import BCrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
const config = require('config-lite')(__dirname);
import log4js from "../logger";

var logger = log4js.getLogger('user');

export const createUser = async (req, res) => {
    // validate username and password
    const username = req.body.username;
    if (!validateUsername(username)) {
        return res.status(500).send({ error: true, errorCode: 'user.invalid_username' });
    }
    const password = req.body.password;
    if (!validatePassword(password)) {
        return res.status(500).send({ error: true, errorCode: 'user.invalid_password' });
    }

    // check if user exists.
    let user = await getUserByUsername(username);
    if (user && user.error) {
        return res.status(500).send(user.error);
    }
    if (user) {
        return res.status(500)
            .send({error: true, errorCode: 'user.exists'});
    }

    // create filecoin address for user
    let wallet_address;
    try {
        logger.info("ffs new address for " + username + "...");
        let {addr} = await pow.ffs.newAddr(username);
        wallet_address = addr;
        logger.info(`${username}'s address is ${wallet_address}`);
    } catch (e) {
        return res.status(500).send({error: true, errorCode: 'user.create_address_error', errorObj: e});
    }

    // save to database
    const salt = await BCrypt.genSalt(Number(config.password_rounds));
    const encrypted_password = await encryptPassword(password, salt);
    const newUser = await insertUser(username, encrypted_password, salt, wallet_address);
    if (!newUser) {
        return res.status(500).send({error: true, errorCode: 'user.create_error'});
    }
    if (newUser.error) {
        return res.status(500).send({error: true, errorCode: 'user.create_error', errorObj: newUser.error});
    }
    return res.status(200).send({error: false, data: newUser});
};

export const signIn = async (req, res) => {
    // validate username and password
    const username = req.body.username;
    if (isStringEmpty(username)) {
        return res.status(500).send({error:true, errorCode: 'user.empty_username'});
    }
    const password = req.body.password;
    if (isStringEmpty(password)) {
        return res.status(500).send({error:true, errorCode: 'user.empty_password'});
    }

    // check user exist
    let user = await getUserByUsername(username);
    if (!user) {
        return res.status(400).send({error: true, errorCode: 'user.not_found'});
    }
    if (user.error) {
        return res.status(500).send(user.error);
    }

    // check password
    const expected = await encryptPassword(password, user.salt);
    if (expected !== user.encrypted_password) {
        return res.status(401).send({error: true, errorCode: 'user.invalid_password'});
    }

    // generate token
    const token = jwt.sign({id: user.id, username: user.username}, config.jwt_secret, {
        expiresIn: config.jwt_expire_in
    });
    return res.status(200).send({ error: false, data: { token }});
};

export const getProfile = async (req, res) => {
    // let id = req.params.id;
    // if (parseInt(id) !== req.user.id) {
    //     // TODO: there is no role based permission mechanism, only himself can get profile.
    //     return res.status(403).send({ error: true, errorCode: 'user.no_permission'});
    // }

    let currentUser = await getUserByUsername(req.user.username);
    if (!currentUser) {
        return res.status(404).send({ error: true, errorCode: 'user.not_found'});
    }
    if (currentUser.error) {
        return res.status(500).send({ error: true, errorCode: 'internal_error'});
    }
    let wallet_balance;
    try {
        const {balance} = await pow.wallet.balance(currentUser.wallet_address);
        logger.info(`fetch ${currentUser.wallet_address}'s balance: ${balance}`);
        wallet_balance = balance;
    } catch (e) {
        return res.status(500).send({ error: true, errorCode: 'user.get_balance_fail', errorObj: e});
    }

    return res.status(200).send({ error: false, data: {
        id: currentUser.id,
        username: currentUser.username,
        created_at: currentUser.created_at,
        updated_at: currentUser.updated_at,
        wallet_address: currentUser.wallet_address,
        wallet_balance,
    }});
}

export const getUserByUsername = async (username) => {
    try {
        const queryResult = await db.select("*")
            .from("users")
            .where({username})
            .first();
        if (!queryResult) {
            return null;
        }
        if (queryResult.error) {
            console.error("getUserByUsername query error:", queryResult.error);
            return { error: true, errorCode: 'internal.error', errorObj: queryResult.error };
        }

        if (queryResult.id) {
            return JSON.parse(JSON.stringify(queryResult));
        }

        return null;
    } catch (e) {
        console.error("getUserByUsername query error:", e);
        return { error: true, errorCode: 'internal.error', errorObj: e };
    }
};

const insertUser = async (username, encrypted_password, salt, address) => {
    try {
        return await db.insert({
            username,
            encrypted_password,
            salt,
            wallet_address: address
        }).into("users");
    } catch (e) {
        return { error: true, errorCode: 'user.create_error', errorObj: e };
    }
};

const encryptPassword = async (password, salt) => {
    if (!password) {
        return null;
    }

    let hash = password;
    for (let i = 0; i < config.password_rounds; i++) {
        hash = await BCrypt.hash(hash, salt);
    }

    return hash;
};