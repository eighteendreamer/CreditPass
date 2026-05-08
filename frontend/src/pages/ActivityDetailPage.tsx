import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Mail } from 'lucide-react'
import { getActivity } from '@/api/activity'
import { contactPublisher } from '@/api/mail'
import type { Activity } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import * as Dialog from '@radix-ui/react-dialog'
import { toast } from 'sonner'

const FIXED_TIME_LABELS: Record<string, string> = {
  signupStartTime: '报名开始',
  signupEndTime: '报名结束',
  activityStartTime: '活动开始',
  activityEndTime: '活动结束',
}

const SCOPE_TYPE_LABELS: Record<string, string> = {
  all_school: '全校',
  college: '学院',
  major: '专业',
  grade: '年级',
  organization: '组织',
}

function getFixedTimeline(data: Activity) {
  const customItems = (data.stageTimes || [])
    .filter((item) => item.time)
    .map((item) => ({
      name: item.name || FIXED_TIME_LABELS[item.key || ''] || '时间节点',
      time: item.time || '',
    }))

  if (customItems.length > 0) {
    return customItems
  }

  return [
    { name: '报名开始', time: data.signupStartTime || '' },
    { name: '报名结束', time: data.signupEndTime || '' },
    { name: '活动开始', time: data.activityStartTime || '' },
    { name: '活动结束', time: data.activityEndTime || '' },
  ].filter((item) => item.time)
}

export default function ActivityDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [data, setData] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [msg, setMsg] = useState('')
  const [sending, setSending] = useState(false)
  const { token, user, setLoginDialogOpen } = useAuthStore()

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const viewKey = `activity-view:${id}:${location.key}`
        const shouldIncView = !sessionStorage.getItem(viewKey)
        if (shouldIncView) {
          sessionStorage.setItem(viewKey, '1')
        }

        const r = await getActivity(id!, shouldIncView)
        setData(r.data)
      } finally {
        setLoading(false)
      }
    })()
  }, [id, location.key])

  const handleContact = async () => {
    if (!token) {
      setLoginDialogOpen(true)
      return
    }
    if (!msg.trim()) {
      toast.error('请填写咨询内容')
      return
    }
    setSending(true)
    try {
      await contactPublisher(data!.id, msg.trim())
      toast.success('已将咨询内容发送给发布人')
      setDrawerOpen(false)
      setMsg('')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center text-gray-500 text-sm">
        加载中...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center text-gray-500 text-sm">
        活动不存在
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <button
        className="btn-ghost -ml-2 mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} className="mr-1" />
        返回
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{data.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="chip">
              {data.creditType} +{data.creditAmount}
            </span>
            <span
              className={
                'text-sm font-medium ' +
                (data.available ? 'text-primary' : 'text-gray-400')
              }
            >
              {data.availableText}
            </span>
            {data.category === 'limited' && <span className="chip-muted">限时活动</span>}
          </div>
        </div>
        <button className="btn-primary" onClick={() => setDrawerOpen(true)}>
          <Mail size={16} className="mr-1" />
          联系发布员
        </button>
      </div>

      <Section title="活动简介">
        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
          {data.summary || '暂无'}
        </p>
      </Section>

      <Section title="活动内容">
        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
          {data.content || '暂无'}
        </p>
      </Section>

      <Section title="组织架构">
        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
          {data.organizationStructure || '暂无'}
        </p>
      </Section>

      <Section title="活动时间">
        {data.timeType === 'fixed' ? (
          <ul className="space-y-2 text-sm text-gray-700">
            {getFixedTimeline(data).map((item, index) => (
              <li key={`${item.name}-${index}`} className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-gray-900">{item.name}</span>
                <span className="text-gray-500">{formatDateTime(item.time)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="text-sm text-gray-700 space-y-2">
            {(data.stageTimes || []).map((s, i) => (
              <li key={i} className="border-l-2 border-primary pl-3">
                <div className="font-medium">{s.name}</div>
                <div className="text-gray-500 text-xs">
                  {formatDateTime(s.start)} ~ {formatDateTime(s.end)}
                </div>
                {s.desc && <div className="text-gray-600 mt-1">{s.desc}</div>}
              </li>
            ))}
            {(!data.stageTimes || data.stageTimes.length === 0) && <span>暂无阶段</span>}
          </ul>
        )}
      </Section>

      <Section title="参与范围">
        <p className="text-sm text-gray-700">
          {SCOPE_TYPE_LABELS[data.scopeType || ''] || data.scopeType || '未指定'}
          {data.scopeDescription ? ` · ${data.scopeDescription}` : ''}
        </p>
      </Section>

      <Section title="奖项设置">
        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
          {data.awards || '暂无'}
        </p>
      </Section>

      {data.activityUrl && (
        <Section title="活动链接">
          <a
            href={data.activityUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary text-sm inline-flex items-center gap-1 hover:underline"
          >
            {data.activityUrl}
            <ExternalLink size={14} />
          </a>
        </Section>
      )}

      {!!(data.proofImages && data.proofImages.length) && (
        <Section title="证明截图">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {data.proofImages.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer">
                <img
                  src={url}
                  alt=""
                  className="w-full h-32 object-cover rounded-md border border-gray-200"
                />
              </a>
            ))}
          </div>
        </Section>
      )}

      <Section title="发布人">
        <p className="text-sm text-gray-700">{data.publisherEmail}</p>
      </Section>

      {/* 联系发布员抽屉 */}
      <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-fade-in" />
          <Dialog.Content className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-xl p-6 animate-fade-in overflow-auto">
            <Dialog.Title className="text-lg font-semibold mb-1">联系发布员</Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mb-4">
              咨询内容会通过邮件发送给活动发布人,发布人可以直接回复你的邮箱
            </Dialog.Description>

            <div className="space-y-3">
              <div>
                <label className="form-label">活动</label>
                <div className="text-sm text-gray-900">{data.title}</div>
              </div>
              <div>
                <label className="form-label">发布人邮箱</label>
                <div className="text-sm text-gray-900">{data.publisherEmail}</div>
              </div>
              <div>
                <label className="form-label">你的邮箱</label>
                <div className="text-sm text-gray-900">{user?.email || '(登录后自动填写)'}</div>
              </div>
              <div>
                <label className="form-label">咨询内容</label>
                <textarea
                  className="form-textarea"
                  rows={5}
                  placeholder="例如:想了解活动的具体报名流程"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button className="btn-outline flex-1" onClick={() => setDrawerOpen(false)}>
                  取消
                </button>
                <button
                  className="btn-primary flex-1"
                  onClick={handleContact}
                  disabled={sending}
                >
                  {sending ? '发送中...' : '发送'}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-5 border-t border-gray-200">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      {children}
    </section>
  )
}
