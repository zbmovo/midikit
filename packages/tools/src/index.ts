/**
 * ```
 *              (id - 69) / 12
 * f = 440 * 2 ^
 *
 * ```
 * MIDI id 转频率
 */
export function idToFreq(id: number) {
  return 440 * Math.pow(2, (id - 69) / 12)
}

/**
 * ```
 *            log(f / 440)
 * id = 12 * -------------- + 69
 *               log(2)
 * ```
 * 频率转 MIDI ID
 */
export function freqToId(f: number) {
  return Number((12 * (Math.log(f / 440) / Math.log(2)) + 69).toFixed(0))
}

export type notes =
  | "C"
  | "Db"
  | "D"
  | "Eb"
  | "E"
  | "F"
  | "Gb"
  | "G"
  | "Ab"
  | "A"
  | "Bb"
  | "B"
  | "C#"
  | "D#"
  | "F#"
  | "G#"
  | "A#"
  | (string & NonNullable<unknown>)

/**
 * 音符转 MIDI ID
 */
export function noteToId(name: string) {
  name = name.toUpperCase()
  const notes = [
    "C",
    "Db",
    "D",
    "Eb",
    "E",
    "F",
    "Gb",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
  ]
  const alias: Record<string, notes> = {
    "C#": "Db",
    "D#": "Eb",
    "F#": "Gb",
    "G#": "Ab",
    "A#": "Bb",
  }
  // eslint-disable-next-line prefer-const
  let [note, octave] = name.split(/(?=\d)/) || []
  if (typeof alias[note] === "string") {
    note = alias[note]
  }
  const index = notes.findIndex((v) => v === note)
  return Number(octave) * 12 + 12 + index
}

/**
 * 音符转频率
 * @param {string} note
 * @returns
 */
export function noteToFreq(note: notes) {
  const id = noteToId(note)
  return idToFreq(id)
}

/**
 * MIDI ID 转 Note
 */
export function idToNote(id: number) {
  const sheet = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ]

  const col = ~~(id / 12) - 1
  const row = id % 12
  return sheet[row] + col
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
