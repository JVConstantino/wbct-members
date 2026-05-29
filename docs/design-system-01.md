# ECO WAWE SOLUTIONS — DESIGN SYSTEM

## 📋 VISÃO GERAL

Sistema de design para plataforma educacional de tecnologia e programação, com foco em aprendizado interativo, cursos e comunidade de desenvolvedores.

**Características principais:**
- Interface moderna e profissional
- Forte presença da marca (azul vibrante tecnológico)
- Destaque para CTAs de conversão
- Layouts card-based para cursos e conteúdos
- Seções hero impactantes

---

## 🎨 PALETA DE CORES

### LIGHT MODE

#### Texto
- `text-primary`: #1a1a1a (quase preto, títulos e texto principal)
- `text-secondary`: #525252 (cinza médio, descrições)
- `text-muted`: #a3a3a3 (cinza claro, placeholders)
- `text-on-dark`: #ffffff (branco sobre fundos escuros)
- `text-on-brand`: #ffffff (branco sobre azul)

#### Superfícies
- `surface-page`: #ffffff (branco puro)
- `surface-section`: #f9fafb (cinza muito claro para alternar seções)
- `surface-card`: #ffffff (branco com sombra)
- `surface-subtle`: #f3f4f6 (cinza suave para áreas de destaque)
- `surface-elevated`: #ffffff (cards com shadow-lg)

#### Ações
- `action-primary`: #2563eb (azul vibrante da marca)
- `action-primary-hover`: #1d4ed8 (azul mais escuro)
- `action-primary-active`: #1e40af (azul pressed)
- `action-secondary`: #e5e7eb (cinza claro)
- `action-strong`: #0f172a (azul escuro quase preto)
- `action-strong-hover`: #1e293b (azul escuro hover)

#### Bordas
- `border-default`: #e5e7eb (cinza claro)
- `border-subtle`: #f3f4f6 (quase invisível)
- `border-focus`: #2563eb (azul da marca)

#### Status
- `status-success`: #10b981 (verde)
- `status-warning`: #f59e0b (laranja)
- `status-error`: #ef4444 (vermelho)

---

### DARK MODE

#### Texto
- `text-primary`: #f9fafb (quase branco)
- `text-secondary`: #d1d5db (cinza claro)
- `text-muted`: #6b7280 (cinza médio)
- `text-on-dark`: #ffffff (branco puro)
- `text-on-brand`: #ffffff (branco sobre azul)

#### Superfícies
- `surface-page`: #0f172a (azul escuro profundo)
- `surface-section`: #1e293b (azul escuro alternado)
- `surface-card`: #1e293b (cards sobre fundo escuro)
- `surface-subtle`: #334155 (cinza-azul para destaque)
- `surface-elevated`: #1e293b (com shadow mais suave)

#### Ações
- `action-primary`: #2563eb (azul mantém identidade)
- `action-primary-hover`: #60a5fa (azul mais claro no dark)
- `action-primary-active`: #1d4ed8 (azul pressed)
- `action-secondary`: #334155 (cinza-azul)
- `action-strong`: #2563eb (no dark, o azul vibrante vira o strong CTA)
- `action-strong-hover`: #60a5fa (azul hover)

#### Bordas
- `border-default`: #334155 (cinza-azul)
- `border-subtle`: #1e293b (quase invisível)
- `border-focus`: #2563eb (azul mantém)

#### Status
- `status-success`: #34d399 (verde mais claro)
- `status-warning`: #fbbf24 (laranja mais claro)
- `status-error`: #f87171 (vermelho mais claro)

---

## 🧩 COMPONENTES

### BOTÕES

#### Primary Button
```
Background: action-primary
Text: text-on-brand
Font: text-base, font-semibold
Padding: space-3 vertical, space-6 horizontal
Border Radius: radius-md
Shadow: shadow-button-primary

Estados:
- Hover: bg action-primary-hover, shadow-md
- Active: bg action-primary-active, transform scale(0.98)
- Focus: border-focus ring 2px offset 2px
- Disabled: opacity 0.5, cursor not-allowed
```

#### Secondary Button
```
Background: surface-card
Text: text-primary
Border: 1px solid border-default
Font: text-base, font-semibold
Padding: space-3 vertical, space-6 horizontal
Border Radius: radius-md
Shadow: none

Estados:
- Hover: bg surface-subtle, border-default mais escuro
- Active: bg action-secondary
- Focus: border-focus ring
- Disabled: opacity 0.5
```

#### Strong CTA Button
```
Background: action-strong
Text: text-on-dark
Font: text-lg, font-bold
Padding: space-4 vertical, space-8 horizontal
Border Radius: radius-md
Shadow: shadow-lg

Estados:
- Hover: bg action-strong-hover, shadow-xl, transform translateY(-2px)
- Active: transform translateY(0)
- Focus: border-focus ring branco
- Disabled: opacity 0.4
```

