import { defineEventHandler } from 'nitro/runtime'

export default defineEventHandler(() => {
  return {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'kkn-nawadaya-frontend',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'production',
  }
})
