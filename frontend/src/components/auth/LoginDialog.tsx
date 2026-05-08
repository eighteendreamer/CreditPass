import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { sendEmailCode } from '@/api/auth'
import { toast } from 'sonner'

export default function LoginDialog() {
  const { loginDialogOpen, setLoginDialogOpen, loginWithCode, loading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  useEffect(() => {
    if (!loginDialogOpen) {
      setCode('')
    }
  }, [loginDialogOpen])

  const handleSendCode = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('请输入正确的邮箱')
      return
    }
    setSending(true)
    try {
      await sendEmailCode(email)
      toast.success('验证码已发送,请查收邮箱')
      setCountdown(60)
    } finally {
      setSending(false)
    }
  }

  const handleLogin = async () => {
    if (!email || !code) {
      toast.error('请填写邮箱和验证码')
      return
    }
    try {
      await loginWithCode(email, code)
      toast.success('登录成功')
    } catch {
      /* handled by interceptor */
    }
  }

  return (
    <Dialog.Root open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              邮箱验证码登录
            </Dialog.Title>
            <Dialog.Close className="btn-ghost p-1">
              <X size={18} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-sm text-gray-500 mb-4">
            首次登录会自动创建账号,无需密码
          </Dialog.Description>

          <div className="space-y-3">
            <div>
              <label className="form-label">邮箱</label>
              <input
                type="email"
                className="form-input"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">验证码</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="form-input flex-1"
                  placeholder="请输入 6 位验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                />
                <button
                  className="btn-outline whitespace-nowrap"
                  onClick={handleSendCode}
                  disabled={countdown > 0 || sending}
                >
                  {countdown > 0 ? `${countdown} s` : sending ? '发送中...' : '获取验证码'}
                </button>
              </div>
            </div>

            <button
              className="btn-primary w-full mt-2"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? '登录中...' : '登录 / 注册'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
