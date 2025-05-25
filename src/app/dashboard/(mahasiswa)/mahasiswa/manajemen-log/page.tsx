"use client";

import { useEffect, useState } from "react";
import MahasiswaSidebar from "@/components/dashboard/mahasiswa/sidebar";

export default function Mahasiswa() {
    const [lowongans, setLowongans] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loadingLowongan, setLoadingLowongan] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [errorLowongan, setErrorLowongan] = useState(null);
    const [errorLogs, setErrorLogs] = useState(null);
    const [openLogId, setOpenLogId] = useState(null); // untuk toggle log per lowongan

    const token = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiTUFIQVNJU1dBIiwibmltIjoiMjEwNjc1NDMyMSIsImZ1bGxOYW1lIjoiQnVkaSBTYW50b3NvIiwiaWQiOiI3YTU4NDI2Zi05MGMwLTRmZTMtOWU2YS1jNWRhMjk2YjI0NmUiLCJlbWFpbCI6ImJ1ZGlAc3R1ZGVudC51aS5hYy5pZCIsInN1YiI6ImJ1ZGlAc3R1ZGVudC51aS5hYy5pZCIsImlhdCI6MTc0ODE0NzAzMywiZXhwIjoxNzQ4MTUwNjMzfQ.BItbdMN6IMLOCblr3gq-9UtvMK40_Y1w-cqsregFTkI";

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

            {!loadingLowongan &&
                lowongans.length > 0 &&
                lowongans.map(({ lowongan, pendaftaranUser }) => (
                    <div
                        key={lowongan.lowonganId}
                        style={{
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            padding: "1rem",
                            marginBottom: "1rem",
                        }}
                    >
                        <h2
                            onClick={() => toggleLogForLowongan(lowongan.lowonganId)}
                            style={{
                                cursor: "pointer",
                                color: "#0070f3",
                                textDecoration: "underline",
                                marginBottom: "0.5rem",
                            }}
                            title="Klik untuk lihat log"
                        >
                            {lowongan.mataKuliah.nama} ({lowongan.mataKuliah.kode})
                        </h2>
                        <p><strong>Deskripsi:</strong> {lowongan.mataKuliah.deskripsi}</p>
                        <p><strong>Tahun Ajaran:</strong> {lowongan.tahunAjaran}</p>
                        <p><strong>Semester:</strong> {lowongan.semester}</p>

                        {openLogId === lowongan.lowonganId && (
                            <div style={{ marginTop: "1rem" }}>
                                <h3>Log terkait pendaftaran:</h3>

                                {loadingLogs && <p>Loading logs...</p>}
                                {errorLogs && <p style={{ color: "red" }}>Error: {errorLogs}</p>}

                                {!loadingLogs && !errorLogs && pendaftaranUser.length === 0 && (
                                    <p>Tidak ada pendaftaran untuk lowongan ini.</p>
                                )}

                                {!loadingLogs &&
                                    !errorLogs &&
                                    pendaftaranUser.length > 0 &&
                                    pendaftaranUser.map((pendaftaran) => {
                                        const pendaftaranId = pendaftaran.pendaftaranId;
                                        const logsForPendaftaran = groupedLogs[pendaftaranId] || [];

                                        return (
                                            <div key={pendaftaranId} style={{ marginBottom: "1rem" }}>
                                                {logsForPendaftaran.length === 0 ? (
                                                    <p>Tidak ada log untuk pendaftaran ini.</p>
                                                ) : (
                                                    <table
                                                        style={{
                                                            width: "100%",
                                                            borderCollapse: "collapse",
                                                        }}
                                                    >
                                                        <thead>
                                                        <tr>
                                                            <th style={thStyle}>Judul</th>
                                                            <th style={thStyle}>Keterangan</th>
                                                            <th style={thStyle}>Tanggal</th>
                                                            <th style={thStyle}>Waktu Mulai</th>
                                                            <th style={thStyle}>Waktu Selesai</th>
                                                            <th style={thStyle}>Status</th>
                                                            <th style={thStyle}>Pesan untuk Dosen</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {logsForPendaftaran.map((log) => (
                                                            <tr key={log.id} style={trStyle}>
                                                                <td style={tdStyle}>{log.judul}</td>
                                                                <td style={tdStyle}>{log.keterangan}</td>
                                                                <td style={tdStyle}>{log.tanggalLog}</td>
                                                                <td style={tdStyle}>{log.waktuMulai}</td>
                                                                <td style={tdStyle}>{log.waktuSelesai}</td>
                                                                <td style={tdStyle}>{log.status}</td>
                                                                <td style={tdStyle}>{log.pesanUntukDosen}</td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
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