---

### CARDS

#### Card Padrão (Curso/Conteúdo)
```
Background: surface-card
Border Radius: radius-xl
Shadow: shadow-card
Padding: space-6
Border: 1px solid border-subtle

Estrutura:
- Imagem/thumbnail: radius-lg no topo
- Título: text-xl, font-semibold, text-primary
- Descrição: text-sm, text-secondary
- Footer: badges/metadata com gap space-2

Estados:
- Hover: shadow-card-hover, transform translateY(-4px), transition 200ms
- Focus: border-focus ring
```

#### Card Hero/Destaque
```
Background: surface-elevated
Border Radius: radius-2xl
Shadow: shadow-lg
Padding: space-12

Usado em: seções de destaque, featured courses
```

---

### INPUTS

#### Text Input
```
Background: surface-card
Border: 1px solid border-default
Border Radius: radius-sm
Padding: space-3 vertical, space-4 horizontal
Font: text-base, text-primary

Placeholder: text-muted

Estados:
- Hover: border-default mais escuro
- Focus: border-focus ring 2px, shadow-sm
- Error: border status-error, text status-error
- Disabled: bg surface-subtle, opacity 0.6
```

#### Textarea
```
Mesmas specs do Text Input
Min-height: space-20
Resize: vertical
```

#### Select/Dropdown
```
Background: surface-card
Border: 1px solid border-default
Border Radius: radius-sm
Padding: space-3 vertical, space-4 horizontal
Ícone dropdown: text-muted

Estados: mesmos do Text Input
```

---

### BADGES

#### Badge Status
```
Font: text-xs, font-medium
Padding: space-1 vertical, space-2 horizontal
Border Radius: radius-full

Variações:
- Success: bg status-success/10, text status-success
- Warning: bg status-warning/10, text status-warning
- Error: bg status-error/10, text status-error
- Neutral: bg surface-subtle, text text-secondary
```

#### Badge Tag
```
Font: text-xs, font-medium
Padding: space-1 vertical, space-3 horizontal
Border Radius: radius-sm
Background: surface-subtle
Text: text-secondary
Border: 1px solid border-subtle
```

---

### NAVEGAÇÃO

#### Header/Navbar
```
Background: surface-page com backdrop-blur (se sticky)
Border-bottom: 1px solid border-subtle
Padding: space-4 vertical
Shadow: shadow-sm (quando scroll > 0)

Links:
- Font: text-base, font-medium
- Text: text-secondary
- Hover: text-primary
- Active: text-primary com underline 2px action-primary
```

#### Footer
```
Background: surface-section (light) / surface-card (dark)
Padding: space-16 vertical, space-8 horizontal
Border-top: 1px solid border-subtle

Links: text-sm, text-muted
Hover: text-secondary
```

---

### HERO SECTION

```
Background: gradient from action-strong to action-strong (mais escuro)
Padding: space-20 vertical
Text: text-on-dark

Título: text-5xl, font-bold
Subtítulo: text-xl, text-on-dark com opacity 0.9
CTA: Strong Button

Opcional: imagem/ilustração à direita
```

---

### GRID DE CURSOS/CONTEÚDOS

```
Display: grid
Gap: space-6
Columns: 
- Mobile: 1
- Tablet: 2
- Desktop: 3

Cada item: Card Padrão
```

---

## 📐 LAYOUT E ESPAÇAMENTO

### Container Principal
```
Max-width: 1280px
Padding horizontal: space-4 (mobile), space-8 (desktop)
Margin: 0 auto
```

### Seções
```
Padding vertical: space-16
Gap entre elementos: space-8
```

### Espaçamento Interno (Cards/Componentes)
```
Padding: space-6 (padrão)
Gap entre elementos: space-4
Gap entre texto: space-2
```

---

## 🎯 HIERARQUIA TIPOGRÁFICA

### Páginas
```
H1 (Hero): text-5xl, font-bold, text-primary
H2 (Seção): text-4xl, font-bold, text-primary
H3 (Subseção): text-3xl, font-semibold, text-primary
H4 (Card/Título): text-2xl, font-semibold, text-primary
```

### Corpo de Texto
```
Parágrafo: text-base, font-normal, text-secondary
Destaque: text-lg, font-medium, text-primary
Caption: text-sm, font-normal, text-muted
Label: text-sm, font-medium, text-primary
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Para cada componente interativo:

- [ ] Estado Default definido
- [ ] Estado Hover com feedback visual
- [ ] Estado Active/Pressed
- [ ] Estado Focus com ring visível
- [ ] Estado Disabled com opacity + cursor
- [ ] Transitions suaves (200-300ms)
- [ ] Apenas tokens semânticos utilizados

### Acessibilidade:

- [ ] Contraste mínimo 4.5:1 para texto
- [ ] Focus rings sempre visíveis
- [ ] Estados hover não dependem apenas de cor
- [ ] Touch targets mínimo 44x44px (mobile)

---

## 🚀 EXEMPLOS DE USO

### Call-to-Action Principal
```
Botão: Strong CTA
Texto: "Comece Agora Grátis"
Posição: Hero section, acima da dobra
Shadow: shadow-lg
```

### Card de Curso
```
Background: surface-card
Radius: radius-xl
Shadow: shadow-card → shadow-card-hover (hover)
Padding: space-6
Gap interno: space-4

