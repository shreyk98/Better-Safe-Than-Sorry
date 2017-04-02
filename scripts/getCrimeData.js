function getData(address, dataset){
  console.log('Getting data');

  //var soda = require('../lib/soda-js/lib/soda-js.bundle.js');

  var consumer = new soda.Consumer('data.lacity.org');

  consumer.query()
    .withDataset('y9pe-qdrd')
    .limit(5)
    .order('area')
    .getRows()
      .on('success', function(rows) { console.log(rows);})
      .on('error', function(error) { console.error(error);});
}

getData('data.lacity.org', 'y9pe-qdrd');