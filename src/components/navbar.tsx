"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "@/lib/auth-utils";

export default function NavBar() {
    const [isLowonganOpen, setIsLowonganOpen] = useState(false);
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [isHonorOpen, setIsHonorOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleDropdown = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        setter(prev => !prev);
    };

    return (
        <div className="w-full">
            {/* Header with Logo and Title */}
            <div className="bg-gray-100 p-4 flex items-center">
                <div className="flex items-center">
                    {/* Replace with your actual logo */}
                    <div className="w-16 h-16 bg-yellow-500 flex items-center justify-center rounded-full mr-4">
                        <span className="text-white font-bold">Logo</span>
                    </div>
                    <div className="border-l-2 border-gray-800 pl-4">
                        <h1 className="font-bold">FAKULTAS</h1>
                        <h1 className="font-bold">ILMU</h1>
                        <h1 className="font-bold">KOMPUTER</h1>
                    </div>
                </div>
                <h1 className="text-3xl font-bold ml-8 text-gray-800">Sistem Informasi Asisten</h1>
            </div>

            {/* Navigation Bar */}
            <nav className="bg-blue-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center">
                        {/* Menu Items */}
                        <div className="hidden md:flex">
                            {/* Lowongan Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown(setIsLowonganOpen)}
                                    className="flex items-center px-4 py-3 hover:bg-blue-800"
                                >
                                    Lowongan <span className="ml-1">▼</span>
                                </button>
                                {isLowonganOpen && (
                                    <div className="absolute left-0 mt-1 w-48 bg-white text-black shadow-lg z-10">
                                        <Link href="/manajemenlowongan" className="block px-4 py-2 hover:bg-gray-100">
                                            Daftar Lowongan
                                        </Link>
                                        <Link href="/manajemenlowongan/create" className="block px-4 py-2 hover:bg-gray-100">
                                            Buat Lowongan
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Log Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown(setIsLogOpen)}
                                    className="flex items-center px-4 py-3 hover:bg-blue-800"
                                >
                                    Log <span className="ml-1">▼</span>
                                </button>
                                {isLogOpen && (
                                    <div className="absolute left-0 mt-1 w-48 bg-white text-black shadow-lg z-10">
                                        <Link href="/logs/activity" className="block px-4 py-2 hover:bg-gray-100">
                                            Activity Log
                                        </Link>
                                        <Link href="/logs/system" className="block px-4 py-2 hover:bg-gray-100">
                                            System Log
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Honor dan Pembayaran Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown(setIsHonorOpen)}
                                    className="flex items-center px-4 py-3 hover:bg-blue-800"
                                >
                                    Honor dan Pembayaran <span className="ml-1">▼</span>
                                </button>
                                {isHonorOpen && (
                                    <div className="absolute left-0 mt-1 w-48 bg-white text-black shadow-lg z-10">
                                        <Link href="/honor/status" className="block px-4 py-2 hover:bg-gray-100">
                                            Status Pembayaran
                                        </Link>
                                        <Link href="/honor/history" className="block px-4 py-2 hover:bg-gray-100">
                                            Riwayat Pembayaran
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="px-4 py-3"
                            >
                                ☰
                            </button>
                        </div>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => toggleDropdown(setIsUserMenuOpen)}
                                className="flex items-center px-4 py-3 hover:bg-blue-800"
                            >
                                christian yudistra <span className="ml-1">▼</span>
                            </button>
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-1 w-48 bg-white text-black shadow-lg z-10">
                                    <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                                        Profile
                                    </Link>
                                    <Link href="/settings" className="block px-4 py-2 hover:bg-gray-100">
                                        Settings
                                    </Link>
                                    <button 
                                        onClick={logout}
                                        className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden bg-blue-800 pb-4">
                            <Link href="/manajemenlowongan" className="block px-4 py-2 hover:bg-blue-700">
                                Lowongan
                            </Link>
                            <Link href="/logs" className="block px-4 py-2 hover:bg-blue-700">
                                Log
                            </Link>
                            <Link href="/honor" className="block px-4 py-2 hover:bg-blue-700">
                                Honor dan Pembayaran
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    );
}