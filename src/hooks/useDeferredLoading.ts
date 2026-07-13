import { useEffect, useRef, useState } from 'react'

export interface DeferredLoadingOptions {
  /** 超过该时长仍未完成才显示 loading，避免极快请求闪一下 */
  delay?: number
  /** loading 一旦显示，至少保持该时长 */
  minDuration?: number
}

const DEFAULT_DELAY = 200
const DEFAULT_MIN_DURATION = 300

export function useDeferredLoading(
  pending: boolean,
  { delay = DEFAULT_DELAY, minDuration = DEFAULT_MIN_DURATION }: DeferredLoadingOptions = {},
): boolean {
  const [show, setShow] = useState(false)
  const showRef = useRef(false)
  const shownAtRef = useRef(0)

  useEffect(() => {
    showRef.current = show
  }, [show])

  useEffect(() => {
    let delayTimer: ReturnType<typeof setTimeout> | undefined
    let hideTimer: ReturnType<typeof setTimeout> | undefined

    if (pending) {
      if (!showRef.current) {
        delayTimer = setTimeout(() => {
          shownAtRef.current = Date.now()
          showRef.current = true
          setShow(true)
        }, delay)
      }
    } else if (showRef.current) {
      const elapsed = Date.now() - shownAtRef.current
      const wait = Math.max(0, minDuration - elapsed)
      hideTimer = setTimeout(() => {
        showRef.current = false
        setShow(false)
      }, wait)
    } else {
      setShow(false)
    }

    return () => {
      if (delayTimer) clearTimeout(delayTimer)
      if (hideTimer) clearTimeout(hideTimer)
    }
  }, [pending, delay, minDuration])

  return show
}
