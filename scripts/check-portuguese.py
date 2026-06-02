#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd()

INCLUDE_EXTENSIONS = {".js", ".jsx", ".ts", ".tsx", ".json", ".md", ".css", ".html"}
IGNORE_DIRS = {".git", ".next", "node_modules", "public/uploads", "dist", "build"}

PORTUGUESE_PATTERNS = [
    r"[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]",
    r"\b(você|voce|usuário|usuario|membro|membros|médico|medico|médicos|medicos)\b",
    r"\b(senha|conta|perfil|postagem|postagens|evento|eventos|mensagem|mensagens)\b",
    r"\b(entrar|sair|salvar|cancelar|excluir|editar|criar|adicionar|buscar|carregando)\b",
    r"\b(erro|sucesso|falha|não|nao|nenhum|nenhuma|todos|todas|apenas)\b",
    r"\b(título|titulo|descrição|descricao|conteúdo|conteudo|comentário|comentario)\b",
    r"\b(aprovado|aprovada|pendente|rejeitado|rejeitada|bloqueado|bloqueada)\b",
    r"\b(voltar|próximo|proximo|anterior|confirmar|recusar|aceitar)\b",
]

COMPILED = [re.compile(pattern, re.IGNORECASE) for pattern in PORTUGUESE_PATTERNS]
FALSE_POSITIVE_PATTERNS = [
    re.compile(r"console\.error", re.IGNORECASE),
    re.compile(r"pt-BR", re.IGNORECASE),
    re.compile(r"/membro|/postagens|/eventos|/medico|/diretorio|/perfil|/criar", re.IGNORECASE),
    re.compile(r"^\s*(//|/\*|\*|\*/|\{\/\*)"),
    re.compile(r"\{\/\*.*\*\/\}"),
    re.compile(r"includes\(\"(aprovação|aguarda|recus)\"\)"),
    re.compile(r"/\*.*\*/"),
]

def should_skip(path: Path) -> bool:
    if any(part in IGNORE_DIRS for part in path.parts):
        return True
    return path.suffix not in INCLUDE_EXTENSIONS

def looks_like_false_positive(line: str) -> bool:
    return any(pattern.search(line) for pattern in FALSE_POSITIVE_PATTERNS)

def scan_file(path: Path):
    matches = []
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return matches

    for line_number, line in enumerate(text.splitlines(), start=1):
        if looks_like_false_positive(line):
            continue
        found_terms = []
        for pattern in COMPILED:
            found_terms.extend(pattern.findall(line))
        if found_terms:
            matches.append((line_number, line.strip(), sorted(set(map(str, found_terms)))))
    return matches

def main():
    total = 0
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or should_skip(path):
            continue
        matches = scan_file(path)
        if not matches:
            continue
        rel = path.relative_to(ROOT)
        print(f"\n{rel}")
        for line_number, line, terms in matches:
            total += 1
            terms_text = ", ".join(terms[:8])
            print(f"  {line_number}: {line}")
            print(f"      terms: {terms_text}")
    print(f"\nTotal suspicious lines: {total}")
    if total:
        sys.exit(1)

if __name__ == "__main__":
    main()
