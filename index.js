var ambassador = require('./ambassador');

if (!process.argv[2]) {
  console.error('must pass name of service to be looked up as command line argument');
  process.exit(-1);
}

ambassador(3000, process.argv[2], function (err) {
  if (err) {
    console.error(err.message);
    return process.exit(-1);
  }
  console.log('ready');
});
