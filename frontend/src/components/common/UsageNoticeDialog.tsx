import * as Dialog from '@radix-ui/react-dialog'
import { BookOpenText, X } from 'lucide-react'

interface UsageNoticeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function UsageNoticeDialog({ open, onOpenChange }: UsageNoticeDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 animate-fade-in" />
        <Dialog.Content className="fixed inset-x-4 top-1/2 z-40 max-h-[85vh] -translate-y-1/2 overflow-auto rounded-xl border border-gray-200 bg-white p-4 shadow-2xl animate-fade-in sm:left-1/2 sm:right-auto sm:w-[92%] sm:max-w-xl sm:-translate-x-1/2 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary">
                <BookOpenText size={20} />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  系统使用说明
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-gray-500">
                  关闭后本次不再显示，刷新页面会重新提醒一次。
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="btn-ghost p-1">
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="space-y-4 text-sm text-gray-700">
            <section className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="font-medium text-gray-900">使用方法</p>
              <ul className="mt-2 space-y-2 text-gray-600">
                <li>先在“用户信息”里完善学校、学院、组织和学分需求。</li>
                <li>学分需求请按“当前学分/满学分”格式填写，例如 `0.5/2`。</li>
                <li>发布活动时，请完整填写学分类型、时间节点和参与范围。</li>
              </ul>
            </section>

            <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="font-medium text-amber-900">使用规范</p>
              <p className="mt-2 leading-6 text-amber-900/90">
                学分类型需要和学校已发布、实际使用的学分类型保持一致。若你随意填写一个不一致的学分类型，
                系统可能无法正确匹配学生需求，进而导致推荐和邮件推送失败。
              </p>
            </section>

            <section className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="font-medium text-gray-900">推送规则</p>
              <ul className="mt-2 space-y-2 text-gray-600">
                <li>系统会优先结合用户学校、学分需求和活动可参加状态进行筛选。</li>
                <li>如果关闭邮件推送，或学分类型不匹配，就不会收到对应活动提醒。</li>
              </ul>
            </section>
          </div>

          <div className="mt-5 flex justify-end">
            <Dialog.Close className="btn-primary min-w-28">
              我知道了
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
