#!/usr/bin/env python3
"""
Automatic Portuguese to English translation for WBCT Member section
This script finds and reports all Portuguese text that needs translation
"""

import os
import re
from pathlib import Path

# Common Portuguese to English translations
TRANSLATIONS = {
    # UI Labels
    "Título": "Title",
    "Conteúdo": "Content",
    "Comentários": "Comments",
    "Publicar": "Publish",
    "Salvar": "Save",
    "Cancelar": "Cancel",
    "Enviar": "Send",
    "Voltar": "Back",
    "Remover": "Remove",
    "Adicionar": "Add",
    "Editar": "Edit",
    "Excluir": "Delete",
    "Atualizar": "Update",
    "Começar": "Start",
    "Ver mais": "See more",
    
    # Status
    "Pendente": "Pending",
    "Aprovado": "Approved",
    "Rejeitado": "Rejected",
    "Em Revisão": "Under Review",
    "Concluído": "Completed",
    
    # Time expressions
    "há": "ago",
    "poucos segundos": "few seconds",
    "min": "min",
    "dias": "days",
    
    # Common phrases
    "Bem-vindo": "Welcome",
    "Não encontrado": "Not found",
    "Carregando": "Loading",
    "Nenhum": "No",
    "Nenhuma": "No",
    "Selecione": "Select",
    "Escolher": "Choose",
    "Buscar": "Search",
    "Pesquisar": "Search",
}

def find_portuguese_text(directory):
    """Find all Portuguese text in JS files"""
    portuguese_pattern = re.compile(r'[\u00c0-\u00ff]+')
    results = []
    
    for root, dirs, files in os.walk(directory):
        # Skip node_modules and .next
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', '.git']]
        
        for file in files:
            if file.endswith('.js'):
                filepath = Path(root) / file
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        for line_num, line in enumerate(f, 1):
                            if portuguese_pattern.search(line):
                                # Skip comments
                                if '//' in line or '/*' in line or '*/' in line:
                                    continue
                                    
                                results.append({
                                    'file': str(filepath),
                                    'line': line_num,
                                    'content': line.strip()
                                })
                except Exception as e:
                    print(f"Error reading {filepath}: {e}")
    
    return results

def main():
    membro_dir = Path("src/app/membro")
    
    if not membro_dir.exists():
        print(f"Directory {membro_dir} not found!")
        return
    
    print("🔍 Searching for Portuguese text in member section...")
    results = find_portuguese_text(membro_dir)
    
    print(f"\n📊 Found {len(results)} lines with Portuguese text\n")
    
    # Group by file
    by_file = {}
    for result in results:
        file = result['file']
        if file not in by_file:
            by_file[file] = []
        by_file[file].append(result)
    
    # Display results
    for file, lines in sorted(by_file.items()):
        rel_path = Path(file).relative_to(Path.cwd())
        print(f"\n📄 {rel_path} ({len(lines)} lines)")
        for item in lines[:5]:  # Show first 5 lines per file
            print(f"   Line {item['line']}: {item['content'][:80]}...")
        if len(lines) > 5:
            print(f"   ... and {len(lines) - 5} more lines")
    
    print(f"\n✅ Total files with Portuguese: {len(by_file)}")
    print("\n💡 Recommendation: These files need manual English translation")

if __name__ == "__main__":
    main()
