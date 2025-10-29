'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }

        const response = await api.get('/auth/me')
        if (response.data.success) {
          setUser(response.data.data)
        }
      } catch (error) {
        localStorage.removeItem('token')
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">BePost</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Olá, <strong>{user?.name}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Bem-vindo ao BePost! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              Você está logado e pronto para começar. O dashboard completo com calendário,
              gerenciamento de posts e muito mais está em desenvolvimento.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Informações da Conta</h3>
              <div className="text-left space-y-2">
                <p className="text-sm text-gray-700">
                  <strong>Nome:</strong> {user?.name}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Email:</strong> {user?.email}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Papel:</strong> {user?.role}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Conta criada em:</strong>{' '}
                  {new Date(user?.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-3xl mb-2">📅</div>
                <h4 className="font-semibold text-gray-900">Calendário</h4>
                <p className="text-sm text-gray-600">Em breve</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-3xl mb-2">📝</div>
                <h4 className="font-semibold text-gray-900">Posts</h4>
                <p className="text-sm text-gray-600">Em breve</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-3xl mb-2">👥</div>
                <h4 className="font-semibold text-gray-900">Equipe</h4>
                <p className="text-sm text-gray-600">Em breve</p>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm text-gray-500">
                API Backend está disponível em: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
