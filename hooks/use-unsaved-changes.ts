"use client"

import { useEffect, useCallback } from "react"

export function useUnsavedChanges(hasUnsavedChanges: boolean) {
  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault()
        event.returnValue = ""
        return ""
      }
    },
    [hasUnsavedChanges],
  )

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [handleBeforeUnload])
}
