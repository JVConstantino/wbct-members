# Migracao MySQL -> Appwrite (Staging)

Este projeto agora usa migracao direta para Appwrite, sem Supabase.

## 1) Variaveis de ambiente

No `.env` (staging), configure:

```env
DATABASE_URL="mysql://..."

APPWRITE_ENDPOINT="https://database.wbctmember.org/v1"
APPWRITE_PROJECT_ID="6a18d35f002ce6e1c766"
APPWRITE_API_KEY="coloque_sua_chave_staging"
APPWRITE_DATABASE_ID="staging"
USE_APPWRITE_DB="1"

# Opcional: tamanho do lote
MIGRATION_BATCH_SIZE="300"

# Opcional: mapear tabela -> collection
APPWRITE_COLLECTIONS_JSON='{"User":"users","Post":"posts","Comment":"comments","Event":"events","Webinar":"webinars","Course":"courses","Lesson":"lessons","LessonAttachment":"lesson_attachments","LessonProgress":"lesson_progress","Message":"messages","Notification":"notifications","UserActivity":"user_activities","Follows":"follows","_UserEvents":"user_events"}'
```

## 2) Criar collections no Appwrite

Crie no database de staging as collections usadas no map:

- `users`
- `posts`
- `comments`
- `events`
- `webinars`
- `courses`
- `lessons`
- `lesson_attachments`
- `lesson_progress`
- `messages`
- `notifications`
- `user_activities`
- `follows`
- `user_events`

Observacoes:

- O script preserva os mesmos IDs do MySQL (`documentId = id`).
- Tabelas sem `id` (`Follows`, `_UserEvents`) usam ID composto (`followerId_followingId`, `A_B`).

## 3) Executar migracao

```bash
npm run migrate:appwrite:staging
```

## 4) Validacao minima

Depois da migracao:

1. Compare contagem por tabela x collection.
2. Valide login admin e membro.
3. Valide dashboard admin, feed de posts, mensagens e notificacoes.
4. Verifique se nao houve erro de relacionamento (autor/post/comentario, follows e aulas).

## 5) Seguranca

- Nao use chave de producao em staging.
- Rotacione a chave se ela tiver sido exposta em canais de chat.
