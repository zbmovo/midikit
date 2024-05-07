import { NavLink, Outlet } from "react-router-dom"

const App = () => {
  return (
    <>
      <header>
        <nav>
          <NavLink to="/">首页</NavLink>
          <NavLink to="parser">MIDI 解析测试</NavLink>
          <NavLink to="player">MIDI 播放测试</NavLink>
          <NavLink to="synth">Synth 播放测试</NavLink>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </>
  )
}

export default App
