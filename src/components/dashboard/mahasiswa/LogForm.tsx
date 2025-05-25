import { useState } from "react";

export default function FormLog({ pendaftaranId, userId, onLogCreated }) {
    const [form, setForm] = useState({
        judul: "",
        kategori: "ASISTENSI",
        waktuMulai: "",
        waktuSelesai: "",
        tanggalLog: "",
        keterangan: "",
        pesanUntukDosen: ""
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const payload = {
            ...form,
            pendaftaran: pendaftaranId,
            user: userId,
        };

        try {
            const res = await fetch("http://localhost:8080/api/logs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Gagal membuat log.");

            const data = await res.json();
            setForm({
                judul: "",
                kategori: "ASISTENSI",
                waktuMulai: "",
                waktuSelesai: "",
                tanggalLog: "",
                keterangan: "",
                pesanUntukDosen: ""
            });

            onLogCreated(data); // Panggil callback untuk update log table di induk
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: "1rem", maxWidth: "500px" }}>
            <h4>Buat Log Baru</h4>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <div style={{ marginBottom: "0.75rem" }}>
                <input
                    name="judul"
                    placeholder="Judul"
                    value={form.judul}
                    onChange={handleChange}
                    required
                    style={{
                        width: "100%",
                        padding: "8px",
                        fontSize: "1rem",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                    }}
                />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
                <select
                    name="kategori"
                    value={form.kategori}
                    onChange={handleChange}
                    style={{
                        width: "100%",
                        padding: "8px",
                        fontSize: "1rem",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                    }}
                >
                    <option value="ASISTENSI">Asistensi</option>
                    <option value="MENGOREKSI">Mengoreksi</option>
                    <option value="MENGAWAS">Mengawas</option>
                    <option value="LAIN_LAIN">Lainnya</option>
                </select>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <input
                    type="date"
                    name="tanggalLog"
                    value={form.tanggalLog}
                    onChange={handleChange}
                    required
                    style={{
                        flex: 1,
                        padding: "8px",
                        fontSize: "1rem",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                    }}
                />
                <input
                    type="time"
                    name="waktuMulai"
                    value={form.waktuMulai}
                    onChange={handleChange}
                    required
                    style={{
                        flex: 1,
                        padding: "8px",
                        fontSize: "1rem",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                    }}
                />
                <input
                    type="time"
                    name="waktuSelesai"
                    value={form.waktuSelesai}
                    onChange={handleChange}
                    required
                    style={{
                        flex: 1,
                        padding: "8px",
                        fontSize: "1rem",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                    }}
                />
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
                <textarea
                    name="keterangan"
                    placeholder="Keterangan"
                    value={form.keterangan}
                    onChange={handleChange}
                    rows={3}
                    style={{
                        width: "100%",
                        padding: "8px",
                        fontSize: "1rem",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        resize: "vertical",
                    }}
                />
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <textarea
                    name="pesanUntukDosen"
                    placeholder="Pesan untuk Dosen"
                    value={form.pesanUntukDosen}
                    onChange={handleChange}
                    rows={2}
                    style={{
                        width: "100%",
                        padding: "8px",
                        fontSize: "1rem",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        resize: "vertical",
                    }}
                />
            </div>

            <button
                type="submit"
                disabled={submitting}
                style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "1.1rem",
                    borderRadius: "5px",
                    border: "none",
                    backgroundColor: submitting ? "#ccc" : "#0070f3",
                    color: "white",
                    cursor: submitting ? "not-allowed" : "pointer",
                    transition: "background-color 0.3s ease",
                }}
            >
                {submitting ? "Menyimpan..." : "Simpan Log"}
            </button>
        </form>
    );
}