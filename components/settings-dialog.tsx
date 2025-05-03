"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useSettings } from "@/hooks/use-settings"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, updateSettings } = useSettings()
  const [tempSettings, setTempSettings] = useState(settings)

  const handleSave = () => {
    updateSettings(tempSettings)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="font-size" className="text-right">
              Font Size
            </Label>
            <div className="col-span-3 flex items-center gap-4">
              <Slider
                id="font-size"
                min={12}
                max={24}
                step={1}
                value={[tempSettings.fontSize]}
                onValueChange={(value) => setTempSettings({ ...tempSettings, fontSize: value[0] })}
                className="flex-1"
              />
              <span className="w-12 text-center">{tempSettings.fontSize}px</span>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="font-family" className="text-right">
              Font Family
            </Label>
            <Select
              value={tempSettings.fontFamily}
              onValueChange={(value) => setTempSettings({ ...tempSettings, fontFamily: value })}
            >
              <SelectTrigger id="font-family" className="col-span-3">
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="font-sans">Sans Serif</SelectItem>
                <SelectItem value="font-serif">Serif</SelectItem>
                <SelectItem value="font-mono">Monospace</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
