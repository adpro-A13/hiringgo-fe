import { useState } from "react";

export default function LogTable({ logs, onLogDeleted, onLogEdited }) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const [editingLog, setEditingLog] = useState(null);
    const [editForm, setEditForm] = useState({});

    const handleDelete = async (id) => {
        const confirmDelete = confirm("Yakin ingin menghapus log ini?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`http://localhost:8080/api/logs/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Gagal menghapus log.");
            onLogDeleted(id); // Trigger parent to update
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEditClick = (log) => {
        setEditingLog(log.id);
        setEditForm({
            judul: log.judul,
            keterangan: log.keterangan,
            tanggalLog: log.tanggalLog,
            waktuMulai: log.waktuMulai,
            waktuSelesai: log.waktuSelesai,
            pesanUntukDosen: log.pesanUntukDosen,
        });
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e, id) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:8080/api/logs/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editForm),
            });

            if (!res.ok) throw new Error("Gagal memperbarui log.");
            const updatedLog = await res.json();
            onLogEdited(updatedLog); // Trigger parent to update
            setEditingLog(null);
        } catch (err) {
            alert(err.message);
        }
    };

    if (!logs || logs.length === 0) {
        return <p>Tidak ada log untuk pendaftaran ini.</p>;
    }

    return (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
            <thead>
            <tr>
                <th style={thStyle}>Judul</th>
                <th style={thStyle}>Keterangan</th>
                <th style={thStyle}>Tanggal</th>
                <th style={thStyle}>Waktu Mulai</th>
                <th style={thStyle}>Waktu Selesai</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Pesan untuk Dosen</th>
                <th style={thStyle}>Aksi</th>
            </tr>
            </thead>
            <tbody>
            {logs.map((log) => (
                <tr key={log.id} style={trStyle}>
                    {editingLog === log.id ? (
                        <>
                            <td style={tdStyle}>
                                <input
                                    name="judul"
                                    value={editForm.judul}
                                    onChange={handleEditChange}
                                    style={{ width: "100%" }}
                                />
                            </td>
                            <td style={tdStyle}>
                                <input
                                    name="keterangan"
                                    value={editForm.keterangan}
                                    onChange={handleEditChange}
                                    style={{ width: "100%" }}
                                />
                            </td>
                            <td style={tdStyle}>
                                <input
                                    type="date"
                                    name="tanggalLog"
                                    value={editForm.tanggalLog}
                                    onChange={handleEditChange}
                                    style={{ width: "100%" }}
                                />
                            </td>
                            <td style={tdStyle}>
                                <input
                                    type="time"
                                    name="waktuMulai"
                                    value={editForm.waktuMulai}
                                    onChange={handleEditChange}
                                    style={{ width: "100%" }}
                                />
                            </td>
                            <td style={tdStyle}>
                                <input
                                    type="time"
                                    name="waktuSelesai"
                                    value={editForm.waktuSelesai}
                                    onChange={handleEditChange}
                                    style={{ width: "100%" }}
                                />
                            </td>
                            <td style={tdStyle}>{log.status}</td>
                            <td style={tdStyle}>
                                <input
                                    name="pesanUntukDosen"
                                    value={editForm.pesanUntukDosen}
                                    onChange={handleEditChange}
                                    style={{ width: "100%" }}
                                />
                            </td>
                            <td style={tdStyle}>
                                <button onClick={(e) => handleEditSubmit(e, log.id)}>Simpan</button>{" "}
                                <button onClick={() => setEditingLog(null)}>Batal</button>
                            </td>
                        </>
                    ) : (
                        <>
                            <td style={tdStyle}>{log.judul}</td>
                            <td style={tdStyle}>{log.keterangan}</td>
                            <td style={tdStyle}>{log.tanggalLog}</td>
                            <td style={tdStyle}>{log.waktuMulai}</td>
                            <td style={tdStyle}>{log.waktuSelesai}</td>
                            <td style={tdStyle}>{log.status}</td>
                            <td style={tdStyle}>{log.pesanUntukDosen}</td>
                            <td style={tdStyle}>
                                <button onClick={() => handleEditClick(log)}>Edit</button>{" "}
                                <button onClick={() => handleDelete(log.id)}>Hapus</button>
                            </td>
                        </>
                    )}
                </tr>
            ))}
            </tbody>
        </table>
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
    verticalAlign: "top",
};

const trStyle = {
    borderBottom: "1px solid #ddd",
};
