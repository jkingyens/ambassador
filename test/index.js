var should = require('should');

describe('ambassador', function () {

  it('should create a jumper without error', function (done) {

    var amb = require('../ambassador');
    amb(3000, 'mongodb', function (err) {
      should.not.exist(err);
      done();
    });

  });

});
