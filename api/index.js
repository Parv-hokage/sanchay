const handler = require('../apps/api/dist/serverless').default;

module.exports = async (req, res) => {
  return handler(req, res);
};
