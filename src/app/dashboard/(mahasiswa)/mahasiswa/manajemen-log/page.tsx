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


    const token = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiTUFIQVNJU1dBIiwibmltIjoiMjEwNjc1NDMyMSIsImZ1bGxOYW1lIjoiQnVkaSBTYW50b3NvIiwiaWQiOiI3YTU4NDI2Zi05MGMwLTRmZTMtOWU2YS1jNWRhMjk2YjI0NmUiLCJlbWFpbCI6ImJ1ZGlAc3R1ZGVudC51aS5hYy5pZCIsInN1YiI6ImJ1ZGlAc3R1ZGVudC51aS5hYy5pZCIsImlhdCI6MTc0ODE1MDc3NSwiZXhwIjoxNzQ4MTU0Mzc1fQ.Xy5Db4O1uI7DEByXw6m_pqUsAYHQpO2o3f7oOEyjlVc";

    localStorage.setItem("token", token);

    // Fetch lowongan
    useEffect(() => {
        fetch("http://localhost:8080/api/logs/listLowongan", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch lowongan");
                return res.json();
            })
            .then((data) => {
                setLowongans(data);
                setLoadingLowongan(false);
            })
            .catch((err) => {
                setErrorLowongan(err.message);
                setLoadingLowongan(false);
            });
    }, [token]);

    // Fetch logs
    useEffect(() => {
        fetch("http://localhost:8080/api/logs", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch logs");
                return res.json();
            })
            .then((data) => {
                setLogs(data);
                setLoadingLogs(false);
            })
            .catch((err) => {
                setErrorLogs(err.message);
                setLoadingLogs(false);
            });
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

    return (
        <MahasiswaSidebar>
            <h1>Log Asisten Dosen</h1>

            {loadingLowongan && <p>Loading lowongan...</p>}
            {errorLowongan && <p style={{ color: "red" }}>Error: {errorLowongan}</p>}
            {!loadingLowongan && lowongans.length === 0 && <p>Lowongan tidak ditemukan.</p>}

            {!loadingLowongan && lowongans.map(({ lowongan, pendaftaranUser }) => (
                <LogCard
                    key={lowongan.lowonganId}
                    lowongan={lowongan}
                    pendaftaranUser={pendaftaranUser}
                    pendaftaranId={pendaftaranUser[0].pendaftaranId}
                    userId={pendaftaranUser[0].kandidat.id}
                    groupedLogs={groupedLogs}
                    toggleLog={toggleLogForLowongan}
                    openLogId={openLogId}
                    onLogCreated={handleLogCreated}
                />
            ))}
        </MahasiswaSidebar>
    );
}

const thStyle = {
    border: "1px solid #ddd",
    padding: "8px",
    backgroundColor: "#f2f2f2",
    textAlign: "left",
};

const tdStyle = {
    border: "1px solid #ddd",
    padding: "8px",
};

const trStyle = {
    borderBottom: "1px solid #ddd",
};
