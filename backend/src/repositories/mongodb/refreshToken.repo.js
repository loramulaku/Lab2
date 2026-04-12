const RefreshTokenView = require('../../models/nosql/RefreshTokenView');
const createMongoRepo = require('./_factory');
module.exports = createMongoRepo(RefreshTokenView);
