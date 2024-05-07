export function createReader(buffer: Uint8Array) {
  let index = 0
  const decoder = new TextDecoder()

  function read(size = 1) {
    return buffer.subarray(index, (index += size))
  }

  function readTextAt(size = 1) {
    return decoder.decode(read(size))
  }

  function readIntAt(size = 1) {
    return read(size).reduce((a, b) => (a << 8) | b, 0)
  }

  function readIntLEAt(size = 1) {
    return read(size).reduce((a, b, i) => a | (b << (i * 8)), 0)
  }

  function readText() {
    let size = 0
    do {
      size++
    } while (buffer[index + size] !== 0)
    return readTextAt(size)
  }

  function uintvar() {
    let result = 0
    while (true) {
      result <<= 7
      result |= buffer[index] & 0x7f
      index++
      if (buffer[index - 1] >> 7 === 0) {
        break
      }
    }
    return result
  }

  return {
    read,
    readTextAt,
    readIntAt,
    readIntLEAt,
    readText,
    uintvar,
    get ended() {
      return index > buffer.length - 1
    },
  }
}

export type Reader = ReturnType<typeof createReader>
