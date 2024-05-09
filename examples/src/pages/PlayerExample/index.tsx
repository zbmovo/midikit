import Upload, { UploadProps } from "@/components/Upload"
import { Synth } from "@midikit/synth"
import { player, parser } from "./player"
import { useRef, useState } from "react"
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import scss from "./index.module.scss"

dayjs.extend(duration)

const PlayerExample = () => {
  const [loaded, setLoaded] = useState([0, 0])
  const [logger, setLogger] = useState(["处于空闲状态"])

  const controls = useRef<Awaited<ReturnType<typeof player>>>()
  const onFileLoad: UploadProps["onFileLoad"] = async ([file]) => {
    if (typeof Worker === "undefined") {
      setLogger((state) => state.concat("不支持 Worker"))
      return
    }

    if (typeof AudioWorkletNode === "undefined") {
      setLogger((state) => state.concat("不支持 Worklet"))
      return
    }

    const buffer = await file.arrayBuffer()

    setLogger((state) => state.concat("正在解析中"))
    const midifile = await parser(new Uint8Array(buffer))
    setLogger((state) => state.concat("解析完成"))

    const { tracks } = midifile
    const { endTime, endTicks } = tracks.reduce(
      (prev, curr) => {
        const endTime = curr[curr.length - 1].startTime / 1000000
        const endTicks = curr[curr.length - 1].startTicks

        if (endTime > prev.endTime) {
          prev.endTime = endTime
        }

        if (endTicks > prev.endTicks) {
          prev.endTicks = endTicks
        }
        return prev
      },
      {
        endTime: 0,
        endTicks: 0,
      },
    )

    setLogger((state) => state.concat("播放器初始化中"))
    controls.current = await player({
      endTime,
      onLoad(loaded, count) {
        setLoaded([loaded, count])
      },
      readNotes({ context, master }) {
        const synth = new Synth({
          context,
          connect() {
            // note -> master -> compressor -> worklet -> destination
            return master
          },
          envelope: {
            attack: 0.02,
            decay: 0.1,
            sustain: 0.3,
            release: 0.3,
          },
        })

        const indexs = tracks.map(() => 0)
        let ticks = 0
        while (ticks <= endTicks) {
          for (let index = 0; index < tracks.length; index++) {
            const track = tracks[index]

            while (ticks >= track[indexs[index]]?.startTicks) {
              const event = track[indexs[index]]
              const startTime = event.startTime / 1000000

              if (event.name === "NOTE_ON") {
                event.data.velocity === 0
                  ? synth.release(event.data, startTime)
                  : synth.attack(event.data, startTime)
              }

              if (event.name === "NOTE_OFF") {
                synth.release(event.data, startTime)
              }

              indexs[index]++
            }
          }
          ticks++
        }
      },
      onStateChange(text) {
        setLogger((state) => state.concat(text))
      },
    })
  }

  const timer = useRef<number>()
  const [time, setTime] = useState(0)
  const [readed, setReaded] = useState(0)
  function onPlay() {
    if (typeof controls.current === "undefined") {
      return
    }

    setLogger((state) => state.concat("正在播放"))

    clearInterval(timer.current)
    controls.current.play()
    timer.current = setInterval(() => {
      setTime(controls.current!.getTime())
      setReaded(controls.current!.getReaded())
    }, 50)
  }

  function onPause() {
    if (typeof controls.current === "undefined") {
      return
    }

    setLogger((state) => state.concat("已暂停"))

    controls.current.pause()
    clearInterval(timer.current)
  }

  return (
    <div className={scss.player}>
      <h2>这是个牛逼的 MIDI 播放器哦</h2>
      <p>
        该播放器接受任何 <b>黑乐谱[black midi]</b> 的洗礼！！！
      </p>
      <Upload onFileLoad={onFileLoad} />
      <div className={scss.info}>
        <table>
          <tbody>
            <tr>
              <td>Time</td>
              <td>
                {[
                  dayjs.duration(time, "second").format("HH:mm:ss"),
                  dayjs
                    .duration(loaded[1] / 44110, "second")
                    .format("HH:mm:ss"),
                ].join(" | ")}
              </td>
            </tr>
            <tr>
              <td>Loaded</td>
              <td>{loaded.join(" | ")}</td>
            </tr>
            <tr>
              <td>Readed</td>
              <td>{readed.toFixed(0)}</td>
            </tr>
          </tbody>
        </table>

        <div className={scss.operate}>
          <button onClick={onPlay}>play</button>
          <button onClick={onPause}>pause</button>
        </div>

        {logger.map((item, index) => {
          return (
            <div key={index} className={scss.logger}>
              {item}
            </div>
          )
        })}

        {loaded[0] > 0 && loaded[0] - readed < 44100 * 5 && (
          <div className={scss.note}>缓冲区小于 5 秒，请暂停等待加载</div>
        )}
      </div>
    </div>
  )
}

export default PlayerExample
