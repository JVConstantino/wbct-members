"use client";

import { useState } from "react";
import {
    Book,
    Shield,
    Zap,
    Users,
    FileText,
    Settings,
    Info,
    CheckCircle,
    ArrowRight,
    HelpCircle
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AdminDocsPage() {
    const [activeSection, setActiveSection] = useState("overview");

    const sections = [
        {
            id: "overview",
            title: "Overview",
            icon: Info,
            content: (
                <div className="space-y-6">
                    <p className="text-text-secondary leading-relaxed">
                        Bem-vindo ao manual da plataforma WBCT. Este guia foi criado para administradores gerenciarem usuarios, conteudos e configuracoes com mais rapidez.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-surface-subtle rounded-2xl border border-border-default">
                            <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                                <Shield size={18} className="text-brand-primary" />
                                Seguranca Prioritaria
                            </h4>
                            <p className="text-sm text-text-muted">Acesso protegido por regras de permissao. Apenas usuarios ADMIN visualizam este painel.</p>
                        </div>
                        <div className="p-6 bg-surface-subtle rounded-2xl border border-border-default">
                            <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                                <Zap size={18} className="text-brand-primary" />
                                Performance
                            </h4>
                            <p className="text-sm text-text-muted">A plataforma usa Next.js + Turbopack para renderizacao veloz e melhor experiencia em telas com grande volume de dados.</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "members",
            title: "Member Management",
            icon: Users,
            content: (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-text-primary">Gestao de usuarios</h3>
                    <p className="text-text-secondary leading-relaxed">
                        No menu de Membros voce pode visualizar todos os cadastros, editar perfis e ajustar papeis de acesso.
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <CheckCircle size={18} className="text-status-success mt-0.5" />
                            <span className="text-text-secondary"><strong className="text-text-primary">Aprovacao:</strong> novos cadastros podem ser filtrados por status.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle size={18} className="text-status-success mt-0.5" />
                            <span className="text-text-secondary"><strong className="text-text-primary">Papeis:</strong> voce pode promover um membro para ADMIN para dividir tarefas de moderacao.</span>
                        </li>
                    </ul>
                </div>
            )
        },
        {
            id: "posts",
            title: "Post Moderation",
            icon: FileText,
            content: (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-text-primary">Moderacao de postagens</h3>
                    <p className="text-text-secondary">Todo conteudo enviado passa por revisao antes de ficar publico para a comunidade.</p>
                    <div className="bg-status-warning-bg border border-status-warning/20 p-4 rounded-xl">
                        <p className="text-sm text-status-warning font-medium">
                            Importante: ao aprovar uma postagem, os seguidores do autor podem receber notificacao automaticamente.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: "system",
            title: "System Settings",
            icon: Settings,
            content: (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-text-primary">Variaveis e ambiente</h3>
                    <p className="text-text-secondary">Use variaveis de ambiente consistentes e nunca exponha segredos no frontend.</p>
                    <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto">
                        # Technical configuration example<br />
                        DATABASE_URL="mysql://un:pw@host:port/db"<br />
                        NEXTAUTH_SECRET="chave-de-seguranca"<br />
                        AUTH_URL="http://localhost:3001"
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 pb-10 animate-fade-in">
            <PageHeader
                title="Documentacao"
                subtitle="Guia rapido para operacao administrativa da plataforma"
            />

            <div className="relative rounded-2xl bg-brand-strong p-6 md:p-8 overflow-hidden shadow-xl border border-border-default">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/25 to-transparent" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-9 h-9 bg-brand-primary rounded-lg flex items-center justify-center">
                            <Book className="text-white" size={18} />
                        </div>
                        <span className="text-xs font-black text-primary-200 uppercase tracking-[0.15em]">Manual Admin</span>
                    </div>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-black !text-white tracking-tight max-w-xl leading-tight">
                        Diretrizes de operacao e boas praticas do painel WBCT.
                    </h1>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Sidebar Navigation */}
                <aside className="lg:w-80 flex-shrink-0">
                    <div className="sticky top-32 space-y-2">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-sm transition-all text-left ${isActive
                                        ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                                        : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
                                        }`}
                                >
                                    <Icon size={18} />
                                    {section.title}
                                </button>
                            );
                        })}
                        <hr className="my-6 border-border-subtle" />
                        <div className="p-5 bg-surface-subtle rounded-xl border border-border-subtle">
                            <HelpCircle size={24} className="text-brand-primary mb-3" />
                            <h4 className="text-sm font-black text-text-primary mb-2">Precisa de suporte?</h4>
                            <p className="text-xs text-text-muted leading-relaxed mb-4">Fale com o time tecnico para duvidas avancadas de infraestrutura.</p>
                            <a href="mailto:suporte@wbct.com" className="text-xs font-black text-brand-primary hover:underline flex items-center gap-1">
                                Enviar e-mail <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>
                </aside>

                {/* Content Area */}
                <div className="flex-1 bg-surface-card rounded-2xl border border-border-subtle p-8 md:p-10 shadow-sm min-h-[500px]">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-8">
                            {(() => {
                                const activeIcon = sections.find(s => s.id === activeSection)?.icon || Info;
                                const IconComp = activeIcon;
                                return <IconComp size={32} className="text-brand-primary" />;
                            })()}
                            <h2 className="text-3xl font-black text-text-primary tracking-tight">
                                {sections.find(s => s.id === activeSection)?.title}
                            </h2>
                        </div>
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            {sections.find(s => s.id === activeSection)?.content}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
