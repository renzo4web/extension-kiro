import { useReducer } from "react"

import "~style.css"

export const CountButton = () => {
  const [count, increase] = useReducer((c) => c + 1, 0)

  const handleOpenSidebar = () => {
    console.log("Opening sidebar")
    document.body.classList.toggle("plasmo-google-sidebar-show", true)
  }

  return (
    <button onClick={handleOpenSidebar} type="button">
      Count: {count}
    </button>
  )
}
