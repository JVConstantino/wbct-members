"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Search,
    Users,
    Loader2,
    Stethoscope,
    MapPin,
    FileText,
    ChevronRight,
    Filter
} from "lucide-react";

export default function DirectoryPage() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSpecialty, setFilterSpecialty] = useState("");

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/users/directory");
                const data = await res.json();
                if (data.success) {
                    setDoctors(data.users);
                }
            } catch (error) {
                console.error("Error loading directory:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    // Filtrar médicos
    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch =
            doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.stack?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = !filterSpecialty || doctor.stack?.toLowerCase().includes(filterSpecialty.toLowerCase());

        return matchesSearch && matchesFilter;
    });

    // Especialidades únicas para o filtro
    const specialties = [...new Set(doctors.map(d => d.stack).filter(Boolean))];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
                <p className="text-slate-500 font-bold text-xl">Carregando Diretório Médico...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
                                <Users size={24} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Networking</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                            Diretório <span className="text-primary-600">Médico</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg max-w-xl">
                            Conecte-se com outros profissionais da saúde, conheça suas especialidades e acompanhe suas contribuições.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                        {/* Busca */}
                        <div className="relative flex-1 lg:w-80 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or specialty..."
                                className="input pl-14 py-4 bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filtro de Especialidade */}
                        {specialties.length > 0 && (
                            <div className="relative">
                                <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <select
                                    className="input pl-14 py-4 pr-10 bg-slate-50 dark:bg-slate-800 border-transparent appearance-none cursor-pointer"
                                    value={filterSpecialty}
                                    onChange={(e) => setFilterSpecialty(e.target.value)}
                                >
                                    <option value="">Todas especialidades</option>
                                    {specialties.map((spec) => (
                                        <option key={spec} value={spec}>{spec}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-3xl font-black text-primary-600">{doctors.length}</p>
                    <p className="text-sm text-slate-500 font-medium">Médicos Cadastrados</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-3xl font-black text-primary-600">{specialties.length}</p>
                    <p className="text-sm text-slate-500 font-medium">Especialidades</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-3xl font-black text-primary-600">{filteredDoctors.length}</p>
                    <p className="text-sm text-slate-500 font-medium">Resultados</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-3xl font-black text-emerald-500">Online</p>
                    <p className="text-sm text-slate-500 font-medium">Comunidade Ativa</p>
                </div>
            </div>

            {/* Grid de Médicos */}
            {filteredDoctors.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                    <Users className="mx-auto text-slate-200 mb-6" size={80} />
                    <h3 className="text-2xl font-black text-slate-400">No doctor found</h3>
                    <p className="text-slate-300 font-medium mt-2">Tente ajustar seus filtros de busca.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor) => (
                        <Link
                            key={doctor.id}
                            href={`/membro/medico/${doctor.id}`}
                            className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex items-start gap-5">
                                {/* Avatar */}
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-black flex-shrink-0 overflow-hidden">
                                    {doctor.image ? (
                                        <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                                    ) : (
                                        doctor.name?.charAt(0) || "M"
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">
                                        {doctor.name || "Médico"}
                                    </h3>

                                    {doctor.stack && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <Stethoscope size={14} className="text-primary-500" />
                                            <span className="text-sm font-medium text-primary-600">{doctor.stack}</span>
                                        </div>
                                    )}

                                    {doctor.specialty && (
                                        <p className="text-sm text-slate-500 mt-1 truncate">{doctor.specialty}</p>
                                    )}

                                    {doctor.bio && (
                                        <p className="text-sm text-slate-400 mt-2 line-clamp-2">{doctor.bio}</p>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-50 dark:border-slate-800">
                                <div className="flex items-center gap-4 text-slate-400">
                                    <span className="flex items-center gap-1 text-xs font-medium">
                                        <FileText size={14} />
                                        {doctor._count?.posts || 0} posts
                                    </span>
                                </div>
                                <span className="flex items-center gap-1 text-primary-600 text-xs font-bold uppercase tracking-wider group-hover:gap-2 transition-all">
                                    Ver Perfil <ChevronRight size={14} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
