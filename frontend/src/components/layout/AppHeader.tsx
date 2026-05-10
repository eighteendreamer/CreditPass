import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LogOut, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AppHeader() {
  const { user, token, setLoginDialogOpen, logout } = useAuthStore()
  const navigate = useNavigate()

  const navItem = (to: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'inline-flex min-w-[88px] shrink-0 items-center justify-center rounded-full px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary-50 text-primary'
            : 'text-gray-700 hover:bg-gray-100 hover:text-primary',
        )
      }
      end
    >
      {label}
    </NavLink>
  )

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 sm:py-0">
        <div className="flex min-h-14 items-center justify-between gap-3">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/20">
              <GraduationCap size={18} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-gray-900">CreditPass</div>
              <div className="hidden text-xs text-gray-400 sm:block">校园学分活动推送平台</div>
            </div>
          </Link>

          {token && user ? (
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <span className="max-w-24 truncate text-sm text-gray-600 sm:max-w-40">
                {user.nickname || user.email}
              </span>
              <button
                className="btn-ghost shrink-0 px-2.5 sm:px-3"
                onClick={async () => {
                  await logout()
                  navigate('/')
                }}
              >
                <LogOut size={16} className="sm:mr-1" />
                <span className="hidden sm:inline">退出</span>
              </button>
            </div>
          ) : (
            <button className="btn-primary shrink-0 px-3 sm:px-4" onClick={() => setLoginDialogOpen(true)}>
              登录
            </button>
          )}
        </div>

        <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 pt-2 sm:mx-0 sm:justify-center sm:overflow-visible sm:px-0 sm:pb-0 sm:pt-0">
          {navItem('/', '首页')}
          {navItem('/publish', '发布活动')}
          {navItem('/my-activities', '我的发布')}
          {navItem('/profile', '用户信息')}
        </nav>
      </div>
    </header>
  )
}
