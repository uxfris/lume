"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type InfiniteResponse<T> = {
  items: T[]
  nextCursor: string | null
}

type UseInfiniteScrollOptions<T> = {
  initialItems: T[]
  initialCursor: string | null
  fetcher: (cursor: string) => Promise<InfiniteResponse<T>>
}

export function useInfiniteScroll<T>({
  initialItems,
  initialCursor,
  fetcher,
}: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState(initialItems)

  const [cursor, setCursor] = useState(initialCursor)

  const [loading, setLoading] = useState(false)

  const [hasMore, setHasMore] = useState(initialCursor !== null)

  const observerRef = useRef<HTMLDivElement | null>(null)

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return

    try {
      setLoading(true)

      const response = await fetcher(cursor)

      setItems((prev) => [...prev, ...response.items])

      setCursor(response.nextCursor)

      setHasMore(response.nextCursor !== null)
    } finally {
      setLoading(false)
    }
  }, [cursor, loading, fetcher])

  useEffect(() => {
    const el = observerRef.current

    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]

        if (first?.isIntersecting) {
          loadMore()
        }
      },
      {
        rootMargin: "300px",
      }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [loadMore])

  return {
    items,
    loading,
    hasMore,
    observerRef,
    loadMore,
  }
}
