import { useEffect, useState } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import AppHeader from '@/components/layout/AppHeader'
import LoginDialog from '@/components/auth/LoginDialog'
import BugReportEntry from '@/components/common/BugReportEntry'
import SecurityGuard from '@/components/common/SecurityGuard'
import UsageNoticeDialog from '@/components/common/UsageNoticeDialog'
import HomePage from '@/pages/HomePage'
import ActivityDetailPage from '@/pages/ActivityDetailPage'
import UserProfilePage from '@/pages/UserProfilePage'
import ActivityPublishPage from '@/pages/ActivityPublishPage'
import MyActivitiesPage from '@/pages/MyActivitiesPage'
import { useAuthStore } from '@/store/authStore'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token, setLoginDialogOpen } = useAuthStore()
  useEffect(() => {
    if (!token) setLoginDialogOpen(true)
  }, [token, setLoginDialogOpen])
  if (!token) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const { token, fetchMe, setLoginDialogOpen } = useAuthStore()
  const [usageNoticeOpen, setUsageNoticeOpen] = useState(() => Boolean(localStorage.getItem('creditpass_token')))

  useEffect(() => {
    if (token) fetchMe()
    const handler = () => setLoginDialogOpen(true)
    window.addEventListener('auth:require-login', handler)
    return () => window.removeEventListener('auth:require-login', handler)
  }, [token, fetchMe, setLoginDialogOpen])

  useEffect(() => {
    if (!token) {
      setUsageNoticeOpen(false)
    }
  }, [token])

  return (
    <div className="min-h-screen flex flex-col">
      <SecurityGuard />
      <AppHeader />
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/activities/:id" element={<ActivityDetailPage />} />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <UserProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/publish"
            element={
              <RequireAuth>
                <ActivityPublishPage />
              </RequireAuth>
            }
          />
          <Route
            path="/publish/:id"
            element={
              <RequireAuth>
                <ActivityPublishPage />
              </RequireAuth>
            }
          />
          <Route
            path="/my-activities"
            element={
              <RequireAuth>
                <MyActivitiesPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BugReportEntry />
      <UsageNoticeDialog open={usageNoticeOpen} onOpenChange={setUsageNoticeOpen} />
      <LoginDialog />
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        CreditPass · 校园学分活动推送平台
      </footer>
    </div>
  )
}
