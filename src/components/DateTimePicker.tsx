'use client'

import { useState, useEffect } from 'react'

export default function DateTimePicker({ 
  value, 
  onChange, 
  required = false 
}: { 
  value: string
  onChange: (value: string) => void
  required?: boolean
}) {
  const [date, setDate] = useState('')
  const [hour, setHour] = useState('')
  const [minute, setMinute] = useState('')
  const [period, setPeriod] = useState('AM')

  // Initialize from value prop
  useEffect(() => {
    if (value) {
      try {
        // Parse the ISO string directly without timezone conversion
        // Handle both formats: "2025-09-27T19:00:00" and "2025-09-27T19:00:00+00:00"
        const cleanValue = value.split('+')[0].split('Z')[0] // Remove timezone info
        const [datePart, timePart] = cleanValue.split('T')
        if (!datePart || !timePart) {
          setDate('')
          setHour('')
          setMinute('')
          setPeriod('AM')
          return
        }
        
        const [hour24Str, minutePart] = timePart.split(':')
        const hour24 = parseInt(hour24Str)
        
        // Convert 24-hour to 12-hour with AM/PM
        let hour12 = hour24
        let period12 = 'AM'
        
        if (hour24 === 0) {
          hour12 = 12
          period12 = 'AM'
        } else if (hour24 < 12) {
          hour12 = hour24
          period12 = 'AM'
        } else if (hour24 === 12) {
          hour12 = 12
          period12 = 'PM'
        } else {
          hour12 = hour24 - 12
          period12 = 'PM'
        }
        
        
        setDate(datePart || '')
        setHour(hour12.toString())
        setMinute(minutePart || '')
        setPeriod(period12)
      } catch {
        setDate('')
        setHour('')
        setMinute('')
        setPeriod('AM')
      }
    } else {
      setDate('')
      setHour('')
      setMinute('')
      setPeriod('AM')
    }
  }, [value])

  // Convert 12-hour to 24-hour format
  const convertTo24Hour = (hour12: string, period12: string) => {
    let hour24 = parseInt(hour12)
    
    if (period12 === 'AM') {
      if (hour24 === 12) hour24 = 0
    } else { // PM
      if (hour24 !== 12) hour24 += 12
    }
    
    return hour24.toString().padStart(2, '0')
  }

  // Update parent when any field changes
  const updateParent = (newDate: string, newHour: string, newMinute: string, newPeriod: string) => {
    if (newDate && newHour && newMinute && newPeriod) {
      const hour24 = convertTo24Hour(newHour, newPeriod)
      const paddedMinute = newMinute.padStart(2, '0')
      const fullDateTime = `${newDate}T${hour24}:${paddedMinute}`
      onChange(fullDateTime)
    }
  }

  const handleDateChange = (newDate: string) => {
    setDate(newDate)
    if (newDate && hour && minute && period) {
      updateParent(newDate, hour, minute, period)
    } else if (newDate && !hour && !minute) {
      // Set default time
      setHour('12')
      setMinute('00')
      setPeriod('PM')
      updateParent(newDate, '12', '00', 'PM')
    }
  }

  const handleHourChange = (newHour: string) => {
    setHour(newHour)
    if (date && newHour && minute && period) {
      updateParent(date, newHour, minute, period)
    }
  }

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute)
    if (date && hour && newMinute && period) {
      updateParent(date, hour, newMinute, period)
    }
  }

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod)
    if (date && hour && minute && newPeriod) {
      updateParent(date, hour, minute, newPeriod)
    }
  }

  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = ['00', '30']

  return (
    <div className="flex gap-2">
      <input
        type="date"
        className="flex-1 border rounded p-2"
        value={date}
        onChange={(e) => handleDateChange(e.target.value)}
        required={required}
      />
      <select
        className="w-20 border rounded p-2"
        value={hour}
        onChange={(e) => handleHourChange(e.target.value)}
        required={required}
      >
        <option value="">Hour</option>
        {hours.map(h => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <select
        className="w-20 border rounded p-2"
        value={minute}
        onChange={(e) => handleMinuteChange(e.target.value)}
        required={required}
      >
        <option value="">Min</option>
        {minutes.map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <select
        className="w-20 border rounded p-2"
        value={period}
        onChange={(e) => handlePeriodChange(e.target.value)}
        required={required}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  )
}