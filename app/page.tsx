"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link2, Plus, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Home() {
  const [destination, setDestination] = useState("")
  const [alias, setAlias] = useState("")
  const router = useRouter()

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!destination || !alias) return

    // Mock creation
    alert(`Created go/${alias} -> ${destination}`)
    setDestination("")
    setAlias("")
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors overflow-hidden relative">
      {/* Background Gradients/Blobs for "Emotion" */}
      {/* <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" /> */}
      {/* <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-tertiary/10 rounded-full blur-3xl pointer-events-none" /> */}

      {/* Header - Minimal, blending in */}
      <header className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-on-surface">
          <span className="bg-linear-to-r from-primary to-tertiary bg-clip-text text-transparent">Go Links</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-0">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">

          {/* Left Side: Hero Text */}
          <div className="space-y-6 text-center md:text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>M3 Expressive</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-on-surface leading-[1.1]">
              Create <br />
              <span className="text-primary">Short Links</span>
            </h1>
            <p className="text-xl text-on-surface-variant max-w-md mx-auto md:mx-0 leading-relaxed">
              Transform long URLs into memorable go links. Design your internal navigation with emotion.
            </p>
          </div>

          {/* Right Side: The Form */}
          <Card className="border-none shadow-2xl bg-surface-container-high/50 backdrop-blur-xl rounded-[32px] overflow-hidden ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">New Link</CardTitle>
              <CardDescription>Enter details to create a go link</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 pt-4">
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="destination" className="text-on-surface-variant">Destination</Label>
                  <div className="relative group">
                    <Input
                      id="destination"
                      placeholder="https://google.com"
                      className="pl-10 h-14 rounded-2xl bg-surface-container-highest border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alias" className="text-on-surface-variant">Short Alias</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-medium text-primary font-mono">go/</span>
                    <Input
                      id="alias"
                      placeholder="roadmap"
                      className="font-mono text-lg h-14 rounded-2xl bg-surface-container-highest border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                    />
                  </div>
                </div>

                <Button size="lg" className="w-full h-14 text-lg rounded-full bg-primary hover:bg-primary/90 text-on-primary shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]" type="submit">
                  <Plus className="mr-2 w-5 h-5" />
                  Create Link
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  )
}
