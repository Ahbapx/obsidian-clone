import { BookOpen } from "lucide-react"

export function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground p-1 rounded">
        <BookOpen className="h-5 w-5" />
      </div>
      <span className="font-bold text-lg">NoteVault</span>
    </div>
  )
}
