"use client"

import { usePathname, useRouter } from "next/navigation";
import React from "react";

export const SidebarItem = ({ href, title, icon, isOpen }: { href: string; title: string; icon: React.ReactNode, isOpen: boolean }) => {
    const router = useRouter();
    const pathname = usePathname()
    const selected = pathname === href

    return <div className={`flex ${selected ? "text-[#00baf2]" : "text-slate-500"} cursor-pointer p-2 pl-6`} onClick={() => {
        router.push(href);
    }}>
        <div>
            {icon}
        </div>
        <div className={`${isOpen ? 'block' : 'hidden'} ml-2 font-extrabold ${selected ? "text-[#00baf2]" : "text-slate-500"}`}>
            {title}
        </div>
    </div>
}