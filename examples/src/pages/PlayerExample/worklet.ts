declare class AudioWorkletProcessor {
  readonly port: MessagePort
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean
}

declare function registerProcessor(
  name: string,
  processor: typeof AudioWorkletProcessor,
): void

class Transfer extends AudioWorkletProcessor {
  index = 0
  closed = false
  process(inputs: Float32Array[][]) {
    const input = inputs[0]
    this.port.postMessage({
      input,
      offset: this.index * 128,
    })

    this.index++
    return true
  }
}

registerProcessor("Transfer", Transfer)
