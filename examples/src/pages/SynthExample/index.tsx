import { Synth } from "@midikit/synth"
import { noteToId } from "@midikit/tools"
import Piano, { PianoProps } from "@/components/Piano"
import { useRef } from "react"

const SynthExample = () => {
  const synth = useRef<Synth>()

  const onKeyEvent: PianoProps["onKeyEvent"] = (event) => {
    if (typeof synth.current === "undefined") {
      synth.current = new Synth({
        context: new AudioContext(),
        connect(context) {
          const compressor = context.createDynamicsCompressor()
          compressor.connect(context.destination)
          return compressor
        },
        envelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.3,
          release: 1,
        },
      })
    }
    const note = { note: noteToId(event.note), channel: 0, velocity: 0.5 }

    if (event.type === "attack") {
      synth.current.attack(note)
    }
    if (event.type === "release") {
      synth.current.release(note)
    }
  }
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 20 }}>
      <Piano octave={4} onKeyEvent={onKeyEvent}></Piano>
      <Piano octave={5} onKeyEvent={onKeyEvent}></Piano>
      <Piano octave={6} onKeyEvent={onKeyEvent}></Piano>
      <Piano octave={7} onKeyEvent={onKeyEvent}></Piano>
    </div>
  )
}

export default SynthExample
