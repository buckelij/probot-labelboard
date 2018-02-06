const request = jest.genMockFromModule('request')

var response = {}
const __setResponse = (fn) => {
  response = fn()
}
request.post = (req, callback) => { callback(null, {}, response) }
request.__setResponse = __setResponse

module.exports = request
