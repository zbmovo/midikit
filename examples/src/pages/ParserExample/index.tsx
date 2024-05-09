import { parser } from "@midikit/midi"
import Upload, { UploadProps } from "@/components/Upload"

const ParserExample = () => {
  const onFileLoad: UploadProps["onFileLoad"] = async ([file]) => {
    const buffer = await file.arrayBuffer()
    console.log("解析中")
    const midifile = parser(new Uint8Array(buffer))
    console.log(midifile)
    console.log("解析完成")
  }
  return (
    <div>
      <Upload onFileLoad={onFileLoad}></Upload>
      <p>解析结果请在控制台查看</p>
    </div>
  )
}

export default ParserExample
