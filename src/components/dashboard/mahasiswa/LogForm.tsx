import { useState } from "react";
import { Plus, Calendar, Clock, FileText, MessageSquare, Save, AlertCircle } from "lucide-react";

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
    const [success, setSuccess] = useState(false);
    const [timeError, setTimeError] = useState("");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    // Enhanced time validation function
    const validateTimes = (startTime, endTime, date) => {
        if (!startTime || !endTime) return "";

        // Convert times to minutes for easier comparison
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        const startTotalMin = startHour * 60 + startMin;
        const endTotalMin = endHour * 60 + endMin;

        if (startTotalMin >= endTotalMin) {
            return "Waktu selesai harus lebih dari waktu mulai";
        }

        // Calculate duration
        const durationMin = endTotalMin - startTotalMin;
        const hours = Math.floor(durationMin / 60);
        const minutes = durationMin % 60;

        return "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newForm = { ...form, [name]: value };
        setForm(newForm);

        // Clear general errors
        if (error) setError(null);
        if (success) setSuccess(false);

        // Real-time time validation
        if (name === 'waktuMulai' || name === 'waktuSelesai') {
            const startTime = name === 'waktuMulai' ? value : form.waktuMulai;
            const endTime = name === 'waktuSelesai' ? value : form.waktuSelesai;

            const timeValidationError = validateTimes(startTime, endTime, form.tanggalLog);
            setTimeError(timeValidationError);
        }
    };

    const calculateDuration = () => {
        if (!form.waktuMulai || !form.waktuSelesai || timeError) return "";

        const [startHour, startMin] = form.waktuMulai.split(':').map(Number);
        const [endHour, endMin] = form.waktuSelesai.split(':').map(Number);

        const startTotalMin = startHour * 60 + startMin;
        const endTotalMin = endHour * 60 + endMin;
        const durationMin = endTotalMin - startTotalMin;

        const hours = Math.floor(durationMin / 60);
        const minutes = durationMin % 60;

        if (hours > 0 && minutes > 0) {
            return `${hours} jam ${minutes} menit`;
        } else if (hours > 0) {
            return `${hours} jam`;
        } else {
            return `${minutes} menit`;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(false);

        // Comprehensive validation
        if (!form.judul.trim()) {
            setError("Judul log wajib diisi");
            setSubmitting(false);
            return;
        }

        if (!form.tanggalLog) {
            setError("Tanggal log wajib diisi");
            setSubmitting(false);
            return;
        }

        if (!form.waktuMulai || !form.waktuSelesai) {
            setError("Waktu mulai dan waktu selesai wajib diisi");
            setSubmitting(false);
            return;
        }

        if (!form.keterangan.trim()) {
            setError("Keterangan aktivitas wajib diisi");
            setSubmitting(false);
            return;
        }

        // Time validation
        const timeValidationError = validateTimes(form.waktuMulai, form.waktuSelesai, form.tanggalLog);
        if (timeValidationError) {
            setError(timeValidationError);
            setSubmitting(false);
            return;
        }

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

            setSuccess(true);
            onLogCreated(data);

            // Auto-hide success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const kategoriOptions = [
        { value: "ASISTENSI", label: "Asistensi", icon: "👥" },
        { value: "MENGOREKSI", label: "Mengoreksi", icon: "✏️" },
        { value: "MENGAWAS", label: "Mengawas", icon: "👁️" },
        { value: "LAIN_LAIN", label: "Lainnya", icon: "📝" }
    ];

    const duration = calculateDuration();

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Buat Log Baru</h3>
            </div>

            {/* Success Message */}
            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <span className="text-green-800 font-medium">Log berhasil dibuat!</span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-800">{error}</span>
                </div>
            )}

            <div className="space-y-6">
                {/* Judul */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-1" />
                        Judul Log <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="judul"
                        placeholder="Masukkan judul log aktivitas"
                        value={form.judul}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                </div>

                {/* Kategori */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori Aktivitas
                    </label>
                    <div className="relative">
                        <select
                            name="kategori"
                            value={form.kategori}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-colors"
                        >
                            {kategoriOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.icon} {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Date and Time Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Tanggal <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="tanggalLog"
                            value={form.tanggalLog}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Waktu Mulai <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            name="waktuMulai"
                            value={form.waktuMulai}
                            onChange={handleChange}
                            required
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                timeError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Waktu Selesai <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            name="waktuSelesai"
                            value={form.waktuSelesai}
                            onChange={handleChange}
                            required
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                timeError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                        />
                    </div>
                </div>

                {/* Time Error Message */}
                {timeError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-red-800 text-sm">{timeError}</span>
                    </div>
                )}

                {/* Duration Display */}
                {duration && !timeError && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-green-800 text-sm font-medium">
                            Durasi aktivitas: {duration}
                        </span>
                    </div>
                )}

                {/* Keterangan */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Keterangan Aktivitas <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="keterangan"
                        placeholder="Jelaskan detail aktivitas yang dilakukan..."
                        value={form.keterangan}
                        onChange={handleChange}
                        rows={4}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">Wajib diisi - Berikan detail tentang apa yang Anda lakukan</p>
                </div>

                {/* Pesan untuk Dosen */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MessageSquare className="w-4 h-4 inline mr-1" />
                        Pesan untuk Dosen
                    </label>
                    <textarea
                        name="pesanUntukDosen"
                        placeholder="Tuliskan pesan atau catatan untuk dosen pembimbing..."
                        value={form.pesanUntukDosen}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">Opsional - Sampaikan hal penting kepada dosen</p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting || !!timeError}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-white font-medium rounded-lg transition-all duration-200 ${
                            submitting || timeError
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Menyimpan Log...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Simpan Log
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Helper Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">Tips Pengisian Log</h4>
                        <ul className="text-xs text-blue-800 space-y-1">
                            <li>• Waktu selesai harus lebih dari waktu mulai</li>
                            <li>• Keterangan aktivitas wajib diisi dengan detail yang jelas</li>
                            <li>• Gunakan pesan untuk dosen jika ada hal penting yang perlu dikomunikasikan</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}