Thumbnail: radius-lg
Título: text-xl, font-semibold
Descrição: text-sm, text-secondary (2 linhas max)
Badge: "Novo" em status-success
Botão: Secondary "Ver Detalhes"
```

### Formulário de Contato
```
Inputs: Text Input padrão
Gap entre campos: space-4
Label: text-sm, font-medium, text-primary
Botão submit: Primary Button full-width
```

---

## 📱 RESPONSIVIDADE

### Breakpoints (referência)
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Ajustes Mobile-First
```
Typography: reduzir 1 tamanho (text-5xl → text-4xl)
Spacing: reduzir space-16 → space-12
Grid: sempre 1 coluna em mobile
Padding lateral: sempre space-4 mínimo
```

---

## 📊 TABELA DE TOKENS - REFERÊNCIA RÁPIDA

### Espaçamento
| Token | Valor | Uso Comum |
|-------|-------|-----------|
| space-1 | 4px | Ícones inline, gaps mínimos |
| space-2 | 8px | Gaps pequenos, badges |
| space-3 | 12px | Padding de botões, gaps médios |
| space-4 | 16px | Padding padrão, gaps entre elementos |
| space-6 | 24px | Padding de cards |
| space-8 | 32px | Gaps entre seções |
| space-12 | 48px | Padding de seções |
| space-16 | 64px | Padding vertical de seções grandes |
| space-20 | 80px | Seções hero |

### Tipografia
| Token | Valor | Uso Comum |
|-------|-------|-----------|
| text-xs | 12px | Badges, labels pequenos |
| text-sm | 14px | Captions, texto secundário |
| text-base | 16px | Corpo de texto |
| text-lg | 18px | Texto destacado |
| text-xl | 20px | Subtítulos |
| text-2xl | 24px | Títulos de cards |
| text-3xl | 30px | Títulos de seção |
| text-4xl | 36px | Títulos principais |
| text-5xl | 48px | Headlines hero |

### Border Radius
| Token | Valor | Uso Comum |
|-------|-------|-----------|
| radius-sm | 6px | Inputs, badges |
| radius-md | 8px | Botões |
| radius-lg | 12px | Cards pequenos, thumbnails |
| radius-xl | 16px | Cards grandes |
| radius-2xl | 24px | Cards hero |
| radius-full | 9999px | Avatares, pills |

### Sombras
| Token | Uso Comum |
|-------|-----------|
| shadow-sm | Inputs, hover states sutis |
| shadow-md | Cards, dropdowns |
| shadow-lg | Modais, popovers, CTAs |
| shadow-card | Cards em estado normal |
| shadow-card-hover | Cards em hover |
| shadow-button-primary | Botões primários |

---

**Versão:** 1.0  
**Última atualização:** Janeiro 2026  
**Plataforma:** Eco Wawe Solutions — Educational Tech Platform

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### CSS Variables (exemplo)
```css
:root {
  /* Cores Light Mode */
  --text-primary: #1a1a1a;
  --text-secondary: #525252;
  --action-primary: #2563eb;
  --surface-page: #ffffff;
  
  /* Espaçamento */
  --space-1: 4px;
  --space-2: 8px;
  --space-4: 16px;
  
  /* Typography */
  --text-base: 16px;
  --font-semibold: 600;
  
  /* Border Radius */
  --radius-md: 8px;
  --radius-xl: 16px;
}

[data-theme="dark"] {
  --text-primary: #f9fafb;
  --surface-page: #0f172a;
  /* ... demais tokens dark mode */
}
```

### Tailwind Config (exemplo)
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'text-primary': 'var(--text-primary)',
        'action-primary': 'var(--action-primary)',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
      },
    },
  },
}
```

---

## 🎓 BOAS PRÁTICAS

1. **Sempre use tokens semânticos**, nunca valores hardcoded
2. **Mobile-first**: comece sempre pelo mobile
3. **Consistência**: mesmo componente = mesmos tokens
4. **Acessibilidade**: todos os estados interativos devem ser óbvios
5. **Performance**: transitions apenas em propriedades baratas (transform, opacity)
6. **Teste em ambos os modos**: light e dark mode
7. **Documente exceções**: se precisar criar um novo token, documente o porquê