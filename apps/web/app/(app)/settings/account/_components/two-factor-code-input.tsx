"use client"

import { cn } from "@workspace/ui/lib/utils"
import { Input } from "@workspace/ui/components/input"
import { useRef } from "react"

const CODE_LENGTH = 6

type Props = {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function TwoFactorCodeInput({ value, onChange, className }: Props) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const digits = Array.from(
    { length: CODE_LENGTH },
    (_, index) => value[index] ?? ""
  )

  const updateDigit = (index: number, digit: string) => {
    const sanitized = digit.replace(/\D/g, "").slice(-1)
    const next = digits.map((char, i) => (i === index ? sanitized : char))
    onChange(next.join(""))

    if (sanitized && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH)
    onChange(pasted)
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  return (
    <div className={cn("flex gap-2", className)}>
      {digits.map((digit, index) => (
        <Input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className="h-14 w-full px-0 text-center text-base font-medium"
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  )
}
