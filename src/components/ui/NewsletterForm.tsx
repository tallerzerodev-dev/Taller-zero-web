'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || 'Suscripción exitosa', {
                    style: {
                        background: '#111',
                        color: '#fff',
                        border: '1px solid #333',
                        borderRadius: '0',
                        fontFamily: 'monospace',
                    },
                });
                setEmail('');
            } else {
                toast.error(data.error || 'Error al suscribirse', {
                    style: {
                        background: '#111',
                        color: '#ef4444',
                        border: '1px solid #ef4444',
                        borderRadius: '0',
                        fontFamily: 'monospace',
                    },
                });
            }
        } catch (error) {
            toast.error('Error de red', {
                style: {
                    background: '#111',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    borderRadius: '0',
                    fontFamily: 'monospace',
                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <h4 className="text-gray-500 font-mono uppercase text-sm mb-2">Join the Void</h4>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="TU EMAIL AQUÍ"
                    required
                    disabled={isLoading}
                    className="bg-[#0a0a0a] border border-[#333] px-4 py-3 text-xs font-mono uppercase tracking-widest text-white focus:outline-none focus:border-white transition-colors disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-white text-black border border-white px-4 py-3 text-xs font-mono uppercase tracking-widest hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                >
                    {isLoading ? 'ENVIANDO...' : 'SUSCRIBIRSE'}
                </button>
            </form>
        </div>
    );
}
