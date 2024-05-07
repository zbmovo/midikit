export enum META {
  /** FF 00 02 */
  SEQUENCE_NUMBER = 0x00,
  /** FF 01 text */
  TEXT_EVENT = 0x01,
  /** FF 02 text */
  COPYRIGHT_NOTICE = 0x02,
  /** FF 03 text */
  SEQUENCE_TRACK_NAME = 0x03,
  /** FF 04 text */
  INSTRUMENT_NAME = 0x04,
  /** FF 05 text */
  LYRIC = 0x05,
  /** FF 06 text */
  MARKER = 0x06,
  /** FF 07 text */
  CUE_POINT = 0x07,
  /** FF 09 text */
  DEVICE_NAME = 0x09,
  /** FF 20 01 channel */
  MIDI_CHANNEL_PREFIX = 0x20,
  /** FF 21 01 port */
  MIDI_PORT = 0x21,
  /** FF 2F 00 */
  END_OF_TRACK = 0x2f,
  /**
   * FF 51 03 quarter-note
   * MICROSECONDS_PER_MINUTE = 60000000
   * BPM = MICROSECONDS_PER_MINUTE / MPQN
   * MPQN = MICROSECONDS_PER_MINUTE / BPM
   */
  SET_TEMPO = 0x51,
  /** FF 54 05 hr mn se fr ff */
  SMPTE_OFFSET = 0x54,
  /** FF 58 04 numer denom metro 32nds */
  TIME_SIGNATURE = 0x58,
  /** FF 59 02 sf mi */
  KEY_SIGNATURE = 0x59,
  /** FF 7F vql */
  SEQUENCER_SPECIFIC = 0x7f,
  /** FF */
  EVENT = 0xff,
}

export enum MIDI {
  /** 8n note velocity */
  NOTE_OFF = 0x8,
  /** 9n note velocity */
  NOTE_ON = 0x9,
  /** An note aftertouch */
  NOTE_AFTERTOUCH = 0xa,
  /** Bn number value */
  CONTROLLER = 0xb,
  /** Cn program */
  PROGRAM_CHANGE = 0xc,
  /** Dn aftertouch */
  CHANNEL_AFTERTOUCH = 0xd,
  /** En LSB MSB */
  PITCH_BEND = 0xe,
}

export enum SYSEX {
  /**
   * CASE_1 =  F0 -> vql -> data + F7
   * CASE_2 =  F0 -> vql -> data -> [(F7 -> vql -> data) * n] + F7
   */
  SYSEX_EVENT = 0xf0,
  SYSEX_EVENT_END = 0xf7,
}

export enum UNKNOWN {
  UNKNOWN_EVENT = -1,
}

interface EventValueText {
  text: string
}

export interface EventValueMap {
  // META Event Value
  SEQUENCE_NUMBER: { number: number }
  TEXT_EVENT: EventValueText
  COPYRIGHT_NOTICE: EventValueText
  SEQUENCE_TRACK_NAME: EventValueText
  INSTRUMENT_NAME: EventValueText
  LYRIC: EventValueText
  MARKER: EventValueText
  CUE_POINT: EventValueText
  DEVICE_NAME: EventValueText
  MIDI_CHANNEL_PREFIX: { channel: number }
  MIDI_PORT: { port: number }
  END_OF_TRACK: null
  SET_TEMPO: { quarterNote: number }
  SMPTE_OFFSET: {
    hour: number
    minutes: number
    seconds: number
    frames: number
    fframes: number
  }
  TIME_SIGNATURE: {
    numerator: number
    denominator: number
    clocks: number
    nd32: number
  }
  KEY_SIGNATURE: {
    keySignature: number
    mode: number
  }
  SEQUENCER_SPECIFIC: {
    manufIDCode: number
  }

  // MIDI Event Value
  NOTE_OFF: {
    note: number
    velocity: number
    channel: number
  }
  NOTE_ON: {
    note: number
    velocity: number
    channel: number
  }
  NOTE_AFTERTOUCH: {
    note: number
    aftertouch: number
    channel: number
  }
  CONTROLLER: {
    number: number
    value: number
    channel: number
  }
  PROGRAM_CHANGE: {
    program: number
    channel: number
  }
  CHANNEL_AFTERTOUCH: {
    aftertouch: number
    channel: number
  }
  PITCH_BEND: {
    lsb: number
    msb: number
    channel: number
  }

  // SYSEX Event Value
  SYSEX_EVENT: {
    value: number[]
    done: boolean
  }
  SYSEX_EVENT_END: {
    value: number[]
    done: boolean
  }

  // unknown Event
  UNKNOWN_EVENT: null
}

export interface EventValue<T extends keyof EventValueMap> {
  delta: number
  event: number
  type: "META" | "MIDI" | "SYSEX" | "UNKNOWN"
  name: T
  data: EventValueMap[T]

  startTicks: number
  startTime: number
}

export type MIDIEvent<T = keyof EventValueMap> = T extends keyof EventValueMap
  ? EventValue<T>
  : unknown
