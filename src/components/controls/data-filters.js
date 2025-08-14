"use client"

import { useState } from "react"
import { Filter, Search, Calendar, Globe } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePersistedState } from "@/src/hooks/usePersistedState"

export function DataFilters({ onFiltersChange }) {
  const { filterSettings, updateFilterSettings } = usePersistedState()
  const [localFilters, setLocalFilters] = useState(filterSettings.eventFilters)

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)

    // Update persisted state
    updateFilterSettings({
      eventFilters: newFilters,
    })

    // Notify parent component
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
  }

  const clearFilters = () => {
    const defaultFilters = {
      showErrors: true,
      showSuccess: true,
      ipFilter: "",
      endpointFilter: "",
      timeRange: "1h",
    }
    setLocalFilters(defaultFilters)
    updateFilterSettings({ eventFilters: defaultFilters })
    if (onFiltersChange) {
      onFiltersChange(defaultFilters)
    }
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.ipFilter) count++
    if (localFilters.endpointFilter) count++
    if (localFilters.timeRange !== "1h") count++
    if (!localFilters.showErrors || !localFilters.showSuccess) count++
    return count
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Data Filters</span>
          </div>
          {getActiveFilterCount() > 0 && <Badge variant="secondary">{getActiveFilterCount()} active</Badge>}
        </CardTitle>
        <CardDescription>Filter events and alerts by various criteria</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Range Filter */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Time Range</span>
          </Label>
          <Select value={localFilters.timeRange} onValueChange={(value) => handleFilterChange("timeRange", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5m">Last 5 minutes</SelectItem>
              <SelectItem value="15m">Last 15 minutes</SelectItem>
              <SelectItem value="1h">Last hour</SelectItem>
              <SelectItem value="6h">Last 6 hours</SelectItem>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* IP Address Filter */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>IP Address</span>
          </Label>
          <Input
            placeholder="Filter by IP address..."
            value={localFilters.ipFilter}
            onChange={(e) => handleFilterChange("ipFilter", e.target.value)}
          />
        </div>

        {/* Endpoint Filter */}
        <div className="space-y-2">
          <Label className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Endpoint</span>
          </Label>
          <Input
            placeholder="Filter by endpoint..."
            value={localFilters.endpointFilter}
            onChange={(e) => handleFilterChange("endpointFilter", e.target.value)}
          />
        </div>

        {/* Event Type Filters */}
        <div className="space-y-3">
          <Label>Event Types</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={localFilters.showSuccess ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("showSuccess", !localFilters.showSuccess)}
            >
              Success Events
            </Button>
            <Button
              variant={localFilters.showErrors ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("showErrors", !localFilters.showErrors)}
            >
              Error Events
            </Button>
          </div>
        </div>

        {/* Clear Filters */}
        {getActiveFilterCount() > 0 && (
          <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
            Clear All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
