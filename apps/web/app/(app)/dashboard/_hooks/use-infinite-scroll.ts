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

  // Server props can change without unmounting (e.g. `router.refresh()` after workspace switch).
  useEffect(() => {
    setItems(initialItems)
    setCursor(initialCursor)
    setHasMore(initialCursor !== null)
    setLoading(false)
  }, [initialItems, initialCursor])

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
