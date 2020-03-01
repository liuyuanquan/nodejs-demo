/**
 * 处理 TCP 粘包
 * 数据格式：头部-消息头序号（2字节）+ 头部-消息体长度（2字节）+ 消息体（n字节）
 */
function Transcoder() {
  if (!new.target) {
   return new Transcoder()
  }
  this.serialNumber = 0 // 包序号
  this.packageSerialNumberLen = 2 // 包序列号所占用的字节
  this.packageHeaderLen = 4 // 包头字节长度
}
Transcoder.prototype = {
  encode(data) {
    const body = Buffer.from(data)
    const header = Buffer.alloc(this.packageHeaderLen)
    header.writeInt16LE(++this.serialNumber)
    header.writeInt16LE(Buffer.byteLength(body), this.packageSerialNumberLen)
    return Buffer.concat([header, body])
  },
  decode(buffer) {
    const header = buffer.slice(0, this.packageHeaderLen)
    const body = buffer.slice(this.packageHeaderLen)
    return {
      serialNumber: header.readInt16LE(),
      bodyLength: header.readInt16LE(this.packageSerialNumberLen),
      body: body.toString()
    }
  },
  getPackageLength(buffer) {
    if (buffer.length < this.packageHeaderLen) {
      return 0
    }
    return this.packageHeaderLen + buffer.readInt16LE(this.packageSerialNumberLen)
  }
}

module.exports = Transcoder