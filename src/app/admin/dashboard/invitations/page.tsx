'use client'

import { useState, useEffect } from 'react'
import { Plus, CheckCircle2, AlertCircle, XCircle, Trash2 } from 'lucide-react'

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<any[]>([])
  const [guests, setGuests] = useState([{ guestName: '', guestEmail: '' }])
  const [invitationType, setInvitationType] = useState('GUEST')
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

  const handleGuestChange = (index: number, field: string, value: string) => {
    const newGuests = [...guests]
    newGuests[index] = { ...newGuests[index], [field]: value }
    setGuests(newGuests)
  }

  const addGuestRow = () => {
    setGuests([...guests, { guestName: '', guestEmail: '' }])
  }

  const removeGuestRow = (index: number) => {
    if (guests.length > 1) {
      const newGuests = [...guests]
      newGuests.splice(index, 1)
      setGuests(newGuests)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar que al menos uno tenga datos
    const validGuests = guests.filter(g => g.guestName.trim() !== '' && g.guestEmail.trim() !== '')
    if (validGuests.length === 0) {
      setMessage('DEBES RELLENAR AL MENOS UN INVITADO')
      setIsError(true)
      return
    }

    setIsLoading(true)
    setMessage(`GENERANDO ${validGuests.length} INVITACIONES Y ENVIANDO CORREOS...`)
    setIsError(false)

    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guests: validGuests, type: invitationType })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(`¡${data.createdCount} INVITACIONES ENVIADAS CON ÉXITO!`)
        setGuests([{ guestName: '', guestEmail: '' }])
        fetchInvitations()
      } else {
        setMessage(data.error || 'ERROR AL ENVIAR INVITACIONES')
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
    <div className="p-6 max-w-6xl mx-auto pt-20">
      <div className="flex justify-between items-center mb-8 border-b border-[#333] pb-4">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tighter text-white">Invitaciones VIP y Concurso</h1>
          <p className="text-[#888] font-mono text-xs uppercase tracking-widest mt-2">Generador de accesos masivos exclusivos y códigos QR</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO BULK */}
        <div className="lg:col-span-1">
          <form onSubmit={handleCreate} className="bg-[#050505] border border-[#222] p-6 sticky top-24">
            <h2 className="text-white font-mono text-sm uppercase tracking-widest border-b border-[#333] pb-2 mb-6">Nueva(s) Invitación(es)</h2>
            
            <div className="space-y-6">
              
              <div className="p-3 border border-[#333] bg-[#0a0a0a]">
                <label className="text-[10px] text-[#4ade80] uppercase tracking-widest block mb-2 font-bold">Tipo de Invitación</label>
                <select 
                  value={invitationType} 
                  onChange={(e) => setInvitationType(e.target.value)}
                  className="w-full bg-black border border-[#333] p-2 text-white text-xs font-mono uppercase focus:border-white transition-colors cursor-pointer"
                >
                  <option value="GUEST">INVITADO VIP</option>
                  <option value="WINNER">GANADOR DE CONCURSO</option>
                </select>
                <p className="text-[10px] text-[#888] mt-2 font-mono leading-relaxed">
                  {invitationType === 'GUEST' ? 
                    'Recibirán la plantilla de correo de VIP y accederán a la información secreta de VIP.' : 
                    'Recibirán la plantilla de correo de Ganadores y accederán a la página secreta de Ganadores.'}
                </p>
              </div>

              <div className="space-y-4">
                {guests.map((guest, index) => (
                  <div key={index} className="relative p-3 border border-[#222] bg-black">
                    {guests.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeGuestRow(index)}
                        className="absolute top-2 right-2 text-[#555] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <span className="text-[10px] text-[#555] font-mono absolute -top-2 left-2 bg-black px-1">INVITADO #{index + 1}</span>
                    <div className="space-y-3 mt-2">
                      <div>
                        <input 
                          type="text" 
                          value={guest.guestName}
                          onChange={(e) => handleGuestChange(index, 'guestName', e.target.value)}
                          className="w-full bg-transparent border-b border-[#333] p-2 text-white text-xs font-mono focus:border-white outline-none transition-colors" 
                          placeholder="Nombre del Invitado"
                          required={index === 0} // Solo el primero es estrictamente requerido
                        />
                      </div>
                      <div>
                        <input 
                          type="email" 
                          value={guest.guestEmail}
                          onChange={(e) => handleGuestChange(index, 'guestEmail', e.target.value)}
                          className="w-full bg-transparent border-b border-[#333] p-2 text-white text-xs font-mono focus:border-white outline-none transition-colors" 
                          placeholder="Correo Electrónico"
                          required={index === 0}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                type="button" 
                onClick={addGuestRow}
                className="w-full font-mono text-[10px] uppercase tracking-widest py-2 border border-dashed border-[#333] text-[#888] hover:text-white hover:border-white transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3 h-3" /> Añadir otro invitado
              </button>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full font-bold uppercase tracking-widest py-3 border transition-colors flex items-center justify-center gap-2 mt-4 ${isLoading ? 'bg-[#222] text-[#888] border-[#333] cursor-wait' : 'bg-white text-black border-white hover:bg-transparent hover:text-white'}`}
              >
                {isLoading ? <span className="animate-pulse">PROCESANDO...</span> : <>ENVIAR A {guests.filter(g => g.guestName && g.guestEmail).length} PERSONA(S)</>}
              </button>

              {message && (
                <div className={`mt-4 p-3 border text-[10px] font-mono uppercase tracking-widest flex items-start gap-2 ${isError ? 'bg-[#3a0000] border-red-500 text-red-500' : 'bg-[#002a0f] border-[#4ade80] text-[#4ade80]'}`}>
                  {isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  <span>{message}</span>
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
                    <th className="p-4 border-b border-[#222]">Tipo</th>
                    <th className="p-4 border-b border-[#222]">Estado QR</th>
                    <th className="p-4 border-b border-[#222]">Fecha</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-white">
                  {invitations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#555] font-mono uppercase tracking-widest">No hay invitaciones generadas</td>
                    </tr>
                  ) : (
                    invitations.map((inv) => (
                      <tr key={inv.id} className="border-b border-[#222] hover:bg-[#111] transition-colors">
                        <td className="p-4 font-bold uppercase">{inv.guestName}</td>
                        <td className="p-4 text-[#888]">{inv.guestEmail}</td>
                        <td className="p-4">
                           {inv.type === 'WINNER' ? (
                             <span className="text-yellow-500 font-mono text-[10px] tracking-widest bg-[#1a1000] px-2 py-1 border border-yellow-900">GANADOR</span>
                           ) : (
                             <span className="text-white font-mono text-[10px] tracking-widest bg-[#222] px-2 py-1 border border-[#333]">VIP</span>
                           )}
                        </td>
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
