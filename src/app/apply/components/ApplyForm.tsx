'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

const ApplySchema = z.object({
  realName: z.string().min(2, "El nombre completo es obligatorio"),
  aka: z.string().min(2, "El AKA es obligatorio"),
  phone: z.string().min(8, "Ingresa un número de contacto válido"),
  email: z.string().email("Debe ser un email válido"),
  socialLink: z.string().url("Debe ser una URL válida (Ej: https://instagram.com/...)"),
  djMixLink: z.string().url("Debe ser una URL válida (Ej: https://soundcloud.com/...)"),
  message: z.string().min(10, "Cuéntanos más sobre ti (mín. 10 caracteres)"),
});

type ApplyFormValues = z.infer<typeof ApplySchema>;

export function ApplyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ApplyFormValues>({
    resolver: zodResolver(ApplySchema),
    defaultValues: {
      realName: '',
      aka: '',
      phone: '',
      email: '',
      socialLink: '',
      djMixLink: '',
      message: '',
    }
  });

  const onSubmit = async (data: ApplyFormValues) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading("Enviando postulación...");
    
    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al enviar');
      }

      toast.success("Postulación enviada exitosamente", { id: loadingToast });
      reset();
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al enviar tu postulación. Intenta más tarde.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-[10px] text-white uppercase tracking-widest font-mono">Nombre Completo</label>
        <input 
          type="text" 
          {...register('realName')}
          disabled={isSubmitting}
          className={cn(
            "w-full bg-[#111] border p-4 text-white text-sm focus:outline-none focus:border-white transition-colors",
            errors.realName ? "border-red-500" : "border-[#333]"
          )}
          placeholder="Tu nombre y apellido legal" 
        />
        {errors.realName && <span className="text-red-500 text-xs font-mono">{errors.realName.message}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] text-white uppercase tracking-widest font-mono">AKA de DJ</label>
        <input 
          type="text" 
          {...register('aka')}
          disabled={isSubmitting}
          className={cn(
            "w-full bg-[#111] border p-4 text-white text-sm focus:outline-none focus:border-white transition-colors",
            errors.aka ? "border-red-500" : "border-[#333]"
          )}
          placeholder="Tu alias artístico" 
        />
        {errors.aka && <span className="text-red-500 text-xs font-mono">{errors.aka.message}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] text-white uppercase tracking-widest font-mono">Número de Contacto (WhatsApp)</label>
        <input 
          type="tel" 
          {...register('phone')}
          disabled={isSubmitting}
          className={cn(
            "w-full bg-[#111] border p-4 text-white text-sm focus:outline-none focus:border-white transition-colors",
            errors.phone ? "border-red-500" : "border-[#333]"
          )}
          placeholder="+56 9 1234 5678" 
        />
        {errors.phone && <span className="text-red-500 text-xs font-mono">{errors.phone.message}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] text-white uppercase tracking-widest font-mono">Mail</label>
        <input 
          type="email" 
          {...register('email')}
          disabled={isSubmitting}
          className={cn(
            "w-full bg-[#111] border p-4 text-white text-sm focus:outline-none focus:border-white transition-colors",
            errors.email ? "border-red-500" : "border-[#333]"
          )}
          placeholder="tucorreo@email.com" 
        />
        {errors.email && <span className="text-red-500 text-xs font-mono">{errors.email.message}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] text-white uppercase tracking-widest font-mono">Instagram</label>
        <input 
          type="url" 
          {...register('socialLink')}
          disabled={isSubmitting}
          className={cn(
            "w-full bg-[#111] border p-4 text-white text-sm focus:outline-none focus:border-white transition-colors",
            errors.socialLink ? "border-red-500" : "border-[#333]"
          )}
          placeholder="https://instagram.com/tu_usuario" 
        />
        {errors.socialLink && <span className="text-red-500 text-xs font-mono">{errors.socialLink.message}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] text-white uppercase tracking-widest font-mono">Set link de Soundcloud / YouTube</label>
        <input 
          type="url" 
          {...register('djMixLink')}
          disabled={isSubmitting}
          className={cn(
            "w-full bg-[#111] border p-4 text-white text-sm focus:outline-none focus:border-white transition-colors",
            errors.djMixLink ? "border-red-500" : "border-[#333]"
          )}
          placeholder="https://soundcloud.com/tu_usuario/mix..." 
        />
        {errors.djMixLink && <span className="text-red-500 text-xs font-mono">{errors.djMixLink.message}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] text-white uppercase tracking-widest font-mono leading-relaxed">
          Cuéntanos sobre tu propuesta.<br/>
          <span className="text-[#888] normal-case tracking-normal text-xs">
            Si eres productor puedes adjuntar un link de soundcloud con tus tracks, y si usas tracks propios en tu set menciona cuáles.
          </span>
        </label>
        <textarea 
          {...register('message')}
          disabled={isSubmitting}
          rows={5}
          className={cn(
            "w-full bg-[#111] border p-4 text-white text-sm focus:outline-none focus:border-white transition-colors",
            errors.message ? "border-red-500" : "border-[#333]"
          )}
          placeholder="Describe tu sonido, de dónde eres, tu experiencia..." 
        />
        {errors.message && <span className="text-red-500 text-xs font-mono">{errors.message.message}</span>}
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className={cn(
          "brutalist-button w-full mt-4",
          isSubmitting && "opacity-50 cursor-not-allowed"
        )}
      >
        {isSubmitting ? 'ENVIANDO...' : 'ENVIAR POSTULACIÓN'}
      </button>
    </form>
  )
}
