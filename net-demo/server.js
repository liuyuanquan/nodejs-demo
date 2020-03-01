const net = require('net')
const transcoder = require('./transcoder')()
const HOST = '127.0.0.1'
const PORT = 3007

let overageBuffer = null // 上一次 Buffer 剩余数据 

const server = net.createServer()

server.listen(PORT, HOST)

server.on('listening', () => {
  console.log(`服务已开启在 ${HOST}:${PORT}`)
}).on('connection', socket => {
  socket.on('data', buffer => {
    if (overageBuffer) {
      buffer = Buffer.concat([overageBuffer, buffer])
    }
    let packageLength = 0
    while (packageLength = transcoder.getPackageLength(buffer)) {
      const package = buffer.slice(0, packageLength)
      buffer = buffer.slice(packageLength)
      const result = transcoder.decode(package)
      console.log('客户端: ' + JSON.stringify(result))
      socket.write(transcoder.encode(result.body))
    }
    overageBuffer = buffer
  }).on('end', () => {
    console.log('socket end')
  }).on('error', error => {
    console.log('socket error', error)
  })
}).on('close', () => {
  console.log('Server Close!')
}).on('error', (e) => {
  switch (e.code) {
    case 'EADDRINUSE':
      console.log('地址正被使用，重试中...')
      setTimeout(() => {
        server.close()
        server.listen(PORT, HOST)
      }, 1000)
      break
    default:
      console.error('服务器异常：', err)
  }
})



