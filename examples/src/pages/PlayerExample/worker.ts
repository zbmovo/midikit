import * as MIDI from "@midikit/midi"

onmessage = (event) => {
  postMessage(MIDI.parser(new Uint8Array(event.data)))
}
