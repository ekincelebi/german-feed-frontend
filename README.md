# German Language Learning Platform - Frontend

A Next.js-based frontend application for learning German by reading authentic news articles tailored to your CEFR level (A1-C2).

## Features

- **Level-Based Learning**: Browse articles by CEFR levels (A1 to C2)
- **Interactive Vocabulary**: Click highlighted words to see instant translations with grammar details
- **Topic Filtering**: Filter articles by topics like politics, economy, sports, etc.
- **Grammar Insights**: View grammar patterns used in each article
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Clean Reading Experience**: Articles are optimized for language learners

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Data Fetching**: Server Components

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account with the backend database set up

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd german-feed-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   Get these values from your Supabase project dashboard:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to Settings → API
   - Copy the Project URL and anon/public key

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
german-feed-frontend/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with header/footer
│   ├── page.tsx                 # Homepage (level selection)
│   ├── globals.css              # Global styles and Tailwind
│   └── articles/
│       └── [level]/
│           ├── page.tsx         # Article list page
│           └── [id]/
│               └── page.tsx     # Article detail/reader page
├── components/                   # React components
│   ├── LevelSelector.tsx        # CEFR level selection grid
│   ├── ArticleCard.tsx          # Article preview card
│   ├── ArticleReader.tsx        # Main article reading component
│   ├── VocabularyPopup.tsx      # Vocabulary translation popup
│   ├── GrammarSidebar.tsx       # Grammar patterns sidebar
│   └── TopicFilter.tsx          # Topic filter dropdown
├── lib/                          # Utilities and configurations
│   ├── supabase.ts              # Supabase client setup
│   └── types.ts                 # TypeScript type definitions
├── docs/                         # Documentation (database schema, specs)
├── .env.local                    # Environment variables (not in git)
├── .env.example                  # Environment variables template
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
```

## Database Views

The application uses pre-built Supabase views for optimal performance:

- **`article_list_view`**: Lightweight data for browsing articles
- **`article_detail_view`**: Complete article data with vocabulary and grammar
- **`article_statistics`**: Aggregate statistics for each CEFR level

## Key Features Explained

### 1. Vocabulary Highlighting

When reading an article, important vocabulary words are highlighted. Click any highlighted word to see:
- The German word with article (der/die/das)
- English translation
- Plural form (if applicable)

### 2. Grammar Patterns

Each article includes a sidebar showing the grammar patterns used, such as:
- Verb tenses (Present perfect, Past tense, etc.)
- Sentence structures (Subordinate clauses, Passive voice, etc.)
- Case usage (Genitive, Dative, etc.)

### 3. Topic Filtering

Filter articles by topics like:
- Politics
- Economy
- Sports
- Technology
- Culture
- And more...

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

### Other Platforms

This is a standard Next.js app and can be deployed to:
- Netlify
- AWS Amplify
- Cloudflare Pages
- Any platform supporting Node.js

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## Future Enhancements

Potential features for future versions:

- [ ] User authentication (Supabase Auth)
- [ ] Bookmark articles
- [ ] Track reading progress
- [ ] Search functionality
- [ ] Audio pronunciation
- [ ] Flashcard generation from vocabulary
- [ ] Spaced repetition system
- [ ] User level assessment
- [ ] Reading statistics and progress tracking

## Contributing

This is an MVP (Minimum Viable Product). Contributions are welcome!

## License

MIT

## Related Documentation

- [Frontend Specification](./docs/FRONTEND_SPECIFICATION.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [API Routes Reference](./docs/API_ROUTES_REFERENCE.md)

## Support

For issues or questions, please open an issue on GitHub.

---

Built with Next.js, TypeScript, Tailwind CSS, and Supabase.
