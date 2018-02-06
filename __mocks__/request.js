const request = jest.genMockFromModule('request')

request.post = (req, callback) => {callback({ },{ },{ })}

module.exports = request
