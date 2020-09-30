# Filbox

## Deployment
* install node, npm, yarn
* add configuration file under config/
* database setup
    - install MySQL8.0
    - create database filbox
    - add db user
    - table initialization: export NODE_ENV=test && yarn setup-database

## TODO
- [ ] database ssl connection for production environment
- [x] rolling log file support
- [ ] push file events store
- [ ] file storage status handling
- [ ] upload files with chunks
