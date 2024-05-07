# @midikit/midi

一个 MIDI file 解析器

## 安装

```sh
npm install @midikit/midi
```

```sh
pnpm install @midikit/midi
```

```sh
yarn install @midikit/midi
```

## 使用方法

ES module 和 Commonjs

```ts
import { parser } from "@midikit/midi"

const file = {} as File
const buffer = await file.arrayBuffer()
const result = parser(new Uint8Array(buffer))
// ...
```

unpkg

```html
<script src="https://unpkg.com/@midikit/midi"></script>
<script>
  console.log(window["midikit-midi"])
  const { parser } = window["midikit-midi"]
  // ...
</script>
```

## 文档

请前往[此处](../../docs/midi/README.md)查看详细文档

## 参考资料

[midi-format.pdf](../../docs/midi/midi-format.pdf)
