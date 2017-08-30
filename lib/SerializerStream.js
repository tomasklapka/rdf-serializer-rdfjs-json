const Readable = require('readable-stream')

class SerializerStream extends Readable {
  constructor (input, options) {
    super({
      objectMode: true
    })

    input.on('data', (quad) => {
      this.push(JSON.stringify(quad))
      this.push('\n')
    })

    input.on('end', () => {
      this.push(null)
    })

    input.on('error', (err) => {
      this.emit('error', err)
    })
  }

  _read () {}
}

module.exports = SerializerStream
