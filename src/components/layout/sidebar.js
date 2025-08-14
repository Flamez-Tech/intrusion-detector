"use client"
import { Activity, AlertTriangle, BarChart3, Settings, Shield } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

const navigation = [
  { name: "Dashboard", href: "#dashboard", icon: BarChart3, current: true },
  { name: "Live Events", href: "#events", icon: Activity, current: false },
  { name: "Alerts", href: "#alerts", icon: AlertTriangle, current: false },
  { name: "Detection", href: "#detection", icon: Shield, current: false },
  { name: "Settings", href: "#settings", icon: Settings, current: false },
]

function SidebarContent({ className = "", onItemClick }) {
  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* TODO: UNCOMMENT THE BLOCK OF CODE BELOW AND STYLE THE ELEMENT NOT TO APPEAR ON DESKTOP VIEW */}
      {/* <div className="flex h-16 items-center border-b px-4 lg:px-6">
        <Shield className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold">IDS</span>
      </div> */}

      <nav className="flex-1 space-y-1 p-3 lg:p-4">
        {navigation.map((item) => (
          <a
            key={item.name}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground focus:outline-none",
              "active:bg-accent/80",
              item.current ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground",
            )}
          >
            <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
            <span className="truncate">{item.name}</span>
          </a>
        ))}
      </nav>

      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <div>Intrusion Detection System</div>
          <div className="mt-1">v1.0.0</div>
        </div>
      </div>
    </div>
  )
}

export function Sidebar({ open, onClose }) {
  const isMobile = useMobile()

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent onItemClick={onClose} />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <SidebarContent className="border-r bg-muted/10" />
    </div>
  )
}
