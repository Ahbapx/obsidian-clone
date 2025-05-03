"use client"

import { useEffect } from "react"

interface Hotkey {
  key: string
  callback: () => void
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
}

export function useHotkeys(hotkeys: Hotkey[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const hotkey of hotkeys) {
        const key = hotkey.key.toLowerCase()
        const keyParts = key.split("+")

        const mainKey = keyParts[keyParts.length - 1]
        const ctrlRequired = keyParts.includes("ctrl") || hotkey.ctrlKey
        const altRequired = keyParts.includes("alt") || hotkey.altKey
        const shiftRequired = keyParts.includes("shift") || hotkey.shiftKey

        if (
          e.key.toLowerCase() === mainKey &&
          e.ctrlKey === ctrlRequired &&
          e.altKey === altRequired &&
          e.shiftKey === shiftRequired
        ) {
          e.preventDefault()
          hotkey.callback()
          break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [hotkeys])
}
