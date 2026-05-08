import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, X } from 'lucide-react'
import {
  getActivity,
  listCreditTypeSuggestions,
  publishActivity,
  updateActivity,
} from '@/api/activity'
import { uploadFile } from '@/api/file'
import type { Activity, StageTime } from '@/types'
import { toast } from 'sonner'

interface FixedTimeItem {
  name: string
  time: string
}

const SCOPE_OPTIONS = [
  { key: 'all_school', label: '全校' },
  { key: 'college', label: '学院' },
  { key: 'major', label: '专业' },
  { key: 'grade', label: '年级' },
  { key: 'organization', label: '组织' },
]

function toLocalInput(s?: string) {
  if (!s) return ''
  // 后端 yyyy-MM-dd HH:mm:ss -> yyyy-MM-ddTHH:mm
  return s.substring(0, 16).replace(' ', 'T')
}

function fromLocalInput(s?: string) {
  if (!s) return undefined
  return s.replace('T', ' ') + ':00'
}

function createEmptyFixedTimeItem(): FixedTimeItem {
  return {
    name: '',
    time: '',
  }
}

function createFixedTimeItems(form: Partial<Activity> = {}): FixedTimeItem[] {
  const customItems = (form.stageTimes || [])
    .filter((item) => item.time)
    .map((item) => ({
      name: item.name || '',
      time: toLocalInput(item.time),
    }))

  if (customItems.length > 0) {
    return customItems
  }

  return [
    { name: '报名开始', time: toLocalInput(form.signupStartTime) },
    { name: '报名结束', time: toLocalInput(form.signupEndTime) },
    { name: '活动开始', time: toLocalInput(form.activityStartTime) },
    { name: '活动结束', time: toLocalInput(form.activityEndTime) },
  ].filter((item) => item.time)
}

function inferSystemFixedTimes(items: FixedTimeItem[]) {
  const systemTimes: Partial<Record<'signupStartTime' | 'signupEndTime' | 'activityStartTime' | 'activityEndTime', string>> = {}

  for (const item of items) {
    const name = item.name.replace(/\s+/g, '')
    const time = fromLocalInput(item.time)
    if (!time) continue

    if (!systemTimes.signupStartTime && name.includes('报名开始')) {
      systemTimes.signupStartTime = time
      continue
    }
    if (
      !systemTimes.signupEndTime
      && (name.includes('报名结束') || name.includes('报名截止') || name.includes('截止报名'))
    ) {
      systemTimes.signupEndTime = time
      continue
    }
    if (!systemTimes.activityStartTime && name.includes('活动开始')) {
      systemTimes.activityStartTime = time
      continue
    }
    if (!systemTimes.activityEndTime && name.includes('活动结束')) {
      systemTimes.activityEndTime = time
    }
  }

  return systemTimes
}

