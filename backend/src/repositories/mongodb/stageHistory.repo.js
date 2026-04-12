const StageHistoryView = require('../../models/nosql/StageHistoryView');
const createMongoRepo  = require('./_factory');
module.exports = createMongoRepo(StageHistoryView);
