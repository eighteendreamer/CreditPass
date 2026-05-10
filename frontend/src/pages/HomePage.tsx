import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { listActivities, listCreditTypeSuggestions } from '@/api/activity'
import type { Activity } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const PAGE_SIZE = 15

const CATEGORIES: Array<{ key: string; label: string }> = [
  { key: '', label: '全部' },
  { key: 'regular', label: '常规活动' },
  { key: 'limited', label: '限时活动' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [records, setRecords] = useState<Activity[]>([])
  const [creditTypes, setCreditTypes] = useState<string[]>([])
  const [keyword, setKeyword] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [creditType, setCreditType] = useState('')
  const [category, setCategory] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [searchVersion, setSearchVersion] = useState(0)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const requestIdRef = useRef(0)

  const loadPage = async (nextPage: number, replace = false) => {
    const requestId = ++requestIdRef.current

    if (replace) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const r = await listActivities({
        keyword: appliedKeyword || undefined,
        creditType: creditType || undefined,
        category: category || undefined,
        availableOnly: availableOnly || undefined,
        page: nextPage,
        size: PAGE_SIZE,
      })

      if (requestId !== requestIdRef.current) return

      const nextRecords = r.data.records ?? []
      const total = Number(r.data.total ?? 0)

      setRecords((prev) => {
        if (replace) return nextRecords
        const existingIds = new Set(prev.map((item) => item.id))
        const merged = nextRecords.filter((item) => !existingIds.has(item.id))
        return [...prev, ...merged]
      })
      setPage(nextPage)
      setHasMore(nextRecords.length > 0 && nextPage * PAGE_SIZE < total)
    } finally {
      if (requestId === requestIdRef.current) {
        if (replace) {
          setLoading(false)
        } else {
          setLoadingMore(false)
        }
      }
    }
  }

  const handleSearch = () => {
    setAppliedKeyword(keyword.trim())
    setSearchVersion((value) => value + 1)
  }

  useEffect(() => {
    setRecords([])
    setPage(1)
    setHasMore(true)
    void loadPage(1, true)
  }, [appliedKeyword, creditType, category, availableOnly, searchVersion])

  useEffect(() => {
    const node = loadMoreRef.current
    if (!node || loading || loadingMore || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadPage(page + 1, false)
        }
      },
      { rootMargin: '240px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [page, hasMore, loading, loadingMore, appliedKeyword, creditType, category, availableOnly, searchVersion])

  useEffect(() => {
    ;(async () => {
      try {
        const r = await listCreditTypeSuggestions()
        setCreditTypes(r.data)
      } catch {
        setCreditTypes([])
      }
    })()
  }, [token])

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-5 sm:mb-6">
        <h1 className="mb-1 text-xl font-semibold text-gray-900">最新学分活动</h1>
        <p className="text-sm text-gray-500">按你缺少的学分类型筛选活动，手机上也能顺手浏览和报名</p>
      </div>

      <div className="mb-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="form-input pl-10"
            placeholder="搜索活动名称 / 简介"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCreditType('')}
            className={
              'rounded-full border px-3 py-1 text-sm transition-colors ' +
              (!creditType
                ? 'border-primary bg-primary-50 text-primary'
                : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary')
            }
          >
            全部
          </button>
          {creditTypes.map((item) => {
            const active = creditType === item
            return (
              <button
                key={item}
                onClick={() => setCreditType(item)}
                className={
                  'rounded-full border px-3 py-1 text-sm transition-colors ' +
                  (active
                    ? 'border-primary bg-primary-50 text-primary'
                    : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary')
                }
              >
                {item}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((item) => (
              <button
                key={item.key}
                onClick={() => setCategory(item.key)}
                className={
                  'rounded-full border px-3 py-1 text-sm transition-colors ' +
                  (category === item.key
                    ? 'border-primary bg-primary-50 font-medium text-primary'
                    : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary')
                }
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="accent-primary"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
            />
            只看可参加
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading && (
          <div className="py-16 text-center text-sm text-gray-500">加载中...</div>
        )}

        {!loading && records.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-500">
            暂无活动，试试换个搜索或筛选条件。
          </div>
        )}

        {records.map((activity) => (
          <div
            key={activity.id}
            className="divider-row flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
            onClick={() => navigate(`/activities/${activity.id}`)}
          >
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="min-w-0 flex-1 text-base font-medium text-gray-900 sm:truncate">{activity.title}</h3>
                <span className="chip">
                  {activity.creditType} +{activity.creditAmount}
                </span>
                {activity.category === 'limited' && <span className="chip-muted">限时</span>}
              </div>

              <p className="line-clamp-3 text-sm text-gray-500 sm:line-clamp-2">
                {activity.summary || activity.content || '暂无介绍'}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                截止时间：{formatDateTime(activity.activityEndTime) || '未指定'}
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 sm:block sm:shrink-0 sm:text-right">
              <span
                className={
                  'text-sm font-medium ' + (activity.available ? 'text-primary' : 'text-gray-400')
                }
              >
                {activity.availableText}
              </span>
              <div className="text-xs text-gray-400 sm:mt-1">浏览 {activity.viewCount ?? 0}</div>
            </div>
          </div>
        ))}

        {!loading && records.length > 0 && <div ref={loadMoreRef} className="h-1 w-full" />}

        {loadingMore && (
          <div className="py-5 text-center text-sm text-gray-500">正在加载更多...</div>
        )}

        {!loading && !loadingMore && records.length > 0 && !hasMore && (
          <div className="py-5 text-center text-sm text-gray-400">已经到底了</div>
        )}
      </div>
    </div>
  )
}
