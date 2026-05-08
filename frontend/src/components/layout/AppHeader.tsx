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
          'inline-flex min-w-[88px] items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary-50 text-primary'
            : 'text-gray-700 hover:text-primary',
        )
      }
      end
    >
      {label}
    </NavLink>
  )

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary text-white flex items-center justify-center">
            <GraduationCap size={18} />
          </div>
          <span className="text-base font-semibold text-gray-900">CreditPass</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItem('/', '首页')}
          {navItem('/publish', '发布活动')}
          {navItem('/my-activities', '我的发布')}
          {navItem('/profile', '用户信息')}
        </nav>

        <div className="flex items-center gap-2">
          {token && user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:inline">
                {user.nickname || user.email}
              </span>
              <button
                className="btn-ghost"
                onClick={async () => {
                  await logout()
                  navigate('/')
                }}
              >
                <LogOut size={16} className="mr-1" />
                退出
              </button>
            </div>
          ) : (
            <button className="btn-primary" onClick={() => setLoginDialogOpen(true)}>
              登录 / 注册
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
