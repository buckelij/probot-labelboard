const request = jest.genMockFromModule('request')

request.post = (req, callback) => { callback(null, {}, {}) }

module.exports = request
