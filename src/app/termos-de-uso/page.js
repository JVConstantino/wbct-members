export default function TermsPage() {
    return (
        <main className="max-w-4xl mx-auto px-4 py-10 space-y-6 text-text-primary">
            <h1 className="text-3xl font-display font-bold">Termos de Uso</h1>
            <p className="text-sm text-text-secondary">Este documento estabelece as regras de uso da plataforma WBCT para membros e administradores.</p>

            <section className="space-y-2 text-sm text-text-secondary leading-relaxed">
                <h2 className="text-xl font-semibold text-text-primary">1. Aceitação</h2>
                <p>Ao utilizar a plataforma, você declara que leu, compreendeu e aceita estes termos e a Política de Privacidade.</p>
            </section>

            <section className="space-y-2 text-sm text-text-secondary leading-relaxed">
                <h2 className="text-xl font-semibold text-text-primary">2. Conta e Segurança</h2>
                <p>O usuário é responsável por manter a confidencialidade da sua conta e senha, bem como por toda atividade realizada nela.</p>
            </section>

            <section className="space-y-2 text-sm text-text-secondary leading-relaxed">
                <h2 className="text-xl font-semibold text-text-primary">3. Conduta</h2>
                <p>É proibido publicar conteúdo ilegal, ofensivo, enganoso ou que viole direitos de terceiros.</p>
            </section>

            <section className="space-y-2 text-sm text-text-secondary leading-relaxed">
                <h2 className="text-xl font-semibold text-text-primary">4. Encerramento</h2>
                <p>A WBCT poderá suspender ou remover contas em caso de violação destes termos.</p>
            </section>

            <section className="space-y-2 text-sm text-text-secondary leading-relaxed">
                <h2 className="text-xl font-semibold text-text-primary">5. Contato</h2>
                <p>Dúvidas sobre estes termos podem ser enviadas para info@wbctsociety.org.</p>
            </section>
        </main>
    );
}
