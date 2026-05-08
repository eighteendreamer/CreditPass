import { useEffect } from 'react'
import DisableDevtool from 'disable-devtool'

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown
  }
}

export default function SecurityGuard() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase()
      const blocked =
        key === 'F12' ||
        (event.ctrlKey && event.shiftKey && ['I', 'J', 'C'].includes(key)) ||
        (event.ctrlKey && key === 'U')

      if (blocked) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault()
    }

    const disableDevtoolsHook = () => {
      try {
        Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
          value: { isDisabled: true },
          configurable: false,
          writable: false,
        })
      } catch {
        // ignore
      }
    }

    DisableDevtool({
      disableMenu: true,
      clearLog: true,
      detectors: 'all',
      rewriteHTML: `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f9fafb;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <div style="max-width:520px;border:1px solid #e5e7eb;border-radius:20px;background:#ffffff;box-shadow:0 20px 60px rgba(15,23,42,.08);padding:32px;text-align:center;">
            <div style="width:56px;height:56px;border-radius:999px;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 16px;">!</div>
            <h1 style="margin:0 0 12px;font-size:24px;color:#111827;">检测到开发者工具</h1>
            <p style="margin:0;color:#6b7280;line-height:1.8;">当前页面已停止继续展示内容，请关闭开发者工具后刷新页面重试。</p>
          </div>
        </div>
      `,
    })

    disableDevtoolsHook()
    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('contextmenu', onContextMenu)

    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('contextmenu', onContextMenu)
    }
  }, [])

  return null
}
