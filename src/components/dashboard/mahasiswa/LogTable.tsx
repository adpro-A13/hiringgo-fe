import React, { useState } from "react";
import { Edit, Trash2, Check, X, Calendar, Clock, Tag, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";

export default function LogTable({ logs, onLogDeleted, onLogEdited }) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const [editingLog, setEditingLog] = useState(null);
    const [expandedLogs, setExpandedLogs] = useState(new Set());
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [logToDelete, setLogToDelete] = useState(null);
    const [timeValidationError, setTimeValidationError] = useState("");

    const kategoriOptions = [
        { value: "ASISTENSI", label: "Asistensi", icon: "👥" },
        { value: "MENGOREKSI", label: "Mengoreksi", icon: "✏️" },
        { value: "MENGAWAS", label: "Mengawas", icon: "👁️" },
        { value: "LAIN_LAIN", label: "Lainnya", icon: "📝" }
    ];

    // Time validation function for 24-hour format (HH:MM)
    const validateTime = (startTime, endTime) => {
        if (!startTime || !endTime) return true; // Allow empty times

        // Parse time strings in HH:MM format
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        // Convert to minutes for easy comparison
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        // Start time must be before end time (same day only)
        return startMinutes < endMinutes;
    };

    const handleDelete = async (id) => {
        setLogToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!logToDelete) return;

        setLoading(logToDelete);
        try {
            const res = await fetch(`http://localhost:8080/api/logs/${logToDelete}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Gagal menghapus log.");
            onLogDeleted(logToDelete);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(null);
            setShowDeleteModal(false);
            setLogToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setLogToDelete(null);
    };

    const handleEditClick = (log) => {
        setEditingLog(log.id);
        setExpandedLogs(prev => new Set([...prev, log.id])); // Auto expand when editing
        setEditForm({
            judul: log.judul,
            keterangan: log.keterangan,
            tanggalLog: log.tanggalLog,
            waktuMulai: log.waktuMulai,
            waktuSelesai: log.waktuSelesai,
            kategori: log.kategori,
            pesanUntukDosen: log.pesanUntukDosen,
        });
        setTimeValidationError("");
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        const newForm = { ...editForm, [name]: value };
        setEditForm(newForm);

        // Validate time when either waktuMulai or waktuSelesai changes
        if (name === 'waktuMulai' || name === 'waktuSelesai') {
            const startTime = name === 'waktuMulai' ? value : newForm.waktuMulai;
            const endTime = name === 'waktuSelesai' ? value : newForm.waktuSelesai;

            if (startTime && endTime && !validateTime(startTime, endTime)) {
                setTimeValidationError("Waktu mulai harus lebih awal dari waktu selesai");
            } else {
                setTimeValidationError("");
            }
        }
    };

    const handleEditSubmit = async (e, id) => {
        e.preventDefault();

        // Final validation before submit
        if (!validateTime(editForm.waktuMulai, editForm.waktuSelesai)) {
            setTimeValidationError("Waktu mulai harus lebih awal dari waktu selesai");
            return;
        }

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
            setTimeValidationError("");
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(null);
        }
    };

    const toggleExpand = (logId) => {
        setExpandedLogs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(logId)) {
                newSet.delete(logId);
            } else {
                newSet.add(logId);
            }
            return newSet;
        });
    };

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
        <>
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Konfirmasi Hapus Log
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Tindakan ini tidak dapat dibatalkan
                                    </p>
                                </div>
                            </div>

                            <p className="text-gray-700 mb-6">
                                Apakah Anda yakin ingin menghapus log ini? Data yang sudah dihapus tidak dapat dikembalikan.
                            </p>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={loading === logToDelete}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading === logToDelete ? 'Menghapus...' : 'Ya, Hapus'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">

                            </th>
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
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map((log, index) => (
                            <React.Fragment key={log.id}>
                                <tr
                                    className={`hover:bg-gray-50 transition-colors ${
                                        editingLog === log.id ? 'bg-blue-50' : ''
                                    } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                                >
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => toggleExpand(log.id)}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {expandedLogs.has(log.id) ? (
                                                <ChevronDown className="w-4 h-4" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4" />
                                            )}
                                        </button>
                                    </td>
                                    {editingLog === log.id ? (
                                        <>
                                            <td className="px-4 py-3">
                                                <input
                                                    name="judul"
                                                    value={editForm.judul}
                                                    onChange={handleEditChange}
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
                                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent text-sm ${
                                                        timeValidationError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                                    }`}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="time"
                                                    name="waktuSelesai"
                                                    value={editForm.waktuSelesai}
                                                    onChange={handleEditChange}
                                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent text-sm ${
                                                        timeValidationError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                                    }`}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(log.status)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={(e) => handleEditSubmit(e, log.id)}
                                                        disabled={loading === log.id || timeValidationError}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                        {loading === log.id ? 'Menyimpan...' : 'Simpan'}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingLog(null);
                                                            setTimeValidationError("");
                                                        }}
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

                                {/* Time Validation Error Row */}
                                {editingLog === log.id && timeValidationError && (
                                    <tr className="bg-red-50">
                                        <td></td>
                                        <td colSpan="7" className="px-4 py-2">
                                            <div className="flex items-center gap-2 text-red-600 text-sm">
                                                <AlertTriangle className="w-4 h-4" />
                                                {timeValidationError}
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {/* Expanded Row for Keterangan and Pesan */}
                                {expandedLogs.has(log.id) && (
                                    <tr className={`${editingLog === log.id ? 'bg-blue-50' : 'bg-gray-50'} border-t-0`}>
                                        <td></td>
                                        <td colSpan="7" className="px-4 py-4">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Keterangan
                                                    </label>
                                                    {editingLog === log.id ? (
                                                        <textarea
                                                            name="keterangan"
                                                            value={editForm.keterangan}
                                                            onChange={handleEditChange}
                                                            rows="4"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                                                            placeholder="Masukkan keterangan"
                                                        />
                                                    ) : (
                                                        <div className="bg-white border border-gray-200 rounded-md p-3 text-sm text-gray-700 min-h-[4rem]">
                                                            {log.keterangan || <span className="text-gray-400 italic">Tidak ada keterangan</span>}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Pesan untuk Dosen
                                                    </label>
                                                    {editingLog === log.id ? (
                                                        <textarea
                                                            name="pesanUntukDosen"
                                                            value={editForm.pesanUntukDosen}
                                                            onChange={handleEditChange}
                                                            rows="4"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                                                            placeholder="Pesan untuk dosen"
                                                        />
                                                    ) : (
                                                        <div className="bg-white border border-gray-200 rounded-md p-3 text-sm text-gray-700 min-h-[4rem]">
                                                            {log.pesanUntukDosen || <span className="text-gray-400 italic">Tidak ada pesan</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}