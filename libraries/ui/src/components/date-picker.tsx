"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@openlguid/ui/components/button"
import { Calendar } from "@openlguid/ui/components/calendar"
import { Input } from "@openlguid/ui/components/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@openlguid/ui/components/popover"
import { cn } from "@openlguid/ui/lib/utils"

function formatDisplayDate(date: Date | undefined): string {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function parseDate(value: string): Date | undefined {
  if (!value) {
    return undefined
  }

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (isoMatch) {
    const year = Number(isoMatch[1])
    const month = Number(isoMatch[2])
    const day = Number(isoMatch[3])
    const parsed = new Date(year, month - 1, day)

    if (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day
    ) {
      return parsed
    }
  }

  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed
  }

  return undefined
}

type DatePickerProps = React.InputHTMLAttributes<HTMLInputElement> & {
  value?: string | null
}

export default function DatePicker({
  value,
  onChange,
  className,
  onBlur,
  ...rest
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    parseDate(value ?? "")
  )
  const [month, setMonth] = React.useState<Date | undefined>(selectedDate)
  const [displayValue, setDisplayValue] = React.useState(
    selectedDate ? formatDisplayDate(selectedDate) : (value ?? "")
  )

  React.useEffect(() => {
    const nextDate = parseDate(value ?? "")
    setSelectedDate(nextDate)
    setMonth(nextDate)
    setDisplayValue(nextDate ? formatDisplayDate(nextDate) : (value ?? ""))
  }, [value])

  const emitValue = React.useCallback(
    (nextValue: string) => {
      if (!onChange) {
        return
      }

      onChange({
        target: { value: nextValue },
      } as React.ChangeEvent<HTMLInputElement>)
    },
    [onChange]
  )

  return (
    <div className="relative flex items-center">
      <Input
        value={displayValue}
        placeholder="June 01, 2025"
        className={cn("pr-8", className)}
        onChange={(event) => {
          const nextInput = event.target.value
          setDisplayValue(nextInput)

          const nextDate = parseDate(nextInput)
          if (!nextDate) {
            if (nextInput.trim().length === 0) {
              setSelectedDate(undefined)
              emitValue("")
            }
            return
          }

          setSelectedDate(nextDate)
          setMonth(nextDate)
          emitValue(toISODate(nextDate))
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault()
            setOpen(true)
          }
        }}
        onBlur={onBlur}
        {...rest}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Select date"
              className="absolute end-1 top-1/2 -translate-y-1/2"
            />
          }
        >
          <CalendarIcon />
          <span className="sr-only">Select date</span>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            month={month}
            onMonthChange={setMonth}
            onSelect={(date) => {
              setSelectedDate(date)
              setDisplayValue(formatDisplayDate(date))
              emitValue(date ? toISODate(date) : "")
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
