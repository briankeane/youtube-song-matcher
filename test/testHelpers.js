const { assert } = require('chai');

function checkAndClearNocks(nock) {
  if(!nock.isDone()) {
    console.log('remaining Nocks: ', nock.pendingMocks());
    throw assert.fail('Not all nock interceptors were used!');
  }
  nock.cleanAll();
}

module.exports = {
  checkAndClearNocks
};