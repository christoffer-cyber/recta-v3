# 🔐 Recta Authentication Setup - INSTRUKTIONER

## ✅ VAD SOM ÄR KLART

Alla 4 prompts är implementerade och byggd är successful! 🎉

### ✅ Prompt 1 - NextAuth (100%)
- NextAuth v5 konfigurerad
- Login & signup pages
- Middleware för protected routes
- Session management
- Password hashing med bcrypt

### ✅ Prompt 2 - Database (100%)
- Full database schema
- Conversations, messages, canvas_states, reports tables
- Auto-save funktionalitet
- API endpoints för CRUD

### ✅ Prompt 3 - Dashboard (100%)
- Complete dashboard page
- List/create/delete conversations
- Filter tabs
- Loading skeletons
- Keyboard shortcuts (Cmd+N)

### ✅ Prompt 4 - Polish (100%)
- Optimistic updates
- Error handling
- Saving indicators
- SEO metadata
- Professional UX

---

## 🚀 FÖR ATT STARTA

### STEG 1: Setup Vercel Postgres

**1.1 Skapa Database i Vercel:**
```bash
# Om du inte redan har projektet på Vercel:
vercel
# Följ instruktionerna för att länka projektet

# Om projektet redan är länkat:
# Gå till https://vercel.com/dashboard
# Välj ditt projekt
# Klicka "Storage" → "Create Database" → "Postgres"
# Välj region (närmast dig)
# Klicka "Create"
```

**1.2 Hämta Environment Variables:**
```bash
vercel env pull .env.local
```

Detta laddar ner:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`  
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- osv.

**1.3 Lägg till AUTH_SECRET:**
```bash
# Generera secret:
openssl rand -base64 32

# Kopiera output och lägg till i .env.local:
# AUTH_SECRET=din-genererade-secret-här
```

Din `.env.local` ska nu innehålla:
```env
# Vercel Postgres (auto-genererade)
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
# ... (flera POSTGRES_ variabler)

# NextAuth (lägg till manuellt)
AUTH_SECRET=your-generated-secret-here

# Anthropic (du har redan)
ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

### STEG 2: Initiera Database

```bash
npm run init-db
```

**Förväntat output:**
```
✅ Database initialized successfully
```

Detta skapar:
- `users` table
- `conversations` table
- `messages` table
- `canvas_states` table
- `reports` table
- Alla indexes

---

### STEG 3: Starta Dev Server

```bash
npm run dev
```

---

### STEG 4: Testa Authentication Flow

**4.1 Skapa konto:**
1. Gå till http://localhost:3002/signup
2. Fyll i email och lösenord
3. Klicka "Skapa konto"
4. Ska redirecta till `/dashboard`

**4.2 Verifiera i database:**
```bash
# I Vercel Dashboard:
# Storage → Postgres → Data → users table
# Du ska se din användare!
```

**4.3 Testa logout:**
1. Klicka "Logga ut" i dashboard
2. Ska redirecta till `/login`

**4.4 Logga in igen:**
1. Gå till http://localhost:3002/login
2. Logga in med ditt konto
3. Ska redirecta till `/dashboard`

---

### STEG 5: Testa Dashboard & Conversations

**5.1 Skapa conversation:**
1. På dashboard, klicka "Starta Ny Analys"
2. Ska redirecta till `/?conversation=1`
3. Ska se chat interface

**5.2 Chatta och auto-save:**
1. Skriv meddelanden
2. Efter 2 sekunder: Se "Sparar..." indikator
3. Sedan: "Sparat HH:MM:SS"

**5.3 Verifiera i database:**
```bash
# I Vercel Dashboard:
# Storage → Postgres → Data
# Kolla:
# - conversations table → Din conversation
# - messages table → Dina meddelanden
# - canvas_states table → Canvas data
```

**5.4 Återuppta conversation:**
1. Klicka "Mina Sidor" (i header)
2. Ska se din conversation i listan
3. Klicka "Fortsätt"
4. Alla meddelanden och canvas state ska vara restored! ✅

**5.5 Testa keyboard shortcut:**
1. På dashboard
2. Tryck Cmd+N (Mac) eller Ctrl+N (Windows)
3. Ska skapa ny conversation

**5.6 Testa delete:**
1. Klicka trash icon på en conversation
2. Bekräfta
3. Ska försvinna från listan
4. Kolla database → borttagen ✅

---

## 🎯 SUCCESS CRITERIA

Efter setup, verifiera:

**Authentication:**
- ✅ Kan signup
- ✅ Kan login
- ✅ Kan logout
- ✅ Session persistent vid refresh
- ✅ Protected routes redirectar till `/login`
- ✅ Middleware fungerar

**Database:**
- ✅ Alla tabeller skapade
- ✅ User sparad i `users`
- ✅ Conversations i `conversations`
- ✅ Messages i `messages`
- ✅ Canvas i `canvas_states`

**Dashboard:**
- ✅ Listar conversations
- ✅ Filter tabs fungerar
- ✅ Delete fungerar
- ✅ Cmd+N skapar ny
- ✅ Empty states visas

**Auto-save:**
- ✅ "Sparar..." visas
- ✅ Sparar efter 2 sek
- ✅ "Sparat HH:MM:SS" visas
- ✅ Kan resume conversation
- ✅ Alla meddelanden restored
- ✅ Canvas state restored

**Polish:**
- ✅ Loading skeletons
- ✅ Smooth animations
- ✅ Professional UX
- ✅ Keyboard shortcuts
- ✅ Metadata/SEO

---

## 📂 FILER SOM SKAPADES

```
app/
├── api/
│   ├── auth/
│   │   ├── signup/route.ts ✅
│   │   └── [...nextauth]/route.ts ✅
│   └── conversations/
│       ├── route.ts ✅
│       └── [id]/
│           ├── route.ts ✅
│           └── save/route.ts ✅
├── dashboard/page.tsx ✅
├── login/page.tsx ✅
├── signup/page.tsx ✅
└── page.tsx (uppdaterad med auto-save) ✅

components/
├── Layout.tsx (uppdaterad med "Mina Sidor") ✅
└── SessionProvider.tsx ✅

lib/
└── db/
    ├── schema.sql ✅
    ├── users.ts ✅
    └── conversations.ts ✅

scripts/
└── init-db.ts ✅

auth.ts ✅
middleware.ts ✅
```

---

## 🐛 TROUBLESHOOTING

### "Cannot connect to database"
```bash
vercel env pull .env.local
npm run dev
```

### "AUTH_SECRET not defined"
Lägg till i `.env.local`:
```env
AUTH_SECRET=$(openssl rand -base64 32)
```

### "Table does not exist"
```bash
npm run init-db
```

### "Unauthorized" vid API calls
Logga ut och in igen:
```bash
# Klicka "Logga ut" → "Logga in"
```

---

## 🎊 KLART!

Du har nu ett komplett auth + persistence system! 

**Nästa steg:**
1. ✅ Testa grundligt
2. Deploy till Vercel
3. Börja bygga resten av produkten

**Lycka till! 🚀**

