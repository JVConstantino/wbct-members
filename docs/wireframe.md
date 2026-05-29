# 🧩 Wireframe Responsivo – Sistema de Área de Membros

Este documento reúne **todos os layouts (desktop e mobile)** do sistema, considerando:

* 🖥 Desktop com **sidebar lateral**
* 📱 Mobile com **barra inferior (bottom navigation)**

Pode ser usado como **base única** para Figma, desenvolvimento frontend ou documentação de produto.

---

## 🔐 1. Login

### Desktop

```
+--------------------------------------+
|              LOGO                    |
|--------------------------------------|
|  Email                               |
|  [__________________________]        |
|                                      |
|  Senha                               |
|  [__________________________]        |
|                                      |
|  ( Entrar )                          |
+--------------------------------------+
```

### Mobile

```
+--------------------------+
|         LOGO             |
+--------------------------+
| Email                    |
| [___________]            |
| Senha                    |
| [___________]            |
| ( Entrar )               |
+--------------------------+
```

---

## 🧑‍💼 2. Admin – Estrutura Geral

### Desktop (Sidebar)

```
+----------------------------------------------------+
| Sidebar            | Conteúdo                     |
|--------------------|-------------------------------|
| 🏠 Dashboard       |                               |
| 👥 Membros         |                               |
| 📝 Postagens       |                               |
| 📅 Eventos         |                               |
| 🎥 Webinars        |                               |
| 🚪 Sair            |                               |
+----------------------------------------------------+
```

### Mobile (Bottom Bar)

```
+------------------------------+
| Conteúdo                     |
+------------------------------+
| 🏠 | 👥 | 📝 | 📅 | 🎥 |
```

---

## 👥 3. Admin – Gerenciar Membros

### Desktop

```
Sidebar | Lista de Membros
---------------------------------------------
| Buscar [________]                          |
|-------------------------------------------|
| Nome | Email | Status | Ações              |
| João | xxx   | Ativo  | Ver | Bloquear     |
```

### Mobile

```
Membros
------------------------
| 🔍 Buscar             |
------------------------
| João (Ativo)          |
| [ Ver ] [ Bloquear ]  |
------------------------
```

---

## 📝 4. Admin – Aprovar Postagens

### Desktop

```
Sidebar | Postagens Pendentes
---------------------------------------------
| Título | Autor | Data | Ações               |
| Post X | João  | 10/01| Ver | Aprovar        |
---------------------------------------------
| Preview da Postagem                         |
```

### Mobile

```
Postagens Pendentes
------------------------
| Post X - João          |
| [ Ver ] [ Aprovar ]    |
------------------------
```

---

## 📅 5. Admin – Eventos

### Desktop

```
Sidebar | Calendário
---------------------------------------------
| [ Mês / Semana ]                          |
| Evento Azul | Evento Verde                |
| ( + Criar Evento )                        |
```

### Mobile

```
Eventos
------------------------
| 📅 Janeiro             |
| Evento Azul            |
| ( + Criar )            |
------------------------
```

---

## 📰 6. Admin – Criar Postagem

### Desktop

```
Sidebar | Editor
---------------------------------------------
| Título                                   |
| [_____________]                          |
| Imagem Destaque                          |
| [ Upload ]                               |
| Editor Rich Text                         |
| ( Publicar )                             |
```

### Mobile

```
Nova Postagem
------------------------
| Título                 |
| [__________]           |
| Upload Imagem          |
| Editor                 |
| ( Publicar )           |
```

---

## 🎥 7. Admin – Webinars

### Desktop

```
Sidebar | Webinars
---------------------------------------------
| Aula | Status | Ações                     |
| Aula 1 | Ativa | Editar | Desativar       |
```

### Mobile

```
Webinars
------------------------
| Aula 1                 |
| [ Editar ]             |
------------------------
```

---

## 👤 8. Membro – Estrutura Geral

### Desktop (Sidebar)

```
+----------------------------------------------------+
| Sidebar            | Conteúdo                     |
|--------------------|-------------------------------|
| 🏠 Home            |                               |
| 📰 Blog            |                               |
| ✍️ Criar           |                               |
| 📅 Eventos         |                               |
| 🎥 Webinars        |                               |
| 👤 Perfil          |                               |
+----------------------------------------------------+
```

### Mobile (Bottom Bar)

```
+------------------------------+
| Conteúdo                     |
+------------------------------+
| 🏠 | 📰 | ➕ | 📅 | 👤 |
```

---

## 🏠 9. Home do Membro

### Desktop

```
Sidebar | Home
---------------------------------------------
| Eventos Seguidos                           |
---------------------------------------------
| Feed de Postagens                          |
```

### Mobile

```
Home
------------------------
| Próximos Eventos     |
------------------------
| Postagens            |
```

---

## 📰 10. Blog / Postagens

### Desktop

```
Sidebar | Blog
---------------------------------------------
| 🔍 Buscar | Data | Autor                   |
---------------------------------------------
| [Imagem] Título                           |
```

### Mobile

```
Blog
------------------------
| 🔍 Buscar             |
| [Imagem] Título       |
```

---

## 📄 11. Postagem Individual

### Desktop

```
Sidebar | Postagem
---------------------------------------------
| Título                                 |
| Imagem                                 |
| Conteúdo                               |
| Comentários                            |
```

### Mobile

```
Postagem
------------------------
| Título                |
| Imagem                |
| Conteúdo              |
| 💬 Comentários        |
```

---

## ✍️ 12. Criar Postagem (Membro)

### Desktop

```
Sidebar | Criar Post
---------------------------------------------
| Título                                 |
| Imagem                                 |
| Editor                                 |
| ( Enviar )                             |
```

### Mobile

```
Criar Post
------------------------
| Título                |
| Imagem                |
| Editor                |
| ( Enviar )            |
```

---

## 📅 13. Eventos (Membro)

### Desktop

```
Sidebar | Calendário
---------------------------------------------
| [ Calendário ]                          |
| ( Seguir Evento )                       |
```

### Mobile

```
Eventos
------------------------
| 📅 Calendário         |
| ( Seguir )            |
```

---

## 👤 14. Perfil do Membro

### Desktop

```
Sidebar | Perfil
---------------------------------------------
| Foto                                   |
| Nome                                   |
| Bio                                    |
| ( Salvar )                             |
```

### Mobile

```
Perfil
------------------------
| Foto                 |
| Nome                 |
| Bio                  |
| ( Salvar )           |
```

---

## 🎥 15. Webinars (Membro)

### Desktop

```
Sidebar | Webinars
---------------------------------------------
| Lista de Aulas | Player YouTube           |
```

### Mobile

```
Webinar
------------------------
| 🎥 Vídeo              |
| Título                |
| Descrição             |
```

---

✅ **Documento final unificado** para design, UX e desenvolvimento.
