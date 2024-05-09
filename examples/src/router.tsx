import { createHashRouter } from "react-router-dom"
import App from "@/App"
import Home from "@/pages/Home"
import ParserExample from "@/pages/ParserExample"
import PlayerExample from "@/pages/PlayerExample"
import SynthExample from "@/pages/SynthExample"

export const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "parser",
        element: <ParserExample />,
      },
      {
        path: "player",
        element: <PlayerExample />,
      },
      {
        path: "synth",
        element: <SynthExample />,
      },
    ],
  },
])
