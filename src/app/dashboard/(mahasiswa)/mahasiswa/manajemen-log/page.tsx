"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import MahasiswaSidebar from "@/components/dashboard/mahasiswa/sidebar";
import LogCard from "@/components/dashboard/mahasiswa/LogCard";
import { fetcher } from "@/components/lib/fetcher";

interface Kandidat {
    id: string;
    // Add other kandidat properties as needed
}

interface PendaftaranUser {
    pendaftaranId: string;
    kandidat: Kandidat;
    // Add other pendaftaran properties as needed
}

interface Lowongan {
    lowonganId: string;
    // Add other lowongan properties as needed
}

interface LowonganWithPendaftaran {
    lowongan: Lowongan;
    pendaftaranUser: PendaftaranUser[];
}

interface Log {
    id: string;
    pendaftaran?: {
        pendaftaranId: string;
    };
    // Add other log properties as needed
}

export default function Mahasiswa() {
    const [lowongans, setLowongans] = useState<LowonganWithPendaftaran[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [loadingLowongan, setLoadingLowongan] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [errorLowongan, setErrorLowongan] = useState<string | null>(null);
    const [errorLogs, setErrorLogs] = useState<string | null>(null);
    const [openLogId, setOpenLogId] = useState<string | null>(null);
    const [kandidatId, setKandidatId] = useState<string | null>(null);
    const router = useRouter();

    const handleLogCreated = (newLog: Log) => {
        setLogs((prevLogs) => [...prevLogs, newLog]);
    };

    const handleLogDeleted = (deletedId: string) => {
        setLogs((prevLogs) => prevLogs.filter((log) => log.id !== deletedId));
    };

    const handleLogEdited = (updatedLog: Log) => {
        setLogs((prevLogs) =>
            prevLogs.map((log) => (log.id === updatedLog.id ? updatedLog : log))
        );
    };

    // Fetch lowongan using fetcher
    async function fetchLowongan() {
        setLoadingLowongan(true);
        try {
            console.log("Fetching lowongan data...");
            const data = await fetcher<LowonganWithPendaftaran[]>("/api/logs/listLowongan");
            console.log("Lowongan data fetched:", data);

            setLowongans(data);
            setErrorLowongan(null);

            // Extract kandidatId from the first available pendaftaranUser
            if (data.length > 0 && data[0].pendaftaranUser.length > 0) {
                const extractedKandidatId = data[0].pendaftaranUser[0].kandidat.id;
                setKandidatId(extractedKandidatId);
            }
        } catch (err: any) {
            console.error("Lowongan API Error:", err);

            if (err.status === 401) {
                toast.error("Session expired. Please login again.");
                router.push('/login');
                return;
            } else if (err.status === 403) {
                toast.error("You don't have permission to access this data.");
                router.push('/login');
                return;
            }

            const errorMsg = err.message || "Failed to fetch lowongan";
            setErrorLowongan(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoadingLowongan(false);
        }
    }

    // Fetch logs using fetcher
    async function fetchLogs(kandidatId: string) {
        setLoadingLogs(true);
        try {
            console.log(`Fetching logs for kandidat: ${kandidatId}`);
            const data = await fetcher<Log[]>(`/api/logs/user/${kandidatId}`);
            console.log("Logs data fetched:", data);

            setLogs(data);
            setErrorLogs(null);
        } catch (err: any) {
            console.error("Logs API Error:", err);

            if (err.status === 401) {
                toast.error("Session expired. Please login again.");
                router.push('/login');
                return;
            } else if (err.status === 403) {
                toast.error("You don't have permission to access this data.");
                router.push('/login');
                return;
            }

            const errorMsg = err.message || "Failed to fetch logs";
            setErrorLogs(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoadingLogs(false);
        }
    }

    // Initial data fetch
    useEffect(() => {
        fetchLowongan();
    }, []);

    // Fetch logs when kandidatId is available
    useEffect(() => {
        if (kandidatId) {
            fetchLogs(kandidatId);
        }
    }, [kandidatId]);

    // Group logs by pendaftaranId for quick access
    const groupLogsByPendaftaranId = (logs: Log[]) => {
        return logs.reduce((acc: Record<string, Log[]>, log) => {
            const id = log.pendaftaran?.pendaftaranId || "UNKNOWN";
            if (!acc[id]) acc[id] = [];
            acc[id].push(log);
            return acc;
        }, {});
    };

    const groupedLogs = groupLogsByPendaftaranId(logs);

    // Toggle open log for a specific lowongan
    const toggleLogForLowongan = (lowonganId: string) => {
        setOpenLogId(openLogId === lowonganId ? null : lowonganId);
    };

    // Loading spinner component
    const LoadingSpinner = () => (
        <div style={loadingContainerStyle}>
            <div style={spinnerStyle}></div>
            <p style={loadingTextStyle}>Memuat data...</p>
        </div>
    );

    // Error message component
    const ErrorMessage = ({ message }: { message: string }) => (
        <div style={errorContainerStyle}>
            <div style={errorIconStyle}>⚠️</div>
            <p style={errorTextStyle}>Error: {message}</p>
            <button
                onClick={() => {
                    if (errorLowongan) fetchLowongan();
                    if (errorLogs && kandidatId) fetchLogs(kandidatId);
                }}
                style={retryButtonStyle}
            >
                Retry
            </button>
        </div>
    );

    // Empty state component
    const EmptyState = () => (
        <div style={emptyStateStyle}>
            <div style={emptyIconStyle}>📋</div>
            <h3 style={emptyTitleStyle}>Tidak Ada Lowongan</h3>
            <p style={emptyDescriptionStyle}>Belum ada lowongan yang menerima anda saat ini.</p>
        </div>
    );

    // Add CSS styles to head only once
    useEffect(() => {
        const existingStyle = document.getElementById('mahasiswa-styles');
        if (!existingStyle) {
            const styleSheet = document.createElement("style");
            styleSheet.id = 'mahasiswa-styles';
            styleSheet.type = "text/css";
            styleSheet.innerText = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .card-wrapper:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                }
            `;
            document.head.appendChild(styleSheet);
        }

        // Cleanup function to remove styles when component unmounts
        return () => {
            const styleToRemove = document.getElementById('mahasiswa-styles');
            if (styleToRemove) {
                styleToRemove.remove();
            }
        };
    }, []);

    // Show skeleton loading while fetching lowongan
    if (loadingLowongan) {
        return (
            <MahasiswaSidebar>
                <div style={containerStyle}>
                    <div style={headerStyle}>
                        <h1 style={titleStyle}>Log Asisten Dosen</h1>
                        <p style={subtitleStyle}>Kelola dan pantau aktivitas sebagai asisten dosen</p>
                    </div>
                    <Skeleton className="h-96 w-full" />
                </div>
            </MahasiswaSidebar>
        );
    }

    return (
        <MahasiswaSidebar>
            <div style={containerStyle}>
                <div style={headerStyle}>
                    <h1 style={titleStyle}>Log Asisten Dosen</h1>
                    <p style={subtitleStyle}>Kelola dan pantau aktivitas sebagai asisten dosen</p>
                </div>

                <div style={contentStyle}>
                    {errorLowongan && <ErrorMessage message={errorLowongan} />}
                    {errorLogs && <ErrorMessage message={errorLogs} />}

                    {!errorLowongan && lowongans.length === 0 && <EmptyState />}

                    {loadingLogs && kandidatId && <LoadingSpinner />}

                    {!errorLowongan && lowongans.length > 0 && (
                        <div style={cardsContainerStyle}>
                            {lowongans.map(({ lowongan, pendaftaranUser }) => (
                                <div key={lowongan.lowonganId} style={cardWrapperStyle}>
                                    <LogCard
                                        lowongan={lowongan}
                                        pendaftaranUser={pendaftaranUser}
                                        pendaftaranId={pendaftaranUser[0].pendaftaranId}
                                        userId={pendaftaranUser[0].kandidat.id}
                                        groupedLogs={groupedLogs}
                                        toggleLog={toggleLogForLowongan}
                                        openLogId={openLogId}
                                        onLogCreated={handleLogCreated}
                                        onLogDeleted={handleLogDeleted}
                                        onLogEdited={handleLogEdited}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MahasiswaSidebar>
    );
}

// Modern styling with consistent design system
const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: "24px",
};

const headerStyle = {
    marginBottom: "32px",
    textAlign: "center" as const,
};

const titleStyle = {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
};

const subtitleStyle = {
    fontSize: "16px",
    color: "#64748b",
    fontWeight: "400",
};

const contentStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
};

const loadingContainerStyle = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
};

const spinnerStyle = {
    width: "40px",
    height: "40px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
};

const loadingTextStyle = {
    color: "#64748b",
    fontSize: "16px",
    fontWeight: "500",
};

const errorContainerStyle = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    margin: "20px 0",
};

const errorIconStyle = {
    fontSize: "24px",
    marginBottom: "12px",
};

const errorTextStyle = {
    color: "#dc2626",
    fontSize: "16px",
    fontWeight: "500",
    margin: "0 0 16px 0",
    textAlign: "center" as const,
};

const retryButtonStyle = {
    padding: "8px 16px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
};

const emptyStateStyle = {
    textAlign: "center" as const,
    padding: "80px 20px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
};

const emptyIconStyle = {
    fontSize: "64px",
    marginBottom: "24px",
};

const emptyTitleStyle = {
    fontSize: "24px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "12px",
};

const emptyDescriptionStyle = {
    fontSize: "16px",
    color: "#6b7280",
    maxWidth: "400px",
    margin: "0 auto",
};

const cardsContainerStyle = {
    display: "flex",
    flexDirection: "column" as const,
};

const cardWrapperStyle = {
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    borderRadius: "16px",
    overflow: "hidden",
    width: "100%",
    maxWidth: "100%",
};