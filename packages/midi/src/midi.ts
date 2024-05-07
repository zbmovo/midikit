import { createReader, Reader } from "./reader"
import { MIDI, META, SYSEX, MIDIEvent, EventValue } from "./events"

export interface MIDIChunk {
  id: string
  size: number
  data: Uint8Array
}

export interface Header {
  format: number
  ntrks: number
  division: number
}

export type Track = MIDIEvent[]
export interface MIDIFile {
  header: Header
  tracks: Track[]
}

function readEvent(reader: Reader, prev: MIDIEvent): MIDIEvent {
  const deltaTime = reader.uintvar()
  let event = reader.readIntAt(1)

  const startTicks = typeof prev === "undefined" ? 0 : prev.startTicks
  const result: MIDIEvent = {
    delta: deltaTime,
    event,
    startTicks: deltaTime + startTicks,
    startTime: 0,
    type: "UNKNOWN",
    name: "UNKNOWN_EVENT",
    data: null,
  }

  // system exclusif
  if (event === SYSEX.SYSEX_EVENT) {
    const size = reader.uintvar()
    const value = reader.read(size)

    let done = false
    // single messages
    if (value[value.length - 1] === SYSEX.SYSEX_EVENT_END) {
      done = true
    }

    return {
      ...result,
      type: "SYSEX",
      name: "SYSEX_EVENT",
      data: {
        done,
        value: [...value],
      },
    }
  }

  if (event === SYSEX.SYSEX_EVENT_END) {
    const size = reader.uintvar()
    const value = reader.read(size)
    const { data } = prev as EventValue<"SYSEX_EVENT">

    let done = false
    if (data.done || typeof data.done === "undefined") {
      // escape sequences
      done = true
    } else {
      // continuation events
      if (value[value.length - 1] === 0xf7) {
        done = true
      }
    }

    return {
      ...result,
      type: "SYSEX",
      name: "SYSEX_EVENT_END",
      data: {
        done,
        value: [...value],
      },
    }
  }

  // meta events
  if (event === META.EVENT) {
    const type: META = reader.readIntAt(1)
    const size = reader.uintvar()

    result.type = "META"
    switch (type) {
      case META.SEQUENCE_NUMBER:
        return {
          ...result,
          name: "SEQUENCE_NUMBER",
          data: {
            number: reader.readIntAt(2),
          },
        }

      case META.TEXT_EVENT:
        return {
          ...result,
          name: "TEXT_EVENT",
          data: {
            text: reader.readTextAt(size),
          },
        }

      case META.COPYRIGHT_NOTICE:
        return {
          ...result,
          name: "COPYRIGHT_NOTICE",
          data: {
            text: reader.readTextAt(size),
          },
        }

      case META.SEQUENCE_TRACK_NAME:
        return {
          ...result,
          name: "SEQUENCE_TRACK_NAME",
          data: {
            text: reader.readTextAt(size),
          },
        }

      case META.INSTRUMENT_NAME:
        return {
          ...result,
          name: "INSTRUMENT_NAME",
          data: {
            text: reader.readTextAt(size),
          },
        }

      case META.LYRIC:
        return {
          ...result,
          name: "LYRIC",
          data: {
            text: reader.readTextAt(size),
          },
        }

      case META.MARKER:
        return {
          ...result,
          name: "MARKER",
          data: {
            text: reader.readTextAt(size),
          },
        }

      case META.CUE_POINT:
        return {
          ...result,
          name: "CUE_POINT",
          data: {
            text: reader.readTextAt(size),
          },
        }

      case META.DEVICE_NAME:
        return {
          ...result,
          name: "DEVICE_NAME",
          data: {
            text: reader.readTextAt(size),
          },
        }

      case META.MIDI_CHANNEL_PREFIX:
        return {
          ...result,
          name: "MIDI_CHANNEL_PREFIX",
          data: {
            channel: reader.readIntAt(1),
          },
        }

      case META.MIDI_PORT:
        return {
          ...result,
          name: "MIDI_PORT",
          data: {
            port: reader.readIntAt(1),
          },
        }

      case META.END_OF_TRACK:
        return {
          ...result,
          name: "END_OF_TRACK",
          data: null,
        }

      case META.SET_TEMPO:
        return {
          ...result,
          name: "SET_TEMPO",
          data: {
            quarterNote: reader.readIntAt(3),
          },
        }

      case META.SMPTE_OFFSET:
        return {
          ...result,
          name: "SMPTE_OFFSET",
          data: {
            hour: reader.readIntAt(1),
            minutes: reader.readIntAt(1),
            seconds: reader.readIntAt(1),
            frames: reader.readIntAt(1),
            fframes: reader.readIntAt(1),
          },
        }

      case META.TIME_SIGNATURE:
        return {
          ...result,
          name: "TIME_SIGNATURE",
          data: {
            numerator: reader.readIntAt(1),
            denominator: reader.readIntAt(1) ** 2,
            clocks: reader.readIntAt(1),
            nd32: reader.readIntAt(1),
          },
        }

      case META.KEY_SIGNATURE:
        return {
          ...result,
          name: "KEY_SIGNATURE",
          data: {
            keySignature: reader.readIntAt(1),
            mode: reader.readIntAt(1),
          },
        }

      case META.SEQUENCER_SPECIFIC:
        return {
          ...result,
          name: "SEQUENCER_SPECIFIC",
          data: {
            manufIDCode: reader.readIntAt(size),
          },
        }
    }
  } else {
    // midi events

    let first = 0
    if (event < 0x80) {
      first = event
      result.event = event = prev.event
    } else {
      first = reader.readIntAt(1)
    }

    const type: MIDI = event >> 4
    const channel = event & 0x0f

    result.type = "MIDI"
    switch (type) {
      case MIDI.NOTE_OFF:
        return {
          ...result,
          name: "NOTE_OFF",
          data: {
            note: first,
            velocity: reader.readIntAt(1) / 0x7f,
            channel,
          },
        }

      case MIDI.NOTE_ON:
        return {
          ...result,
          name: "NOTE_ON",
          data: {
            note: first,
            velocity: reader.readIntAt(1) / 0x7f,
            channel,
          },
        }

      case MIDI.NOTE_AFTERTOUCH:
        return {
          ...result,
          name: "NOTE_AFTERTOUCH",
          data: {
            note: first,
            aftertouch: reader.readIntAt(1),
            channel,
          },
        }

      case MIDI.CONTROLLER:
        return {
          ...result,
          name: "CONTROLLER",
          data: {
            number: first,
            value: reader.readIntAt(1),
            channel,
          },
        }

      case MIDI.PROGRAM_CHANGE:
        return {
          ...result,
          name: "PROGRAM_CHANGE",
          data: {
            program: first,
            channel,
          },
        }

      case MIDI.CHANNEL_AFTERTOUCH:
        return {
          ...result,
          name: "CHANNEL_AFTERTOUCH",
          data: {
            aftertouch: first,
            channel,
          },
        }

      case MIDI.PITCH_BEND:
        return {
          ...result,
          name: "PITCH_BEND",
          data: {
            lsb: first,
            msb: reader.readIntAt(1),
            channel,
          },
        }
    }
  }

  // unknown event
  return result
}

