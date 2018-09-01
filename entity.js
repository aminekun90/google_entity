'use strict';

/** Core */
/** Datastore */
const Datastore = require('@google-cloud/datastore');
const utils = require('./utils');
const datastore = Datastore();
const uuidv4 = require('uuid/v4');

/**
 * Get entities by kind
 * @author amine.bouzahar
 * @returns {Promise}
 * @param {kind:string} obj 
 */
exports.getEntities = (obj) => {
    let kind = obj.kind;
    const query = datastore.createQuery(kind);
    return new Promise((resolve, reject) => {

        datastore.runQuery(query)
            .then((results) => {

                const entities = results[0];

                entities.forEach((entity) => {
                    entity.id = entity[datastore.KEY].id ? entity[datastore.KEY].id : entity[datastore.KEY].name;
                    entity.kind = entity[datastore.KEY].kind;
                });

                resolve(entities);
            }).catch(err => {
                reject({
                    success: false,
                    message: err.message,
                    err: 'This error was on get entities for : ' + kind
                });
            });
    }); // promise

};

/**
 * Get an entity by id
 * @author amine.bouzahar
 * @returns {Promise}
 * @param {id:string} obj should contain an id
 */
exports.getEntity = (obj) => {

    let id = obj.id;
    let kind = obj.kind;
    let entityKey = datastore.key([kind, id]);
    return new Promise((resolve, reject) => {

        datastore.get(entityKey).then((entity) => {
            //console.log('Found ' + kind + ' ' + entity[0]);
            if (entity[0] === undefined) {
                resolve({
                    success: false,
                    status: 404,
                    message: `Sorry no ${kind} found`
                });

            } else {
                entity[0].id = id;
                entity[0].kind = kind;
                resolve(entity[0]);
            }
        }).catch((err) => {
            reject({
                success: false,
                status: 500,
                message: err.message
            });
        });
    })
};
/**
 * Get entities of the same kind with attributes
 * @author amine.bouzahar
 * @returns {Promise}
 * @param {kind:string,atributes:any} obj the obj should contain a kind and attributes property.
 */
exports.getEntitiesByAttributes = (obj) => {
    let kind = obj.kind;
    let attributes = obj.attributes;
    const query = datastore.createQuery(kind);
    for (let key in attributes) {
        query.filter(key, '=', attributes[key]);
    }
    return new Promise((resolve, reject) => {
        datastore.runQuery(query)
            .then((results) => {

                const entities = results[0];

                entities.forEach((entity) => {
                    entity.id = entity[datastore.KEY].id ? entity[datastore.KEY].id : entity[datastore.KEY].name;
                    entity.kind = entity[datastore.KEY].kind;
                });

                resolve(entities);
            }).catch(err => {
                reject({
                    success: false,
                    message: err.message
                });
            });
    }); //promise
};

/**
 * Add an entity
 * @author amine.bouzahar
 * @returns {Promise}
 * @param {id?:string,data:{any}} obj The entity to push to database if the id is not specified it's stored as uuidv4
 * @param {Array<string>} listOfNonIndexed list of non indexed attributes
 */
exports.addEntity = (obj, listOfNonIndexed = []) => {
    let id = (obj.id === undefined) ? uuidv4() : obj.id;

    // console.log('ID ' + obj.kind + " ", id);

    let kind = obj.kind;
    let data = obj.data;
    return new Promise((resolve, reject) => {

        if (!utils.isEmpty(obj)) {

            let entityKey = null;
            if (id !== undefined) {
                entityKey = datastore.key([kind, id]);
            } else {

                entityKey = datastore.key(kind, uuidv4());

            }

            const entity = {
                key: entityKey,
                data: data
            };

            if (listOfNonIndexed.length > 0) {
                entity.excludeFromIndexes = listOfNonIndexed;
            }

            // console.log(entity);

            datastore.save(entity)
                .then(() => {

                    resolve({
                        success: true,
                        message: `${kind} added successfully`,
                        id: entityKey.name
                    });
                })
                .catch((err) => {
                    reject({
                        success: false,
                        message: `Error: ${err.message}`
                    });
                });
        } else {
            reject({
                success: false,
                message: 'You trying to save an empty object'
            });
        }
    }); //promise
};

/**
 * Update an entity
 * @author amine.bouzahar
 * @returns {Promise}
 * @param {id:string,data:{any}} obj The entity to push to database the id must be defined should contain an id and data
 * @param {Array<string>} listOfNonIndexed list of non indexed attributes
 */
