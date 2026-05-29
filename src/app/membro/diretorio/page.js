"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Users, Stethoscope, FileText, ChevronRight, Filter } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

export default function DiretorioPage() {
    const [doctors, setDoctors]         = useState([]);
    const [loading, setLoading]         = useState(true);
    const [search, setSearch]           = useState("");
    const [filterSpec, setFilterSpec]   = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const res  = await fetch("/api/users/directory");
                const data = await res.json();
                if (data.success) setDoctors(data.users);
            } catch (err) {
                console.error("Erro ao carregar diretório:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const specialties = [...new Set(doctors.map(d => d.stack).filter(Boolean))];

    const filtered = doctors.filter(d => {
        const q = search.toLowerCase();
        const matchSearch =
            d.name?.toLowerCase().includes(q) ||
            d.stack?.toLowerCase().includes(q) ||
            d.specialty?.toLowerCase().includes(q);
        const matchSpec = !filterSpec || d.stack?.toLowerCase().includes(filterSpec.toLowerCase());
        return matchSearch && matchSpec;
    });

    return (
        <div className="space-y-6 pb-8">
            <PageHeader
                title="Diretório Médico"
                subtitle="Conecte-se com outros profissionais da comunidade WBCT"
            />

            {/* Busca + filtro */}
            <div className="card p-3 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, especialidade..."
                        className="input !pl-10"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {specialties.length > 0 && (
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={13} />
                        <select
                            className="input pl-8 pr-8 appearance-none cursor-pointer"
                            value={filterSpec}
                            onChange={e => setFilterSpec(e.target.value)}
                        >
                            <option value="">Todas especialidades</option>
                            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "Médicos Cadastrados", value: doctors.length },
                    { label: "Especialidades",       value: specialties.length },
                    { label: "Resultados",           value: filtered.length },
                    { label: "Comunidade Ativa",     value: "Online", highlight: true },
                ].map(({ label, value, highlight }) => (
                    <div key={label} className="card text-center py-4">
                        <p className={`text-2xl font-bold ${highlight ? "text-status-success" : "text-brand-primary"}`}>
                            {value}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* Grid de médicos */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="card space-y-3">
                            <div className="flex items-start gap-4">
                                <Skeleton variant="avatar" className="w-14 h-14 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton variant="text" className="w-40 h-4" />
                                    <Skeleton variant="text" className="w-28 h-3" />
                                    <Skeleton variant="text" className="w-full h-3" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="Nenhum médico encontrado"
                    description="Tente ajustar sua busca ou filtro de especialidade."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(doctor => (
                        <Link
                            key={doctor.id}
                            href={`/membro/medico/${doctor.id}`}
                            className="group card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <div className="flex items-start gap-4">
                                <Avatar src={doctor.image} name={doctor.name} size="lg" online />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-brand-primary transition-colors">
                                        {doctor.name || "Médico"}
                                    </h3>
                                    {doctor.stack && (
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <Stethoscope size={12} className="text-brand-primary shrink-0" />
                                            <span className="text-xs font-medium text-brand-primary truncate">{doctor.stack}</span>
                                        </div>
                                    )}
                                    {doctor.specialty && (
                                        <p className="text-xs text-text-muted mt-0.5 truncate">{doctor.specialty}</p>
                                    )}
                                    {doctor.bio && (
                                        <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">{doctor.bio}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle">
                                <span className="flex items-center gap-1 text-xs text-text-muted">
                                    <FileText size={12} />
                                    {doctor._count?.posts || 0} postagem{(doctor._count?.posts || 0) !== 1 ? "s" : ""}
                                </span>
                                <span className="flex items-center gap-1 text-xs font-semibold text-brand-primary uppercase tracking-wide group-hover:gap-1.5 transition-all">
                                    Ver perfil <ChevronRight size={12} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
