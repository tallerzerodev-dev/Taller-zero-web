'use client'

import { useState, useEffect } from 'react'
import { Plus, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<any[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    fetchInvitations()
  }, [])

  const fetchInvitations = async () => {
    try {
      const res = await fetch('/api/admin/invitations')
      if (res.ok) {
        const data = await res.json()
        setInvitations(data.invitations || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return

    setIsLoading(true)
    setMessage('GENERANDO INVITACIÓN Y ENVIANDO CORREO...')
    setIsError(false)

    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName: name, guestEmail: email })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('INVITACIÓN ENVIADA CON ÉXITO')
        setName('')
        setEmail('')
        fetchInvitations()
      } else {
        setMessage(data.error || 'ERROR AL ENVIAR INVITACIÓN')
        setIsError(true)
      }
    } catch (e) {
      setMessage('ERROR CRÍTICO AL CONECTAR CON EL SERVIDOR')
      setIsError(true)
    }

    setIsLoading(false)
    setTimeout(() => setMessage(''), 5000)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto pt-20">
      <div className="flex justify-between items-center mb-8 border-b border-[#333] pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tighter text-white">Invitaciones VIP</h1>
          <p className="text-[#888] font-mono text-xs uppercase tracking-widest mt-2">Generador de accesos exclusivos y códigos QR</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="lg:col-span-1">
          <form onSubmit={handleCreate} className="bg-[#050505] border border-[#222] p-6 sticky top-24">
            <h2 className="text-white font-mono text-sm uppercase tracking-widest border-b border-[#333] pb-2 mb-6">Nueva Invitación</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-[#888] uppercase tracking-widest block mb-1">Nombre del Invitado</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-[#333] p-3 text-white text-xs font-mono focus:border-white outline-none transition-colors" 
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>
              
              <div>
                <label className="text-[10px] text-[#888] uppercase tracking-widest block mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-[#333] p-3 text-white text-xs font-mono focus:border-white outline-none transition-colors" 
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full font-bold uppercase tracking-widest py-3 border border-white transition-colors flex items-center justify-center gap-2 mt-4 ${isLoading ? 'bg-[#222] text-[#888] border-[#333] cursor-wait' : 'bg-white text-black hover:bg-transparent hover:text-white'}`}
              >
                {isLoading ? <span className="animate-pulse">PROCESANDO...</span> : <><Plus className="w-4 h-4" /> GENERAR Y ENVIAR</>}
              </button>

              {message && (
                <div className={`mt-4 p-3 border text-xs font-mono uppercase tracking-widest flex items-center gap-2 ${isError ? 'bg-[#3a0000] border-red-500 text-red-500' : 'bg-[#002a0f] border-[#4ade80] text-[#4ade80]'}`}>
                  {isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  {message}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* COLUMNA DERECHA: LISTA */}
        <div className="lg:col-span-2">
          <div className="bg-[#050505] border border-[#222] overflow-hidden">
            <div className="p-4 border-b border-[#222] bg-black">
              <h2 className="text-white font-mono text-sm uppercase tracking-widest">Invitados Registrados ({invitations.length})</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#111] font-mono text-[10px] uppercase tracking-widest text-[#888]">
                    <th className="p-4 border-b border-[#222]">Nombre</th>
                    <th className="p-4 border-b border-[#222]">Correo</th>
                    <th className="p-4 border-b border-[#222]">Estado QR</th>
                    <th className="p-4 border-b border-[#222]">Fecha</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-white">
                  {invitations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-[#555] font-mono uppercase tracking-widest">No hay invitaciones generadas</td>
                    </tr>
                  ) : (
                    invitations.map((inv) => (
                      <tr key={inv.id} className="border-b border-[#222] hover:bg-[#111] transition-colors">
                        <td className="p-4 font-bold uppercase">{inv.guestName}</td>
                        <td className="p-4 text-[#888]">{inv.guestEmail}</td>
                        <td className="p-4">
                          {inv.isScanned ? (
                            <span className="inline-flex items-center gap-1 text-red-500 font-mono text-[10px] tracking-widest bg-[#3a0000] px-2 py-1">
                              <XCircle className="w-3 h-3" /> USADO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#4ade80] font-mono text-[10px] tracking-widest bg-[#002a0f] px-2 py-1">
                              <CheckCircle2 className="w-3 h-3" /> VÁLIDO
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-[#555] font-mono text-[10px]">{new Date(inv.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
