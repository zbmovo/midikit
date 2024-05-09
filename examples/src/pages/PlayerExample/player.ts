import { MIDIFile } from "@midikit/midi"
import workletUrl from "./worklet?worker&url"

interface PlayerOptions {
  endTime: number
  readNotes({
    context,
    master,
  }: {
    context: OfflineAudioContext
    master: AudioNode
  }): void

  onLoad(loaded: number, count: number): void
  onStateChange(text: string): void
}

function sleep(timeout = 0) {
  return new Promise((resolve) => setTimeout(resolve, timeout))
}

export function parser(buffer: ArrayBuffer) {
  const worker = new Worker(new URL("./worker.ts", import.meta.url), {
    type: "module",
    name: "midi-parser",
  })
  worker.postMessage(buffer)
  return new Promise<MIDIFile>((resolve) => {
    worker.addEventListener("message", (event) => {
      worker.terminate()
      resolve(event.data)
    })
  })
}

export async function player({
  endTime,
  readNotes,
  onLoad,
  onStateChange,
}: PlayerOptions) {
  const sampleRate = 44100
  const duration = sampleRate * endTime
  const length = duration + (128 - (duration % 128))
  const numberOfChannels = 2

  const context = new AudioContext({ sampleRate })
  context.suspend()

  const offline = new OfflineAudioContext({
    length,
    sampleRate,
    numberOfChannels,
  })

  await offline.audioWorklet.addModule(workletUrl)
  const worklet = new AudioWorkletNode(offline, "Transfer")

  const compressor = offline.createDynamicsCompressor()
  const master = offline.createGain()
  master.connect(compressor).connect(worklet).connect(offline.destination)
  master.gain.value = 0.4

  onStateChange("开始加载音符 (黑乐谱请耐心等待，此过程会阻塞主线程)")
  // 下方长任务，会导致上方日志无法展示
  await sleep(1000)
  readNotes({
    context: offline,
    master,
  })
  onStateChange("加载音符完成")

  const buffer = context.createBuffer(numberOfChannels, length, sampleRate)
  worklet.port.onmessage = (event) => {
    const { input, offset } = event.data as {
      input: Float32Array[]
      offset: number
    }

    input.forEach((item, index) => {
      buffer.getChannelData(index).set(item, offset)
    })

    onLoad(offset + 128, length)
  }

  onStateChange("开始缓冲 (此时可以开始播放，但切记 Readed 不能大于 Loaded)")
  offline.startRendering()

  offline.addEventListener("complete", () => {
    onStateChange("缓冲完成")
  })

  const source = context.createBufferSource()
  source.loop = true
  source.buffer = buffer
  source.connect(context.destination)
  source.start()

  return {
    getTime() {
      return context.currentTime % buffer.duration
    },

    play() {
      context.resume()
    },

    pause() {
      context.suspend()
    },

    getReaded() {
      return this.getTime() * sampleRate
    },
  }
}
