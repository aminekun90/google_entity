'use strict';

var expect = require('chai').expect;
var entity = require('../index');
var utils = require('../utils')

describe('#utils', function () {
    it('shold return correct updated object', function () {
        let oldObj = {
            atr1: 'Hi',
            atr2: 'My friend'
        };
        let updates = {
            atr2: 'My brother'
        };
        let result = utils.getTheUpdatedObject(oldObj, updates);
        expect(result).to.deep.equal({
            atr1: 'Hi',
            atr2: 'My brother'
        });
    });
    it('should say is empty equals true', () => {
        expect(utils.isEmpty({})).to.equal(true);
    });
    it('should say is empty equals false', () => {
        expect(utils.isEmpty({
            atr: 'Not empty'
        })).to.equal(false);
    });
});
describe('#entity', function () {

});