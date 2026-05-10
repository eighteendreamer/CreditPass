import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import type { CreditNeed, User } from '@/types'
import { toast } from 'sonner'
import { uploadFile } from '@/api/file'
import { toPreviewUrl } from '@/lib/media'

interface CreditNeedRow {
  type: string
  progress: string
}

function createEmptyCreditNeedRow(): CreditNeedRow {
  return {
    type: '',
    progress: '',
  }
}

function parseCreditProgress(progress: string) {
  const match = progress.trim().match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/)
  if (!match) return null

  const currentAmount = Number(match[1])
  const targetAmount = Number(match[2])

  if (!Number.isFinite(currentAmount) || !Number.isFinite(targetAmount)) return null
  if (currentAmount < 0 || targetAmount <= 0 || currentAmount >= targetAmount) return null

  return {
    currentAmount,
    targetAmount,
    missingAmount: Number((targetAmount - currentAmount).toFixed(2)),
  }
}

function formatCreditProgress(item: CreditNeed) {
  if (
    Number.isFinite(Number(item.currentAmount))
    && Number.isFinite(Number(item.targetAmount))
  ) {
    return `${item.currentAmount}/${item.targetAmount}`
  }

  const targetAmount = Number(item.missingAmount || 0)
  return `0/${targetAmount}`
}

function toCreditNeedRows(items?: CreditNeed[]): CreditNeedRow[] {
  return (items || []).map((item) => ({
    type: item.type || '',
    progress: formatCreditProgress(item),
  }))
}

