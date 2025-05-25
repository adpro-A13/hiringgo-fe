import LogTable from "./LogTable";
import LogForm from "./LogForm";

export default function LogCard({lowongan, pendaftaranUser, groupedLogs, toggleLog,
                                    openLogId,pendaftaranId, userId, onLogCreated}) {
    return (
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
                onClick={() => toggleLog(lowongan.lowonganId)}
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
                    {pendaftaranUser.map((pendaftaran) => {
                        const logs = groupedLogs[pendaftaran.pendaftaranId] || [];
                        return (
                            <div key={pendaftaran.pendaftaranId} style={{ marginBottom: "1rem" }}>
                                <LogTable logs={logs} />
                                <h1>userId</h1>
                                <LogForm
                                    pendaftaranId={pendaftaranId}
                                    userId={userId}
                                    onLogCreated={onLogCreated}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
