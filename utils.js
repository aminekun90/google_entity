/**
 * Verify if an object is Empty
 * @param {any} obj 
 */
exports.isEmpty = (obj) => {
    for (let key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
};
/**
 * Update values of an object from new values
 * @param {*} oldOne The Object
 * @param {*} newOne new Values to edit
 */
exports.getTheUpdatedObject = (oldOne, newOne) => {

    for (let $key in newOne) {
        oldOne[$key] = newOne[$key];
    }
    return oldOne;
}