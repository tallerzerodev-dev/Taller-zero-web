'use client';

import { signOut } from "next-auth/react";

export default function LogoutButton() {
    return (
        <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="border border-[#333] hover:border-white text-[#888] hover:text-white px-6 py-3 font-mono text-xs uppercase tracking-widest transition-colors duration-300"
        >
            [ INITIATE LOGOUT ]
        </button>
    );
}
