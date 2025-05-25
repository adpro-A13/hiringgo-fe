import { useState, useRef, useEffect } from "react";
import { Edit, Trash2, Check, X, Calendar, Clock, Tag } from "lucide-react";

export default function LogTable({ logs, onLogDeleted, onLogEdited }) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const [editingLog, setEditingLog] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(null);
    const [focusedField, setFocusedField] = useState({ show: false, field: '', value: '', position: { x: 0, y: 0 } });
    const popupRef = useRef(null);

    const kategoriOptions = [
        { value: "ASISTENSI", label: "Asistensi", icon: "👥" },
        { value: "MENGOREKSI", label: "Mengoreksi", icon: "✏️" },
        { value: "MENGAWAS", label: "Mengawas", icon: "👁️" },
        { value: "LAIN_LAIN", label: "Lainnya", icon: "📝" }
    ];

    const handleDelete = async (id) => {
        const confirmDelete = confirm("Yakin ingin menghapus log ini?");
        if (!confirmDelete) return;

        setLoading(id);
        try {
            const res = await fetch(`http://localhost:8080/api/logs/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Gagal menghapus log.");
            onLogDeleted(id);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(null);
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
            kategori: log.kategori,
            pesanUntukDosen: log.pesanUntukDosen,
        });
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e, id) => {
        e.preventDefault();
        setLoading(id);
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
            onLogEdited(updatedLog);
            setEditingLog(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(null);
        }
    };

    const showFieldPopup = (e, fieldName, value) => {
        const rect = e.target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        setFocusedField({
            show: true,
            field: fieldName,
            value: value || '',
            position: {
                x: rect.left + scrollLeft,
                y: rect.top + scrollTop
            }
        });
    };

    const hideFieldPopup = () => {
        setFocusedField({ show: false, field: '', value: '', position: { x: 0, y: 0 } });
    };

    const handlePopupChange = (value) => {
        setFocusedField(prev => ({ ...prev, value }));
        setEditForm({ ...editForm, [focusedField.field]: value });
    };

    const handlePopupSave = () => {
        setEditForm({ ...editForm, [focusedField.field]: focusedField.value });
        hideFieldPopup();
    };

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                hideFieldPopup();
            }
        };

        if (focusedField.show) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [focusedField.show]);

    const getStatusBadge = (status) => {
        const statusColors = {
            'MENUNGGU': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'DITERIMA': 'bg-green-100 text-green-800 border-green-200',
            'DITOLAK': 'bg-red-100 text-red-800 border-red-200',
        };

        const colorClass = statusColors[status] || 'bg-blue-100 text-blue-800 border-blue-200';

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
                {status}
            </span>
        );
    };

    const getKategoriBadge = (kategori) => {
        const kategoriOption = kategoriOptions.find(opt => opt.value === kategori);
        if (!kategoriOption) return null;

        const kategoriColors = {
            'ASISTENSI': 'bg-blue-100 text-blue-800 border-blue-200',
            'MENGOREKSI': 'bg-purple-100 text-purple-800 border-purple-200',
            'MENGAWAS': 'bg-orange-100 text-orange-800 border-orange-200',
            'LAIN_LAIN': 'bg-gray-100 text-gray-800 border-gray-200'
        };

        const colorClass = kategoriColors[kategori] || 'bg-gray-100 text-gray-800 border-gray-200';

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
                <span>{kategoriOption.icon}</span>
                {kategoriOption.label}
            </span>
        );
    };

    if (!logs || logs.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-gray-400 mb-2">
                    <Calendar className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-600 font-medium">Tidak ada log untuk pendaftaran ini</p>
                <p className="text-gray-400 text-sm mt-1">Log aktivitas akan muncul di sini setelah ditambahkan</p>
            </div>
        );
    }

    return (
        <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Judul
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                Kategori
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Keterangan
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Tanggal
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Waktu Mulai
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Waktu Selesai
                            </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pesan untuk Dosen
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aksi
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log, index) => (
                        <tr
                            key={log.id}
                            className={`hover:bg-gray-50 transition-colors ${
                                editingLog === log.id ? 'bg-blue-50' : ''
                            } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                        >
                            {editingLog === log.id ? (
                                <>
                                    <td className="px-4 py-3">
                                        <input
                                            name="judul"
                                            value={editForm.judul}
                                            onChange={handleEditChange}
                                            onFocus={(e) => showFieldPopup(e, 'judul', editForm.judul)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            placeholder="Masukkan judul"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            name="kategori"
                                            value={editForm.kategori}
                                            onChange={handleEditChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        >
                                            <option value="">Pilih Kategori</option>
                                            {kategoriOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.icon} {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <textarea
                                            name="keterangan"
                                            value={editForm.keterangan}
                                            onChange={handleEditChange}
                                            onFocus={(e) => showFieldPopup(e, 'keterangan', editForm.keterangan)}
                                            rows="2"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                                            placeholder="Masukkan keterangan"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="date"
                                            name="tanggalLog"
                                            value={editForm.tanggalLog}
                                            onChange={handleEditChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="time"
                                            name="waktuMulai"
                                            value={editForm.waktuMulai}
                                            onChange={handleEditChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="time"
                                            name="waktuSelesai"
                                            value={editForm.waktuSelesai}
                                            onChange={handleEditChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        {getStatusBadge(log.status)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <textarea
                                            name="pesanUntukDosen"
                                            value={editForm.pesanUntukDosen}
                                            onChange={handleEditChange}
                                            onFocus={(e) => showFieldPopup(e, 'pesanUntukDosen', editForm.pesanUntukDosen)}
                                            rows="2"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                                            placeholder="Pesan untuk dosen"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={(e) => handleEditSubmit(e, log.id)}
                                                disabled={loading === log.id}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors disabled:opacity-50"
                                            >
                                                <Check className="w-3 h-3" />
                                                {loading === log.id ? 'Menyimpan...' : 'Simpan'}
                                            </button>
                                            <button
                                                onClick={() => setEditingLog(null)}
                                                disabled={loading === log.id}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white text-xs font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-colors disabled:opacity-50"
                                            >
                                                <X className="w-3 h-3" />
                                                Batal
                                            </button>
                                        </div>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {log.judul}
                                    </td>
                                    <td className="px-4 py-3">
                                        {getKategoriBadge(log.kategori)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                                        <div className="line-clamp-2">
                                            {log.keterangan}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {new Date(log.tanggalLog).toLocaleDateString('id-ID', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                                        {log.waktuMulai}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                                        {log.waktuSelesai}
                                    </td>
                                    <td className="px-4 py-3">
                                        {getStatusBadge(log.status)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                                        <div className="line-clamp-2">
                                            {log.pesanUntukDosen || '-'}
                                        </div>
                                    </td>
                                    {log.status !== "DITERIMA" && (
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => handleEditClick(log)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                                                >
                                                    <Edit className="w-3 h-3" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(log.id)}
                                                    disabled={loading === log.id}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    {loading === log.id ? 'Menghapus...' : 'Hapus'}
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Field Edit Popup */}
            {focusedField.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        ref={popupRef}
                        className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-md w-full mx-4"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 capitalize">
                                Edit {focusedField.field === 'pesanUntukDosen' ? 'Pesan untuk Dosen' : focusedField.field}
                            </h3>
                            <button
                                onClick={hideFieldPopup}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            {focusedField.field === 'kategori' ? (
                                <select
                                    value={focusedField.value}
                                    onChange={(e) => handlePopupChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    autoFocus
                                >
                                    <option value="">Pilih Kategori</option>
                                    {kategoriOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.icon} {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : focusedField.field === 'keterangan' || focusedField.field === 'pesanUntukDosen' ? (
                                <textarea
                                    value={focusedField.value}
                                    onChange={(e) => handlePopupChange(e.target.value)}
                                    rows="6"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                                    placeholder={`Masukkan ${focusedField.field === 'pesanUntukDosen' ? 'pesan untuk dosen' : 'keterangan'}`}
                                    autoFocus
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={focusedField.value}
                                    onChange={(e) => handlePopupChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder={`Masukkan ${focusedField.field}`}
                                    autoFocus
                                />
                            )}
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={hideFieldPopup}
                                className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handlePopupSave}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                            >
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}