/**
 * 转换绝对时间
 */
export class Times {
  tpqn = 0
  tempo = 500000
  get bpm() {
    return 60000000 / this.tempo
  }
  get tick() {
    return this.tempo / this.tpqn
  }
  constructor(tpqn = 0) {
    this.tpqn = tpqn
  }
}

export function parser(buffer: Uint8Array) {
  const result: Partial<MIDIFile> = {}
  const chunks: MIDIChunk[] = []

  // split midi chunks
  {
    const reader = createReader(buffer)
    const flag = ["MThd", "MTrk"]

    while (!reader.ended) {
      const id = reader.readTextAt(4)
      const size = reader.readIntAt(4)
      const data = reader.read(size)
      const chunk = { id, size, data }
      if (flag.includes(id)) {
        chunks.push(chunk)
      } else {
        console.error("discover damaged tracks.", chunk)
      }
    }
  }

  const [header, ...tracks] = chunks

  // read midi header
  {
    const reader = createReader(header.data)
    result.header = {
      format: reader.readIntAt(2),
      ntrks: reader.readIntAt(2),
      division: reader.readIntAt(2),
    }
  }

  // read midi tracks
  {
    const { header } = result
    let times = new Times(header.division)

    function readTrackEvents(track: MIDIChunk) {
      if (header.format === 2) {
        times = new Times(header.division)
      }

      const reader = createReader(track.data)
      const events: MIDIEvent[] = []
      while (!reader.ended) {
        const event = readEvent(reader, events[events.length - 1])
        if (event.name === "SET_TEMPO") {
          times.tempo = event.data.quarterNote
        }
        event.startTime = event.startTicks * times.tick
        events.push(event)
      }

      return events
    }

    result.tracks = tracks.map(readTrackEvents)
  }

  return result as MIDIFile
}
