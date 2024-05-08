import { idToFreq } from "@midikit/tools"
import { Envelope, EnvelopeValues } from "./envelope"

export interface Note {
  note: number
  velocity: number
  channel: number
}

export type Channel = Record<number, Envelope>

export interface SynthOptions {
  envelope: EnvelopeValues
  context: AudioContext | OfflineAudioContext
  connect(context: AudioContext | OfflineAudioContext): AudioNode
}

export class Synth {
  context: AudioContext | OfflineAudioContext
  channels: Record<number, Channel> = {}
  private master: AudioNode
  private envelope: EnvelopeValues
  constructor(options: SynthOptions) {
    this.context = options.context
    this.envelope = options.envelope
    this.master = options.connect(this.context)
  }

  private createNote({ note, channel }: Omit<Note, "velocity">) {
    if (typeof this.channels[channel] === "undefined") {
      this.channels[channel] = {}
    }

    if (typeof this.channels[channel][note] === "undefined") {
      const oscillatorNode = new OscillatorNode(this.context, {
        frequency: idToFreq(note),
        type: "triangle",
      })

      const gainNode = new GainNode(this.context, { gain: 0 })
      oscillatorNode.connect(gainNode).connect(this.master)
      oscillatorNode.start()

      this.channels[channel][note] = new Envelope(gainNode.gain, this.envelope)
    }

    return this.channels[channel][note]
  }

  attack(
    { note, channel, velocity }: Note,
    startTime = this.context.currentTime,
  ) {
    this.createNote({ note, channel }).triggerAttack(velocity, startTime)
  }

  release({ note, channel }: Note, startTime = this.context.currentTime) {
    this.createNote({ note, channel }).triggerRelease(startTime)
  }
}
