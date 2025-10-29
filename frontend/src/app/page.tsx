import Link from 'next/link'
import { ArrowRight, Calendar, Users, CheckCircle, MessageSquare } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">BePost</div>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Começar Grátis
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Gerencie seu conteúdo do Instagram
          <br />
          <span className="text-blue-600">do jeito certo</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Plataforma completa para Social Media Managers criarem, aprovarem e agendarem
          posts do Instagram com sua equipe e clientes.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700"
        >
          Começar Agora
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Tudo que você precisa em um só lugar
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Calendar className="w-8 h-8 text-blue-600" />}
            title="Calendário de Conteúdo"
            description="Visualize todos os posts agendados em um calendário intuitivo"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-blue-600" />}
            title="Colaboração em Equipe"
            description="Trabalhe com designers, copywriters e clientes em um só lugar"
          />
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8 text-blue-600" />}
            title="Comentários Visuais"
            description="Comente diretamente nas imagens com coordenadas precisas"
          />
          <FeatureCard
            icon={<CheckCircle className="w-8 h-8 text-blue-600" />}
            title="Aprovação Externa"
            description="Clientes aprovam posts com um link simples, sem login"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para simplificar seu workflow?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a centenas de Social Media Managers que já usam BePost
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100"
          >
            Criar Conta Grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-4">BePost</div>
          <p className="text-gray-400 mb-4">
            Plataforma de gerenciamento de conteúdo para Instagram
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 BePost. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
