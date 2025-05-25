export default function LogTable({ logs }) {
    if (!logs || logs.length === 0) {
        return <p>Tidak ada log untuk pendaftaran ini.</p>;
    }

    return (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
            {logs.map((log) => (
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
