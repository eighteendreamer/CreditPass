import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, Send, Trash2 } from 'lucide-react'
import { deleteActivity, myActivities, triggerPush } from '@/api/activity'
import type { Activity } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'

export default function MyActivitiesPage() {
  const navigate = useNavigate()
  const [list, setList] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await myActivities()
      setList(r.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (a: Activity) => {
    if (!confirm(`确定删除活动“${a.title}”吗？此操作不可恢复`)) return
    await deleteActivity(a.id)
    toast.success('已删除')
    load()
  }

  const handlePush = async (a: Activity) => {
    await triggerPush(a.id)
    toast.success('推送已触发')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-gray-900">我的发布</h1>
        <button className="btn-primary w-full sm:w-auto" onClick={() => navigate('/publish')}>
          发布新活动
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading && <div className="py-16 text-center text-sm text-gray-500">加载中...</div>}
        {!loading && list.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-500">
            你还没有发布过活动，点击上方按钮开始创建吧。
          </div>
        )}
        {list.map((a) => (
          <div key={a.id} className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 last:border-b-0 sm:flex-row sm:items-start sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h3
                  className="min-w-0 flex-1 cursor-pointer text-base font-medium text-gray-900 hover:text-primary sm:truncate"
                  onClick={() => navigate(`/activities/${a.id}`)}
                >
                  {a.title}
                </h3>
                <span className="chip">
                  {a.creditType} +{a.creditAmount}
                </span>
                <span
                  className={
                    'text-xs font-medium ' +
                    (a.available ? 'text-primary' : 'text-gray-400')
                  }
                >
                  {a.availableText}
                </span>
              </div>
              <p className="line-clamp-2 text-sm text-gray-500">{a.summary || '暂无简介'}</p>
              <p className="mt-1 text-xs text-gray-400">
                结束：{formatDateTime(a.activityEndTime) || '未指定'} · 浏览 {a.viewCount ?? 0}
              </p>
            </div>
            <div className="grid shrink-0 grid-cols-4 gap-2 sm:flex sm:items-center sm:gap-1">
              <button className="btn-ghost" onClick={() => navigate(`/activities/${a.id}`)}>
                <Eye size={16} />
              </button>
              <button className="btn-ghost" onClick={() => navigate(`/publish/${a.id}`)}>
                <Pencil size={16} />
              </button>
              <button className="btn-ghost" onClick={() => handlePush(a)} title="手动推送">
                <Send size={16} />
              </button>
              <button
                className="btn-ghost text-red-500 hover:bg-red-50"
                onClick={() => handleDelete(a)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
