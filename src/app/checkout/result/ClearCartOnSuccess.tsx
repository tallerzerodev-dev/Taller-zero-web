"use client";

import { useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';

export default function ClearCartOnSuccess() {
    const clearCart = useCartStore(state => state.clearCart);
    
    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return null;
}
