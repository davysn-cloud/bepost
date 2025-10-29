'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

export function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get('/health', { timeout: 5000 })
        if (response.data.status === 'ok') {
          setStatus('online')
        } else {
          setStatus('offline')
          setShowWarning(true)
        }
      } catch (error) {
        setStatus('offline')
        setShowWarning(true)
      }
    }

    checkBackend()
  }, [])

  if (!showWarning || status === 'online') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Backend não configurado
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                O backend ainda não foi deployado. Para o sistema funcionar completamente:
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Faça deploy do backend (Railway/Render)</li>
                <li>Configure a variável <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_API_URL</code> no Vercel</li>
              </ol>
              <a
                href="https://github.com/seu-repo/bepost/blob/main/BACKEND_DEPLOY.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-3 text-sm font-medium text-yellow-800 hover:text-yellow-900"
              >
                Ver guia completo →
              </a>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              className="mt-3 text-sm text-yellow-600 hover:text-yellow-800"
            >
              Dispensar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
