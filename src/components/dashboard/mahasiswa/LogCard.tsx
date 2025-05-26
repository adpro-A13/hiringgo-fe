import { useState } from "react";
import { ChevronDown, ChevronRight, BookOpen, Calendar, Users, Plus, FileText, Eye, EyeOff } from "lucide-react";
import LogTable from "./LogTable";
import LogForm from "./LogForm";

export default function LogCard({
                                    lowongan,
                                    pendaftaranUser,
                                    groupedLogs,
                                    toggleLog,
                                    openLogId,
                                    pendaftaranId,
                                    userId,
                                    onLogCreated,
                                    onLogDeleted,
                                    onLogEdited
                                }) {
    const [showForm, setShowForm] = useState(false);
    const isOpen = openLogId === lowongan.lowonganId;

    const getSemesterBadge = (semester) => {
        const colors = {
            'GANJIL': 'bg-blue-100 text-blue-800 border-blue-200',
            'GENAP': 'bg-green-100 text-green-800 border-green-200'
        };
        return colors[semester] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getTotalLogs = () => {
        return pendaftaranUser.reduce((total, pendaftaran) => {
            const logs = groupedLogs[pendaftaran.pendaftaranId] || [];
            return total + logs.length;
        }, 0);
    };

    const handleToggleForm = (e) => {
        e.stopPropagation(); // Prevent card toggle when clicking form button
        setShowForm(!showForm);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 transition-all duration-200 hover:shadow-md">
            {/* Header */}
            <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                onClick={() => toggleLog(lowongan.lowonganId)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0"> {/* Added min-w-0 for proper text truncation */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1"> {/* Added min-w-0 for proper text truncation */}
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <span className="truncate">{lowongan.mataKuliah.nama}</span>
                                    <span className="text-sm font-normal text-gray-500 flex-shrink-0">
                                        ({lowongan.mataKuliah.kode})
                                    </span>
                                </h2>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {lowongan.mataKuliah.deskripsi}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <Calendar className="w-4 h-4" />
                                <span>{lowongan.tahunAjaran}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span>Semester:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSemesterBadge(lowongan.semester)}`}>
                                    {lowongan.semester}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <FileText className="w-4 h-4" />
                                <span>{getTotalLogs()} Log</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        {isOpen ? (
                            <>
                                <EyeOff className="w-4 h-4 text-gray-400" />
                                <ChevronDown className="w-5 h-5 text-gray-400 transition-transform" />
                            </>
                        ) : (
                            <>
                                <Eye className="w-4 h-4 text-gray-400" />
                                <ChevronRight className="w-5 h-5 text-gray-400 transition-transform" />
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isOpen && (
                <div className="bg-gray-50">
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-gray-500" />
                                <h3 className="text-lg font-medium text-gray-900">
                                    Log Aktivitas Asisten
                                </h3>
                            </div>

                            <button
                                onClick={handleToggleForm}
                                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    showForm
                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105'
                                } self-start sm:self-auto`}
                            >
                                <Plus className={`w-4 h-4 transition-transform ${showForm ? 'rotate-45' : ''}`} />
                                {showForm ? 'Tutup Form' : 'Tambah Log Baru'}
                            </button>
                        </div>

                        <div className="space-y-6">
                            {pendaftaranUser.map((pendaftaran) => {
                                const logs = groupedLogs[pendaftaran.pendaftaranId] || [];
                                return (
                                    <div key={pendaftaran.pendaftaranId} className="space-y-6">
                                        {/* Log Table */}
                                        <LogTable
                                            logs={logs}
                                            onLogDeleted={onLogDeleted}
                                            onLogEdited={onLogEdited}
                                        />

                                        {/* Animated Form */}
                                        <div className={`transition-all duration-300 ease-in-out ${
                                            showForm
                                                ? 'opacity-100 transform translate-y-0'
                                                : 'opacity-0 transform -translate-y-4 pointer-events-none'
                                        }`}>
                                            {showForm && (
                                                <div className="animate-fadeIn">
                                                    <LogForm
                                                        pendaftaranId={pendaftaranId}
                                                        userId={userId}
                                                        onLogCreated={(data) => {
                                                            onLogCreated(data);
                                                            setShowForm(false); // Auto close form after success
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Empty State for Logs */}
                        {pendaftaranUser.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <FileText className="w-12 h-12 mx-auto" />
                                </div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                    Belum Ada Pendaftaran
                                </h4>
                                <p className="text-gray-600">
                                    Pendaftaran untuk mata kuliah ini belum tersedia
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}