exports.updateEntity = (obj, listOfNonIndexed = []) => {

    let id = obj.id;
    let kind = obj.kind;
    let updates = obj.updates;
    // let updates = req.body.updates;
    let entityKey = datastore.key([kind, id]);
    // console.log('UPDATE --> ',obj);
    return new Promise((resolve, reject) => {

        datastore.get(entityKey).then((entity) => {
            if (entity[0]) {
                let newUpdates = utils.getTheUpdatedObject(entity[0], updates);
                let entityUpdates = {
                    key: entityKey,
                    data: newUpdates
                };
                if (listOfNonIndexed.length > 0) {
                    entityUpdates.excludeFromIndexes = listOfNonIndexed;
                }
                //console.log('UPDATES-->', entityUpdates);
                datastore.update(entityUpdates)
                    .then(() => {
                        resolve({
                            success: true,
                            message: `${kind} updated successfully`,
                            entity: entity
                        });
                    }).catch(err => {
                        reject(err);
                    });
            } else {
                resolve({
                    message: `Nothing to update ! the entry in ${kind} you are looking for doesn't exist !`
                })
            }
        }).catch((err) => {
            reject({
                success: false,
                message: err.message
            });
        });


    }); // promise
};

/**
 * Delete an entity
 * @author amine.bouzahar
 * @returns {Promise}
 * @param {kind:string,id:string} obj The entity to delete should contain the kind and the id
 */
exports.deleteEntity = (obj) => {
    let kind = obj.kind;
    let id = obj.id;
    return new Promise((resolve, reject) => {
        const entityKey = datastore.key([kind, id]);

        datastore.delete(entityKey).then(() => {
            resolve({
                success: true,
                message: 'Record deleted successfully.'
            });
        }).catch((err) => {
            reject({
                success: false,
                message: 'Entity cannot be deleted !',
                error: err
            });
        });

    });
};





/**
 * Get different entities from keys
 * @param {*} objs list of object that containes {kind:string,id:string}
 * @author amine.bouzahar
 * @returns {Promise}
 */
exports.getEntitiesFromKeys = (objs) => {
    let entitieskeys = [];
    objs.forEach((obj) => {

        let id = obj.id;
        //console.log('objid ----->', obj.id);
        if (id !== undefined) {
            entitieskeys.push(datastore.key([obj.kind, id]));
        }
    });
    return new Promise((resolve, reject) => {
        datastore.get(entitieskeys).then((results) => {
            const entities = results[0];
            entities.forEach((entity) => {
                entity.id = entity[datastore.KEY].id ? entity[datastore.KEY].id : entity[datastore.KEY].name;
                entity.kind = entity[datastore.KEY].kind;
            });
            resolve(entities);
        }).catch(err => {
            reject({
                success: false,
                message: err.message
            });
        });
    });
};


/**
 * Delete entities from keys
 * @param {Array<any>} objs List of object containing {kind:string,id:string}
 * @author amine.bouzahar
 * @returns {Promise}
 */
exports.deleteEntitiesFromKeys = (objs) => {
    let entitieskeys = [];
    objs.forEach((obj) => {

        let id = obj.id;
        //console.log('objid ----->', obj.id);
        if (id !== undefined) {
            entitieskeys.push(datastore.key([obj.kind, id]));
        }
    });
    console.log('Entities keys ----->', entitieskeys);
    return new Promise((resolve, reject) => {
        datastore.delete(entitieskeys).then(() => {
            resolve({
                success: true,
                message: 'Record deleted successfully.'
            });
        }).catch(err => {
            reject({
                success: false,
                message: err.message
            });
        });
    });
};

/**
 * Add multiple entities that have the same kind
 * @param obj => obj = {data: [], kind: string, token: string} data contains all objects that needed to be pushed
 * @author amine.bouzahar
 * @returns {Promise}
 */
exports.addEntities = (obj) => {
    return new Promise((resolve, reject) => {
        const entities = [];
        const ids = [];

        obj.data.forEach((item) => {
            let id = item.id ? item.id : uuidv4();
            item.id = id;
            ids.push(id);
            let entity = {
                key: datastore.key([obj.kind, id]),
                data: item
            };
            entities.push(entity);
        });
        if (entities.length > 0) {
            datastore.upsert(entities).then((response) => {
                resolve({
                    success: true,
                    data: obj.data
                });
            }).catch((err) => {
                console.log('Error while adding multiple entities', err);
                reject({
                    success: false,
                    error: err
                });
            });
        } else {
            resolve({
                success: false,
                message: 'entities are empty'
            });
        }
    });
};