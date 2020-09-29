import db from "../service/database";

db.schema.hasTable('users')
    .then(has => {
        if (!has) {
            db.schema
                .createTable('users', table => {
                    table.increments('id');
                    table.string('username', 32).notNullable();
                    table.string('encrypted_password');
                    table.string('salt');
                    table.string("wallet_address", 86);

                    table.timestamps(true, true);

                    table.index('username');
                    table.charset('utf8');
                })
                .then(() =>
                    console.log('table users created.')
                )
                .catch(e => {
                    console.error("create table error:", e);
                });
        } else {
            console.log("table users already exists.");
        }
    })
    .catch(e =>
        console.error("check table user exist error:", e)
    );

db.schema.hasTable('files')
    .then(has => {
        if (!has) {
            db.schema.createTable('files', table => {
                table.increments('id');
                table.string('filename');
                table.string('cid');
                table.integer('filesize');

                table.timestamps(true, true);

                table.integer('user_id').unsigned().notNullable();
                table.foreign('user_id').references('id').inTable('users');

                table.index('filename');
                table.index('cid');
                table.index('user_id');

                table.charset('utf8');
            })
            .then(() =>
                console.log('table files created.')
            )
            .catch(e => {
                console.error("create table files error:", e);
            });
        } else {
            console.log("table files already exists.");
        }
    })
    .catch(e => console.log("check table files exist error: ", e));