export default function ActivityPublishPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [form, setForm] = useState<Partial<Activity>>({
    timeType: 'fixed',
    category: 'limited',
    creditType: '',
    creditAmount: 1,
    scopeType: 'all_school',
    proofImages: [],
    stageTimes: [],
  })
  const [saving, setSaving] = useState(false)
  const [fixedTimeItems, setFixedTimeItems] = useState<FixedTimeItem[]>(createFixedTimeItems())
  const [suggestedCreditTypes, setSuggestedCreditTypes] = useState<string[]>([])

  useEffect(() => {
    if (isEdit && id) {
      getActivity(id).then((r) => {
        const nextForm = {
          ...r.data,
          signupStartTime: toLocalInput(r.data.signupStartTime),
          signupEndTime: toLocalInput(r.data.signupEndTime),
          activityStartTime: toLocalInput(r.data.activityStartTime),
          activityEndTime: toLocalInput(r.data.activityEndTime),
          stageTimes: (r.data.stageTimes || []).map((s) => ({
            ...s,
            start: toLocalInput(s.start),
            end: toLocalInput(s.end),
          })),
        } as Partial<Activity>

        setForm(nextForm)
        setFixedTimeItems(createFixedTimeItems(nextForm))
      })
    }
  }, [id, isEdit])

  useEffect(() => {
    ;(async () => {
      try {
        const r = await listCreditTypeSuggestions()
        setSuggestedCreditTypes(r.data)
      } catch {
        setSuggestedCreditTypes([])
      }
    })()
  }, [])

  const set = (k: keyof Activity, v: any) => setForm((s) => ({ ...s, [k]: v }))

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    for (const f of files) {
      try {
        const r = await uploadFile(f)
        setForm((s) => ({ ...s, proofImages: [...(s.proofImages || []), r.data.url] }))
      } catch {
        /* handled */
      }
    }
    e.target.value = ''
  }

  const removeImage = (url: string) =>
    setForm((s) => ({ ...s, proofImages: (s.proofImages || []).filter((u) => u !== url) }))

  const addStage = () =>
    setForm((s) => ({
      ...s,
      stageTimes: [...(s.stageTimes || []), { name: '', start: '', end: '', desc: '' }],
    }))
  const updateStage = (i: number, k: keyof StageTime, v: any) =>
    setForm((s) => ({
      ...s,
      stageTimes: (s.stageTimes || []).map((st, idx) => (idx === i ? { ...st, [k]: v } : st)),
    }))
  const removeStage = (i: number) =>
    setForm((s) => ({ ...s, stageTimes: (s.stageTimes || []).filter((_, idx) => idx !== i) }))
  const addFixedTimeItem = () =>
    setFixedTimeItems((items) => [...items, createEmptyFixedTimeItem()])
  const updateFixedTimeItem = (index: number, key: keyof FixedTimeItem, value: string) =>
    setFixedTimeItems((items) => items.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
  const removeFixedTimeItem = (index: number) =>
    setFixedTimeItems((items) => items.filter((_, i) => i !== index))

  const handleSave = async () => {
    if (!form.title?.trim()) {
      toast.error('请填写活动名称')
      return
    }
    if (!form.creditType?.trim()) {
      toast.error('请填写学分类型')
      return
    }

    const normalizedFixedTimeItems = fixedTimeItems
      .filter((item) => item.name.trim() || item.time)
      .map((item) => ({
        name: item.name.trim(),
        time: item.time,
      }))

    if (
      form.timeType === 'fixed'
      && normalizedFixedTimeItems.some((item) => !item.name || !item.time)
    ) {
      toast.error('请完整填写时间名称和时间')
      return
    }

    const inferredSystemTimes = inferSystemFixedTimes(normalizedFixedTimeItems)
    const latestFixedTime = normalizedFixedTimeItems
      .map((item) => fromLocalInput(item.time))
      .filter((item): item is string => !!item)
      .sort()
      .at(-1)
    const activityEndTime = inferredSystemTimes.activityEndTime || latestFixedTime

    const payload: any = {
      ...form,
      signupStartTime:
        form.timeType === 'fixed'
          ? inferredSystemTimes.signupStartTime
          : fromLocalInput(form.signupStartTime as any),
      signupEndTime:
        form.timeType === 'fixed'
          ? inferredSystemTimes.signupEndTime
          : fromLocalInput(form.signupEndTime as any),
      activityStartTime:
        form.timeType === 'fixed'
          ? inferredSystemTimes.activityStartTime
          : fromLocalInput(form.activityStartTime as any),
      activityEndTime:
        form.timeType === 'fixed'
          ? activityEndTime
          : fromLocalInput(form.activityEndTime as any),
      stageTimes:
        form.timeType === 'fixed'
          ? normalizedFixedTimeItems
              .map((item) => ({
                name: item.name,
                time: fromLocalInput(item.time),
              }))
          : (form.stageTimes || []).map((s) => ({
              ...s,
              start: fromLocalInput(s.start),
              end: fromLocalInput(s.end),
            })),
      scopeDescription:
        form.scopeType === 'all_school'
          ? ''
          : form.scopeDescription,
    }
    setSaving(true)
    try {
      const r = isEdit
        ? await updateActivity(Number(id), payload)
        : await publishActivity(payload)
      toast.success(isEdit ? '已更新' : '发布成功')
      navigate(`/activities/${r.data.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        {isEdit ? '编辑活动' : '发布活动'}
      </h1>

      <Section title="活动信息">
        <Field label="活动名称 *">
          <input
            className="form-input"
            value={form.title || ''}
            onChange={(e) => set('title', e.target.value)}
          />
        </Field>
        <Field label="活动简介">
          <textarea
            className="form-textarea"
            value={form.summary || ''}
            onChange={(e) => set('summary', e.target.value)}
          />
        </Field>
        <Field label="活动内容">
          <textarea
            className="form-textarea"
            rows={5}
            value={form.content || ''}
            onChange={(e) => set('content', e.target.value)}
          />
        </Field>
        <Field label="组织架构">
          <textarea
            className="form-textarea"
            value={form.organizationStructure || ''}
            onChange={(e) => set('organizationStructure', e.target.value)}
          />
        </Field>
      </Section>

      <Section title="学分">
        <div className="grid grid-cols-2 gap-4">
          <Field label="学分类型">
            <div className="space-y-2">
              <input
                className="form-input"
                list="credit-type-suggestions"
                placeholder="例如 志愿服务学分 / 劳育学分 / 自定义学分"
                value={form.creditType || ''}
                onChange={(e) => set('creditType', e.target.value)}
              />
              <datalist id="credit-type-suggestions">
                {suggestedCreditTypes.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
              {!!suggestedCreditTypes.length && (
                <div className="flex flex-wrap gap-2">
                  {suggestedCreditTypes.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={
                        'px-3 py-1 text-xs rounded-full border transition-colors ' +
                        (form.creditType === item
                          ? 'border-primary text-primary bg-primary-50'
                          : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary')
                      }
                      onClick={() => set('creditType', item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400">
                推荐项来自当前账号同学校已发布活动中的学分类型，仍可自行输入。
              </p>
            </div>
          </Field>
          <Field label="学分数量">
            <input
              type="number"
              step="0.5"
              className="form-input"
              value={form.creditAmount ?? 0}
              onChange={(e) => set('creditAmount', Number(e.target.value))}
            />
          </Field>
        </div>
      </Section>

      <Section title="活动时间">
        <div className="flex gap-2 mb-4">
          {(['fixed', 'staged'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set('timeType', t)}
              className={
                'px-3 py-1.5 rounded-md text-sm border transition-colors ' +
                (form.timeType === t
                  ? 'border-primary text-primary bg-primary-50'
                  : 'border-gray-300 text-gray-700 hover:border-primary')
              }
            >
              {t === 'fixed' ? '固定时间' : '阶段时间'}
            </button>
          ))}
        </div>

        {form.timeType === 'fixed' ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              需要哪个时间节点就自己添加哪个，不预置固定项目。系统会优先用名称里带“活动结束”的节点判断状态；如果没有，就取最晚的一个时间节点。
            </p>
            {!!fixedTimeItems.length && fixedTimeItems.map((item, index) => (
              <div key={index} className="grid grid-cols-[220px_minmax(0,1fr)_auto] gap-3">
                <input
                  className="form-input"
                  placeholder="时间名称"
                  value={item.name}
                  onChange={(e) => updateFixedTimeItem(index, 'name', e.target.value)}
                />
                <input
                  type="datetime-local"
                  className="form-input"
                  value={item.time}
                  onChange={(e) => updateFixedTimeItem(index, 'time', e.target.value)}
                />
                <button type="button" className="btn-ghost" onClick={() => removeFixedTimeItem(index)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {!fixedTimeItems.length && (
              <div className="rounded-md border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-400">
                还没有时间节点，点击下方“添加时间节点”开始填写。
              </div>
            )}
            <button type="button" className="btn-outline" onClick={addFixedTimeItem}>
              <Plus size={16} className="mr-1" />
              添加时间节点
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {(form.stageTimes || []).map((s, i) => (
              <div key={i} className="border border-gray-200 rounded-md p-3 space-y-2">
                <div className="flex gap-2">
                  <input
                    className="form-input"
                    placeholder="阶段名称(如 初赛)"
                    value={s.name}
                    onChange={(e) => updateStage(i, 'name', e.target.value)}
                  />
                  <button type="button" className="btn-ghost" onClick={() => removeStage(i)}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={s.start || ''}
                    onChange={(e) => updateStage(i, 'start', e.target.value)}
                  />
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={s.end || ''}
                    onChange={(e) => updateStage(i, 'end', e.target.value)}
                  />
                </div>
                <input
                  className="form-input"
                  placeholder="阶段说明"
                  value={s.desc || ''}
                  onChange={(e) => updateStage(i, 'desc', e.target.value)}
                />
              </div>
            ))}
            <button type="button" className="btn-outline" onClick={addStage}>
              <Plus size={16} className="mr-1" />
              添加阶段
            </button>
          </div>
        )}
      </Section>

      <Section title="参与范围">
        <div className="flex flex-wrap gap-2 mb-3">
          {SCOPE_OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => set('scopeType', o.key)}
              className={
                'px-3 py-1 text-sm rounded-full border transition-colors ' +
                (form.scopeType === o.key
                  ? 'border-primary text-primary bg-primary-50'
                  : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary')
              }
            >
              {o.label}
            </button>
          ))}
        </div>
        {form.scopeType !== 'all_school' && (
          <Field label="范围说明(如学院名称、组织名称)">
            <input
              className="form-input"
              value={form.scopeDescription || ''}
              onChange={(e) => set('scopeDescription', e.target.value)}
            />
          </Field>
        )}
      </Section>

      <Section title="其他">
        <Field label="奖项设置">
          <textarea
            className="form-textarea"
            value={form.awards || ''}
            onChange={(e) => set('awards', e.target.value)}
          />
        </Field>
        <Field label="活动链接">
          <input
            className="form-input"
            placeholder="https://..."
            value={form.activityUrl || ''}
            onChange={(e) => set('activityUrl', e.target.value)}
          />
        </Field>
        <Field label="活动类别">
          <select
            className="form-input"
            value={form.category || 'limited'}
            onChange={(e) => set('category', e.target.value as any)}
          >
            <option value="regular">常规活动</option>
            <option value="limited">限时活动</option>
          </select>
        </Field>

        <Field label="证明截图">
          <div className="grid grid-cols-3 gap-3 mb-3">
            {(form.proofImages || []).map((url) => (
              <div key={url} className="relative">
                <img src={url} alt="" className="w-full h-24 object-cover rounded-md border border-gray-200" />
                <button
                  type="button"
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                  onClick={() => removeImage(url)}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <label className="h-24 border border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 text-sm cursor-pointer hover:border-primary hover:text-primary">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleUpload}
              />
              + 上传
            </label>
          </div>
        </Field>
      </Section>

      <div className="flex gap-2 pt-6">
        <button className="btn-outline flex-1" onClick={() => navigate(-1)}>
          取消
        </button>
        <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
          {saving ? '提交中...' : isEdit ? '保存' : '发布'}
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-5 border-b border-gray-200">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      {children}
    </section>
  )
}
