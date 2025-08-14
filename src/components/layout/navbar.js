"use client"

import { Moon, Sun, Shield, Wifi, WifiOff, Menu } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMobile } from "@/hooks/use-mobile"

export function Navbar({ onMenuClick }) {
  const { theme, setTheme } = useTheme()
  const isConnected = true
  const connectionError = null
  const isMobile = useMobile()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex h-16 items-center px-3 sm:px-4 md:px-6">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="mr-2 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>
        )}

        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-lg sm:text-xl font-bold hidden sm:block">Intrusion Detection System</h1>
          <h1 className="text-lg font-bold sm:hidden">IDS</h1>
        </div>

        <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <Badge variant="outline" className="text-green-600 border-green-200 hidden sm:inline-flex">
                  Connected
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <Badge variant="outline" className="text-red-600 border-red-200 hidden sm:inline-flex">
                  {connectionError ? "Error" : "Disconnected"}
                </Badge>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}
