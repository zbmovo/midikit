export interface EnvelopeValues {
  attack: number
  decay: number
  sustain: number
  release: number
}

export class Envelope {
  private envelope: EnvelopeValues
  private node: AudioParam
  constructor(node: AudioParam, options: EnvelopeValues) {
    this.envelope = options
    this.node = node
  }

  triggerAttack(value: number, startTime: number) {
    const { attack, decay, sustain } = this.envelope
    this.node.cancelScheduledValues(startTime)
    this.node.setValueAtTime(0, startTime)
    this.node.exponentialRampToValueAtTime(value, (startTime += attack))
    this.node.linearRampToValueAtTime(sustain, (startTime += decay))
  }

  triggerRelease(startTime: number) {
    this.node.linearRampToValueAtTime(0, startTime + this.envelope.release)
  }
}
