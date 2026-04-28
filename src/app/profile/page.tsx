import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { FadeIn } from "@/components/ui/Animations";
import LogoutButton from "./LogoutButton";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        // Fallback in case the user wasn't upserted correctly
        redirect("/login");
    }

    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen pt-32 pb-24 px-6 text-white">
            <div className="w-full max-w-4xl mx-auto">
                <FadeIn>
                    <div className="border-b-4 border-white pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter leading-none">
                            PERSONAL<br />DETAILS
                        </h1>
                        <p className="font-mono text-gray-500 uppercase tracking-widest text-sm md:text-right">
                            OPERATIVE PROFILE
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Avatar */}
                        <div className="col-span-1 border border-[#333] p-4 bg-[#0a0a0a] flex flex-col items-center justify-center text-center">
                            <div className="w-48 h-48 relative bg-[#111] rounded-full overflow-hidden mb-6 border-4 border-[#222]">
                                {user.image ? (
                                    <Image src={user.image} alt="Profile Picture" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#555] font-mono text-xs">NO AVATAR</div>
                                )}
                            </div>
                            <h2 className="font-mono uppercase tracking-widest text-lg font-bold">{user.name || "OPERATOR"}</h2>
                            <span className="font-mono text-xs text-[#888] tracking-wider mt-2 border border-[#333] px-3 py-1">
                                {session.user.isAdmin ? 'SYS_ADMIN' : 'REGISTERED_USER'}
                            </span>
                        </div>

                        {/* Details */}
                        <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
                            <div className="bg-[#050505] border border-[#222] p-8">
                                <h3 className="font-mono text-[10px] text-[#555] tracking-widest uppercase mb-6 border-b border-[#222] pb-2">User Identification</h3>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block font-mono text-xs text-[#888] uppercase tracking-widest mb-1">Full Name</label>
                                        <p className="text-lg font-mono tracking-wider">{user.name || "N/A"}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block font-mono text-xs text-[#888] uppercase tracking-widest mb-1">Registered Email</label>
                                        <p className="text-lg font-mono tracking-wider">{user.email}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block font-mono text-xs text-[#888] uppercase tracking-widest mb-1">Account Created</label>
                                        <p className="text-sm font-mono tracking-wider">{user.createdAt.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-auto self-end">
                                <LogoutButton />
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </main>
    );
}
