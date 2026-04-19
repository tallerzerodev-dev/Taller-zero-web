import Link from 'next/link'
import { FadeIn, StaggerContainer } from '@/components/ui/Animations'

export default function AdminDashboardPage() {
  return (
    <main className="flex-1 flex flex-col bg-black min-h-screen px-6 py-24">
      <div className="w-full max-w-7xl mx-auto">
        <FadeIn>
          <div className="border-b border-[#333333] pb-8 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <p className="text-white font-mono text-xs uppercase tracking-widest mb-2 border border-white px-2 py-0.5 inline-block">Conectado</p>
              <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">
                Panel de<br />Control
              </h1>
            </div>
            <div className="font-mono text-sm uppercase tracking-widest text-[#888888]">
              MODO ADMINISTRADOR ACTIVO
            </div>
          </div>
        </FadeIn>

        {/* E-COMMERCE SECTION */}
        <FadeIn>
          <h3 className="font-mono text-white text-sm tracking-widest uppercase mb-6">E-Commerce</h3>
        </FadeIn>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          <Link href="/admin/dashboard/pedidos" className="block">
            <FadeIn className="bg-[#0a0a0a] border border-[#222222] p-8 hover:border-white transition-colors group cursor-pointer flex flex-col h-full">
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-4 group-hover:translate-x-2 transition-transform text-white">Pedidos</h2>
              <p className="text-[#888888] font-mono text-sm leading-relaxed mb-6 flex-1">Gestiona las compras, verifica pagos y actualiza los estados de envío a los clientes.</p>
              <span className="text-white font-mono text-xs uppercase tracking-widest border-b border-white pb-1 w-fit">Administrar →</span>
            </FadeIn>
          </Link>

          <Link href="/admin/dashboard/inventario" className="block">
            <FadeIn className="bg-[#0a0a0a] border border-[#222222] p-8 hover:border-white transition-colors group cursor-pointer flex flex-col h-full">
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-4 group-hover:translate-x-2 transition-transform text-white">Inventario</h2>
              <p className="text-[#888888] font-mono text-sm leading-relaxed mb-6 flex-1">Añade o edita ropa, ajusta precios, descripciones, y oculta productos agotados en tiempo real.</p>
              <span className="text-white font-mono text-xs uppercase tracking-widest border-b border-white pb-1 w-fit">Administrar →</span>
            </FadeIn>
          </Link>

          <Link href="/admin/dashboard/analiticas" className="block">
            <FadeIn className="bg-[#0a0a0a] border border-[#222222] p-8 hover:border-white transition-colors group cursor-pointer flex flex-col h-full">
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-4 group-hover:translate-x-2 transition-transform text-white">Analíticas</h2>
              <p className="text-[#888888] font-mono text-sm leading-relaxed mb-6 flex-1">Revisa el tráfico del sitio, ventas mensuales, y datos generados por tu tienda y sesiónes.</p>
              <span className="text-white font-mono text-xs uppercase tracking-widest border-b border-white pb-1 w-fit">Administrar →</span>
            </FadeIn>
          </Link>
        </StaggerContainer>

        {/* CONTENIDO SECTION */}
        <FadeIn>
          <h3 className="font-mono text-white text-sm tracking-widest uppercase mb-6 flex items-center justify-between">
            Contenidos & Páginas (WYSIWYG)
          </h3>
        </FadeIn>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">

          <Link href="/admin/dashboard/editor?page=sesiónes&action=new" className="block">
            <FadeIn className="bg-white border text-black border-white p-8 hover:bg-[#ccc] hover:border-[#ccc] transition-colors group cursor-pointer flex flex-col h-full shadow-[0_0_25px_rgba(255,255,255,0.2)]">
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-4 group-hover:translate-x-2 transition-transform">
                + Crear sesión
              </h2>
              <p className="text-[#333] font-mono text-sm leading-relaxed mb-6 flex-1">Sube una nueva sesión, ajusta el lineup, trailer, y sube un video desde tu PC.</p>
              <span className="text-black font-mono text-xs uppercase tracking-widest border-b border-black pb-1 w-fit font-bold">Abrir Creador →</span>
            </FadeIn>
          </Link>

          <Link href="/admin/dashboard/editor?page=sesiónes" className="block">
            <FadeIn className="bg-[#0a0a0a] border border-[#222222] p-8 hover:border-white transition-colors group cursor-pointer flex flex-col h-full">
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-4 group-hover:translate-x-2 transition-transform text-white">
                Editar sesiónes
              </h2>
              <p className="text-[#888888] font-mono text-sm leading-relaxed mb-6 flex-1">Modifica metadata de sesiónes ya existentes o su layout.</p>
              <span className="text-white font-mono text-xs uppercase tracking-widest border-b border-white pb-1 w-fit">Abrir Editor →</span>
            </FadeIn>
          </Link>

          <Link href="/admin/dashboard/editor?page=about" className="block">
            <FadeIn className="bg-[#0a0a0a] border border-[#222222] p-8 hover:border-white transition-colors group cursor-pointer flex flex-col h-full">
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-4 group-hover:translate-x-2 transition-transform text-white">Editar About</h2>
              <p className="text-[#888888] font-mono text-sm leading-relaxed mb-6 flex-1">Modifica los manifiestos, la marquesina y textos generales.</p>
              <span className="text-white font-mono text-xs uppercase tracking-widest border-b border-white pb-1 w-fit">Abrir Editor →</span>
            </FadeIn>
          </Link>

          <Link href="/admin/dashboard/editor?page=home" className="block">
            <FadeIn className="bg-[#0a0a0a] border border-[#222222] p-8 hover:border-white transition-colors group cursor-pointer flex flex-col h-full">
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-4 group-hover:translate-x-2 transition-transform text-white">Editar Home</h2>
              <p className="text-[#888888] font-mono text-sm leading-relaxed mb-6 flex-1">Gestiona qué elemento se destaca en la pantalla de inicio y controla los banners.</p>
              <span className="text-white font-mono text-xs uppercase tracking-widest border-b border-white pb-1 w-fit">Abrir Editor →</span>
            </FadeIn>
          </Link>

          <Link href="/admin/dashboard/galeria" className="block">
            <FadeIn className="bg-[#0a0a0a] border border-[#222222] p-8 hover:border-white transition-colors group cursor-pointer flex flex-col h-full">
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-4 group-hover:translate-x-2 transition-transform text-white">Editar Galería</h2>
              <p className="text-[#888888] font-mono text-sm leading-relaxed mb-6 flex-1">Sube fotos, asigna sesiones y organiza el mosaico visual.</p>
              <span className="text-white font-mono text-xs uppercase tracking-widest border-b border-white pb-1 w-fit">Gestor →</span>
            </FadeIn>
          </Link>

          <Link href="/admin/dashboard/editor?page=vip" className="block">
            <FadeIn className="bg-[#1a0000] border border-red-900 p-8 hover:border-red-500 transition-colors group cursor-pointer flex flex-col h-full shadow-[0_0_15px_rgba(220,38,38,0.1)]">
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-4 group-hover:translate-x-2 transition-transform text-red-500">Página VIP</h2>
              <p className="text-[#888888] font-mono text-sm leading-relaxed mb-6 flex-1">Edita el contenido de la página secreta: Fecha, Lineup, Locación y Reglas de la fiesta.</p>
              <span className="text-red-500 font-mono text-xs uppercase tracking-widest border-b border-red-500 pb-1 w-fit">Abrir Editor →</span>
            </FadeIn>
          </Link>

          <Link href="/admin/dashboard/invitations" className="block xl:col-span-2">
            <FadeIn className="bg-[#001a0a] border border-green-900 p-8 hover:border-[#4ade80] transition-colors group cursor-pointer flex flex-col h-full shadow-[0_0_15px_rgba(74,222,128,0.1)]">
              <h2 className="text-2xl font-bold uppercase tracking-widest mb-4 group-hover:translate-x-2 transition-transform text-[#4ade80]">Enviar Invitaciones</h2>
              <p className="text-[#888888] font-mono text-sm leading-relaxed mb-6 flex-1">Genera accesos VIP con códigos QR únicos y envíalos por correo a los asistentes especiales.</p>
              <span className="text-[#4ade80] font-mono text-xs uppercase tracking-widest border-b border-[#4ade80] pb-1 w-fit">Ir al Sistema →</span>
            </FadeIn>
          </Link>

        </StaggerContainer>

      </div>
    </main>
  )
}

