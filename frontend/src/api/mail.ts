import request from '@/lib/request'

export const contactPublisher = (activityId: number, message: string) =>
  request.post('/api/mail/contact-publisher', { activityId, message })

export const contactDeveloper = (subject: string, message: string, pagePath: string) =>
  request.post('/api/mail/contact-developer', { subject, message, pagePath })
