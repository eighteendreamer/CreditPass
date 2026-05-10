import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Bug, Loader2, Mail, SendHorizonal, UserRound, X } from 'lucide-react'
import { toast } from 'sonner'
import { contactDeveloper } from '@/api/mail'
import { useAuthStore } from '@/store/authStore'

const DEVELOPER_NAME = '程序员Eighteen'
const DEVELOPER_EMAIL = 'eighteenthstuai@gmail.com'

export default function BugReportEntry() {
  const { token, setLoginDialogOpen } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const pagePath =
    typeof window === 'undefined'
      ? '/'
      : `${window.location.pathname}${window.location.search}${window.location.hash}`

  const handleOpen = () => {
    if (!token) {
      toast.error('请先登录后再提交 Bug')
      setLoginDialogOpen(true)
      return
    }
    setOpen(true)
  }

  const handleSubmit = async () => {
    const trimmedSubject = subject.trim()
    const trimmedMessage = message.trim()

    if (!trimmedSubject) {
      toast.error('请先填写问题标题')
      return
    }
    if (!trimmedMessage) {
      toast.error('请先填写 Bug 说明')
      return
    }

    setSubmitting(true)
    try {
      await contactDeveloper(trimmedSubject, trimmedMessage, pagePath)
      toast.success('Bug 已发送给开发者邮箱')
      setSubject('')
      setMessage('')
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3 py-2 text-sm font-medium text-primary shadow-lg shadow-primary/10 transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary-50 sm:bottom-6 sm:right-6 sm:px-4 sm:py-3"
      >
        <Bug size={18} />
        提 Bug
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 animate-fade-in" />
          <Dialog.Content className="fixed inset-x-4 bottom-4 top-4 z-40 overflow-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl animate-fade-in sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[92%] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary">
                  <Bug size={20} />
                </div>
                <div>
                  <Dialog.Title className="text-xl font-semibold text-gray-900">
                    提交 Bug
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-gray-500">
                    反馈会直接发送到开发者邮箱，建议写清复现步骤、实际结果和预期结果。
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close className="btn-ghost p-1">
                <X size={18} />
              </Dialog.Close>
            </div>

            <div className="mb-5 rounded-xl border border-primary/10 bg-primary-50/60 p-4 text-sm text-gray-700">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-gray-900">
                  <UserRound size={16} className="text-primary" />
                  <span className="font-medium">作者：{DEVELOPER_NAME}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} className="text-primary" />
                  <span>邮箱：{DEVELOPER_EMAIL}</span>
                </div>
              </div>
              <div className="mt-3 rounded-lg bg-white/80 px-3 py-2 text-xs text-gray-500">
                当前页面：{pagePath}
              </div>
            </div>

            <div className="space-y-4">
              <section className="rounded-xl border border-gray-200 bg-gray-50/80 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label className="text-sm font-medium text-gray-800">问题标题</label>
                  <span className="text-xs text-gray-400">{subject.length}/80</span>
                </div>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="form-input h-12 rounded-lg border-white px-4 text-[15px] shadow-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  placeholder="例如：首页活动筛选结果不正确"
                  maxLength={80}
                />
              </section>

              <section className="rounded-xl border border-gray-200 bg-gray-50/80 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label className="text-sm font-medium text-gray-800">Bug 说明</label>
                  <span className="text-xs text-gray-400">{message.length}/2000</span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="form-textarea min-h-40 resize-y rounded-lg border-white px-4 py-3 text-[15px] leading-7 shadow-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  placeholder="请描述你做了什么、出现了什么问题，最好补充复现步骤。"
                  maxLength={2000}
                />
              </section>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Dialog.Close className="btn-outline sm:min-w-24" disabled={submitting}>
                取消
              </Dialog.Close>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary sm:min-w-36 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    发送中
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <SendHorizonal size={16} />
                    发送给开发者
                  </span>
                )}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