export default function UserProfilePage() {
  const { user, updateProfile, fetchMe } = useAuthStore()
  const [form, setForm] = useState<Partial<User>>({})
  const [saving, setSaving] = useState(false)
  const [creditNeedRows, setCreditNeedRows] = useState<CreditNeedRow[]>([])
  const [avatarBroken, setAvatarBroken] = useState(false)

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  useEffect(() => {
    if (user) {
      setForm(user)
      setCreditNeedRows(toCreditNeedRows(user.creditNeeds))
      setAvatarBroken(false)
    }
  }, [user])

  const set = (k: keyof User, v: any) => setForm((s) => ({ ...s, [k]: v }))

  const addCreditNeedRow = () => {
    setCreditNeedRows((rows) => [...rows, createEmptyCreditNeedRow()])
  }

  const updateCreditNeedRow = (index: number, key: keyof CreditNeedRow, value: string) => {
    setCreditNeedRows((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)))
  }

  const removeCreditNeedRow = (index: number) => {
    setCreditNeedRows((rows) => rows.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    const normalizedRows = creditNeedRows
      .filter((row) => row.type.trim() || row.progress.trim())
      .map((row) => ({
        type: row.type.trim(),
        progress: row.progress.trim(),
      }))

    if (normalizedRows.some((row) => !row.type || !parseCreditProgress(row.progress))) {
      toast.error('请完整填写学分类型和“当前学分/满学分”')
      return
    }

    const typeSet = new Set<string>()
    const creditNeeds = normalizedRows.map((row) => {
      const parsedProgress = parseCreditProgress(row.progress)!
      return {
        type: row.type,
        currentAmount: parsedProgress.currentAmount,
        targetAmount: parsedProgress.targetAmount,
        missingAmount: parsedProgress.missingAmount,
      }
    })

    for (const item of creditNeeds) {
      if (typeSet.has(item.type.trim())) {
        toast.error('同一种学分只需要填写一次')
        return
      }
      typeSet.add(item.type.trim())
    }

    setSaving(true)
    try {
      await updateProfile({
        ...form,
        creditNeeds: creditNeeds.map((item) => ({
          type: item.type,
          currentAmount: Number(item.currentAmount),
          targetAmount: Number(item.targetAmount),
          missingAmount: Number((Number(item.targetAmount) - Number(item.currentAmount)).toFixed(2)),
        })),
      })
      toast.success('已保存')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const r = await uploadFile(file)
      set('avatarUrl', r.data.url)
      setAvatarBroken(false)
      toast.success('头像已上传，记得点击保存')
    } catch {
      /* handled */
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-gray-500 sm:px-6">
        加载中...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="mb-1 text-xl font-semibold text-gray-900">用户信息</h1>
      <p className="mb-6 text-sm text-gray-500">
        填写越完整，越能推送到你真正还缺的学分活动
      </p>

      <FormSection title="基础信息">
        <div className="mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100">
            {form.avatarUrl && !avatarBroken ? (
              <img
                src={toPreviewUrl(form.avatarUrl)}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setAvatarBroken(true)}
              />
            ) : (
              <span className="text-xl text-gray-400">
                {(form.nickname || form.email || '?').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <label className="btn-outline w-full cursor-pointer sm:w-auto">
            上传头像
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatar} />
          </label>
        </div>

        <Field label="邮箱">
          <input className="form-input bg-gray-50" value={form.email || ''} disabled />
        </Field>
        <Field label="昵称">
          <input
            className="form-input"
            value={form.nickname || ''}
            onChange={(e) => set('nickname', e.target.value)}
          />
        </Field>
        <Field label="个人简介">
          <textarea
            className="form-textarea"
            value={form.bio || ''}
            onChange={(e) => set('bio', e.target.value)}
          />
        </Field>
      </FormSection>

      <FormSection title="学校信息">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="学校">
            <input
              className="form-input"
              value={form.schoolName || ''}
              onChange={(e) => set('schoolName', e.target.value)}
            />
          </Field>
          <Field label="校区">
            <input
              className="form-input"
              value={form.campusName || ''}
              onChange={(e) => set('campusName', e.target.value)}
            />
          </Field>
          <Field label="学院">
            <input
              className="form-input"
              value={form.collegeName || ''}
              onChange={(e) => set('collegeName', e.target.value)}
            />
          </Field>
          <Field label="专业">
            <input
              className="form-input"
              value={form.majorName || ''}
              onChange={(e) => set('majorName', e.target.value)}
            />
          </Field>
          <Field label="年级">
            <input
              className="form-input"
              placeholder="例如 2024 级"
              value={form.grade || ''}
              onChange={(e) => set('grade', e.target.value)}
            />
          </Field>
          <Field label="班级">
            <input
              className="form-input"
              value={form.className || ''}
              onChange={(e) => set('className', e.target.value)}
            />
          </Field>
          <Field label="学号（可选）">
            <input
              className="form-input"
              value={form.studentNo || ''}
              onChange={(e) => set('studentNo', e.target.value)}
            />
          </Field>
          <Field label="所属组织">
            <input
              className="form-input"
              placeholder="例如 学生会 / 某社团"
              value={form.organizationName || ''}
              onChange={(e) => set('organizationName', e.target.value)}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="学分需求">
        <p className="mb-3 text-sm text-gray-500">
          由你自己填写还缺哪些学分，并按“当前学分/满学分”格式录入，系统会优先推送对应类型的活动
        </p>

        <div className="space-y-3">
          {!!creditNeedRows.length && creditNeedRows.map((row, index) => (
            <div key={index} className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="md:flex-1">
                <input
                  className="form-input"
                  placeholder="例如 志愿服务学分 / 劳育学分"
                  value={row.type}
                  onChange={(e) => updateCreditNeedRow(index, 'type', e.target.value)}
                />
              </div>

              <div className="md:w-56 md:flex-none">
                <input
                  className="form-input"
                  placeholder="当前学分/满学分，例如 2/4"
                  value={row.progress}
                  onChange={(e) => updateCreditNeedRow(index, 'progress', e.target.value)}
                />
              </div>

              <button
                type="button"
                className="btn-outline w-full md:w-auto md:whitespace-nowrap"
                onClick={() => removeCreditNeedRow(index)}
              >
                <X size={16} className="mr-1" />
                删除
              </button>
            </div>
          ))}

          {!creditNeedRows.length && (
            <div className="rounded-md border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-400">
              还没有学分需求，点击下方“添加”后可新增并编辑。
            </div>
          )}

          <button
            type="button"
            className="btn-outline w-full md:w-auto md:whitespace-nowrap"
            onClick={addCreditNeedRow}
          >
            <Plus size={16} className="mr-1" />
            添加
          </button>
        </div>
      </FormSection>

      <FormSection title="推送设置">
        <ToggleRow
          label="开启邮件推送"
          checked={form.pushEnabled ?? true}
          onChange={(v) => set('pushEnabled', v)}
        />
        <ToggleRow
          label="只推送可参加的活动"
          checked={form.pushOnlyAvailable ?? true}
          onChange={(v) => set('pushOnlyAvailable', v)}
        />
        <ToggleRow
          label="只推送我缺少的学分类型"
          checked={form.pushOnlyNeededCredit ?? true}
          onChange={(v) => set('pushOnlyNeededCredit', v)}
        />
      </FormSection>

      <div className="sticky bottom-0 -mx-4 bg-gradient-to-t from-white via-white/95 to-transparent px-4 pb-3 pt-6 sm:-mx-6 sm:px-6 sm:pb-2">
        <button className="btn-primary w-full" onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      {children}
    </div>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-gray-200 py-5">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">{title}</h3>
      {children}
    </section>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-2 text-sm text-gray-700">
      <span>{label}</span>
      <input
        type="checkbox"
        className="h-4 w-4 shrink-0 accent-primary"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  )
}
