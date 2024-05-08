import { FC, MouseEventHandler, useRef, useState } from "react"
import scss from "./index.module.scss"
import classnames from "classnames"

const LIST = ["C", "D", "E", "F", "G", "A", "B"]
const BLACK_List = ["C", "D", "F", "G", "A"]

export interface EventType {
  type: "attack" | "release"
  note: string
}

export interface PianoProps {
  octave: number
  onKeyEvent(event: EventType): void
}

const Piano: FC<PianoProps> = (props) => {
  const { octave, onKeyEvent } = props
  const [activeNote, setActiveNote] = useState<string>("")
  const isMouseDown = useRef<boolean>(false)

  const onMouseEvent: MouseEventHandler<HTMLDivElement> = (event) => {
    const target = event.target as HTMLDivElement
    const note = target.innerText

    switch (event.type) {
      case "mousedown": {
        onKeyEvent({ type: "attack", note })
        setActiveNote(note)
        isMouseDown.current = true
        break
      }

      case "mouseenter": {
        if (isMouseDown.current) {
          onKeyEvent({ type: "attack", note })
          setActiveNote(note)
        }
        break
      }
      case "mouseup": {
        if (isMouseDown.current) {
          onKeyEvent({ type: "release", note })
          setActiveNote("")
          isMouseDown.current = false
        }
        break
      }
      case "mouseleave": {
        if (isMouseDown.current) {
          onKeyEvent({ type: "release", note })
          setActiveNote("")
        }
        break
      }
    }
  }

  return (
    <div className={scss.piano}>
      {LIST.map((item) => {
        const isBlack = BLACK_List.includes(item)

        return [
          <div
            className={classnames({
              [scss.note]: true,
              [scss.active]: activeNote === item + octave,
            })}
            onMouseDown={onMouseEvent}
            onMouseUp={onMouseEvent}
            onMouseEnter={onMouseEvent}
            onMouseLeave={onMouseEvent}
            key={item + octave}
          >
            {item + octave}
          </div>,
          isBlack && (
            <div
              className={classnames({
                [scss.note]: true,
                [scss.black]: true,
                [scss.active]: activeNote === item + "#" + octave,
              })}
              onMouseDown={onMouseEvent}
              onMouseUp={onMouseEvent}
              onMouseEnter={onMouseEvent}
              onMouseLeave={onMouseEvent}
              key={item + "#" + octave}
            >
              {item + "#" + octave}
            </div>
          ),
        ]
      })}
    </div>
  )
}

export default Piano
