"use client";

import { useEffect, useState } from "react";
import MahasiswaSidebar from "@/components/dashboard/mahasiswa/sidebar";
import LogCard from "@/components/dashboard/mahasiswa/LogCard";

export default function Mahasiswa() {
    const [lowongans, setLowongans] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loadingLowongan, setLoadingLowongan] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [errorLowongan, setErrorLowongan] = useState(null);
    const [errorLogs, setErrorLogs] = useState(null);
    const [openLogId, setOpenLogId] = useState(null);

    const handleLogCreated = (newLog) => {
        setLogs((prevLogs) => [...prevLogs, newLog]);
    };

    const handleLogDeleted = (deletedId) => {
        setLogs((prevLogs) => prevLogs.filter((log) => log.id !== deletedId));
    };

    const handleLogEdited = (updatedLog) => {
        setLogs((prevLogs) =>
            prevLogs.map((log) => (log.id === updatedLog.id ? updatedLog : log))
        );
    };

    const token = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiTUFIQVNJU1dBIiwibmltIjoiMjEwNjc1NDMyMSIsImZ1bGxOYW1lIjoiQnVkaSBTYW50b3NvIiwiaWQiOiI3YTU4NDI2Zi05MGMwLTRmZTMtOWU2YS1jNWRhMjk2YjI0NmUiLCJlbWFpbCI6ImJ1ZGlAc3R1ZGVudC51aS5hYy5pZCIsInN1YiI6ImJ1ZGlAc3R1ZGVudC51aS5hYy5pZCIsImlhdCI6MTc0ODE2OTI1MCwiZXhwIjoxNzQ4MTcyODUwfQ.ovpHHuZahi1inguYEzrKdNgZD4apEbHs3hzfg19Y7tI";

    useEffect(() => {
        localStorage.setItem("token", token);
    }, [token]);

    // Fetch lowongan
    useEffect(() => {
        const fetchLowongan = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/logs/listLowongan", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!res.ok) throw new Error("Failed to fetch lowongan");

                const data = await res.json();
                setLowongans(data);
            } catch (err) {
                setErrorLowongan(err.message);
            } finally {
                setLoadingLowongan(false);
            }
        };

        fetchLowongan();
    }, [token]);

    // Fetch logs
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/logs", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!res.ok) throw new Error("Failed to fetch logs");

                const data = await res.json();
                setLogs(data);
            } catch (err) {
                setErrorLogs(err.message);
            } finally {
                setLoadingLogs(false);
            }
        };

        fetchLogs();
    }, [token]);

    // Group logs by pendaftaranId for quick access
    const groupLogsByPendaftaranId = (logs) => {
        return logs.reduce((acc, log) => {
            const id = log.pendaftaran?.pendaftaranId || "UNKNOWN";
            if (!acc[id]) acc[id] = [];
            acc[id].push(log);
            return acc;
        }, {});
    };

    const groupedLogs = groupLogsByPendaftaranId(logs);

    // Toggle open log for a specific lowongan
    const toggleLogForLowongan = (lowonganId) => {
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
    const ErrorMessage = ({ message }) => (
        <div style={errorContainerStyle}>
            <div style={errorIconStyle}>⚠️</div>
            <p style={errorTextStyle}>Error: {message}</p>
        </div>
    );

    // Empty state component
    const EmptyState = () => (
        <div style={emptyStateStyle}>
            <div style={emptyIconStyle}>📋</div>
            <h3 style={emptyTitleStyle}>Tidak Ada Lowongan</h3>
            <p style={emptyDescriptionStyle}>Belum ada lowongan yang tersedia saat ini.</p>
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

    return (
        <MahasiswaSidebar>
            <div style={containerStyle}>
                <div style={headerStyle}>
                    <h1 style={titleStyle}>Log Asisten Dosen</h1>
                    <p style={subtitleStyle}>Kelola dan pantau aktivitas sebagai asisten dosen</p>
                </div>

                <div style={contentStyle}>
                    {loadingLowongan && <LoadingSpinner />}

                    {errorLowongan && <ErrorMessage message={errorLowongan} />}

                    {!loadingLowongan && lowongans.length === 0 && <EmptyState />}

                    {!loadingLowongan && lowongans.length > 0 && (
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
    textAlign: "center",
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
    flexDirection: "column",
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
    marginRight: "12px",
};

const errorTextStyle = {
    color: "#dc2626",
    fontSize: "16px",
    fontWeight: "500",
    margin: "0",
};

const emptyStateStyle = {
    textAlign: "center",
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
    flexDirection: "column",
};

const cardWrapperStyle = {
    transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    borderRadius: "16px",
    overflow: "hidden",
    width: "100%",
    maxWidth: "100%",
};