export interface CreditNeed {
  type: string
  currentAmount?: number
  targetAmount?: number
  missingAmount?: number
}

export interface User {
  id: number
  email: string
  nickname?: string
  avatarUrl?: string
  schoolName?: string
  campusName?: string
  collegeName?: string
  majorName?: string
  grade?: string
  className?: string
  studentNo?: string
  organizationName?: string
  creditNeeds?: CreditNeed[]
  creditObtained?: Array<Record<string, any>>
  bio?: string
  pushEnabled?: boolean
  pushOnlyAvailable?: boolean
  pushOnlyNeededCredit?: boolean
  pushFrequency?: string
  profileCompleted?: boolean
}

export interface StageTime {
  key?: string
  name: string
  time?: string
  start?: string
  end?: string
  desc?: string
}

export interface Activity {
  id: number
  title: string
  summary?: string
  organizationStructure?: string
  content?: string
  creditType: string
  creditAmount: number
  timeType: 'fixed' | 'staged'
  signupStartTime?: string
  signupEndTime?: string
  activityStartTime?: string
  activityEndTime?: string
  stageTimes?: StageTime[]
  scopeType?: string
  scopeDescription?: string
  awards?: string
  activityUrl?: string
  proofImages?: string[]
  category: 'regular' | 'limited'
  publisherId: number
  publisherEmail: string
  status: string
  viewCount: number
  createdAt: string
  updatedAt: string
  available: boolean
  availableText: string
}

export interface ActivityListResp {
  records: Activity[]
  total: number
  page: number
  size: number
}
