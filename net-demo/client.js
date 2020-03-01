const net = require('net')
const transcoder = require('./transcoder')()
const HOST = '127.0.0.1'
const PORT = 3007

const client = net.createConnection(PORT, HOST)

let overageBuffer = null // 上一次 Buffer 剩余数据

client.on('data', buffer => {
  if (overageBuffer) {
    buffer = Buffer.concat([overageBuffer, buffer])
  }
  let packageLength = 0
  while (packageLength = transcoder.getPackageLength(buffer)) {
    const package = buffer.slice(0, packageLength)
    buffer = buffer.slice(packageLength)
    const result = transcoder.decode(package)
    console.log('服务器: ' + JSON.stringify(result))
  }
  overageBuffer = buffer
}).on('close', err => {
  console.log('客户端链接断开！', err)
}).on('error', err => {
  console.error('服务器异常：', err)
})

const arr = [
  '0 Nodejs 技术栈 ',
  '1 JavaScript ',
  '2 TypeScript ',
  '3 Python ',
  '4 Java ',
  '5 C ',
  '6 PHP ',
  '7 ASP.NET '
]

for (let i = 0;i < arr.length;i++) {
  client.write(transcoder.encode(arr[i]))
}

