import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    fs: {
      strict: false,
      allow: ['/junofs/users/hanx/.openclaw/workspace/openxpki-slides'],
    },
    allowedHosts: ['lhws312.ihep.ac.cn'],
  },
})
