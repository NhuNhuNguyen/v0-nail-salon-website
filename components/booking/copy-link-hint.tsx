'use client'

import { useState } from 'react'
import { LinkIcon, Check } from 'lucide-react'

export function CopyLinkHint() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="mt-6 flex w-full items-start gap-2 rounded-lg bg-secondary p-4 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary/80"
    >
      {copied ? (
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
      ) : (
        <LinkIcon className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <p>
        {copied ? (
          <strong>Link copied!</strong>
        ) : (
          <>
            <strong>Save this link</strong> — tap to copy to clipboard.
          </>
        )}
      </p>
    </button>
  )
}
