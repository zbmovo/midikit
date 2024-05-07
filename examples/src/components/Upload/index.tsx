import { DragEventHandler, FC, MouseEventHandler, useState } from "react"

import scss from "./index.module.scss"

export interface UploadProps {
  text?: string
  onFileLoad(files: FileList): void
}

const Upload: FC<UploadProps> = ({ text = "拖到此处", onFileLoad }) => {
  const [fileList, setFileList] = useState<FileList>()
  const defaultEvent: MouseEventHandler = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const onDrop: DragEventHandler<HTMLInputElement> = (event) => {
    defaultEvent(event)
    const fileList = event.dataTransfer.files
    onFileLoad(fileList)
    setFileList(fileList)
  }

  return (
    <div className={scss.upload} onDragOver={defaultEvent} onDrop={onDrop}>
      {fileList
        ? Object.values(fileList).map((item, index) => {
            return <div key={index}>{item.name}</div>
          })
        : text}
    </div>
  )
}

export default Upload
