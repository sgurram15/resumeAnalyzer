# AI Resume Screener

An intelligent, AI-powered resume screening system that evaluates candidates using a sophisticated multi-agent evaluation framework. The system breaks down candidate assessment into four specialized dimensions—Skills, Experience, Education, and Culture—providing transparent, explainable scoring with configurable weights.

## 🎯 Features

- **Multi-Agent Evaluation System**: Four specialized AI agents independently evaluate candidates across different dimensions
- **Transparent Scoring**: See exactly how each agent contributes to the overall score (40% Skills, 35% Experience, 15% Education, 10% Culture)
- **Configurable Weights**: Adjust scoring weights based on your hiring priorities
- **Job Description Input**: Upload job descriptions via text, PDF, DOCX, or TXT formats
- **Batch Resume Processing**: Upload multiple resumes (PDF or DOCX) with drag-and-drop support
- **Detailed Candidate Analysis**: View strengths, weaknesses, relevant experience, and key highlights for each candidate
- **Ranked Results**: Candidates automatically ranked by overall match score
- **Elegant UI**: Professional, responsive design for seamless user experience

## 🚀 Quick Start

### Prerequisites

- Node.js 22.13.0 or higher
- pnpm 10.4.1 or higher
- MySQL/TiDB database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sgurram15/resumeAnalyzer.git
   cd resumeAnalyzer
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the project root with the following variables:
   ```
   DATABASE_URL=mysql://user:password@localhost:3306/resume_screener
   JWT_SECRET=your-secret-key-here
   VITE_APP_ID=your-manus-app-id
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://manus.im
   OWNER_OPEN_ID=your-owner-id
   OWNER_NAME=Your Name
   BUILT_IN_FORGE_API_URL=https://api.manus.im
   BUILT_IN_FORGE_API_KEY=your-api-key
   VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
   VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
   ```

4. **Set up the database**
   ```bash
   pnpm db:push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

## 📖 Usage Guide

### Step 1: Provide Job Description

1. Navigate to the home page
2. Enter the **Job Title** (e.g., "Senior Software Engineer")
3. Provide the **Job Description** with:
   - Required skills and technologies
   - Years of experience needed
   - Education requirements
   - Responsibilities and qualifications
4. Alternatively, upload a job description file (PDF, DOCX, or TXT)

### Step 2: Upload Resumes

1. Scroll to the "Upload Resumes" section
2. Drag and drop resume files or click to browse
3. Supported formats: PDF, DOCX
4. Upload multiple resumes at once
5. Files are validated for format and size

### Step 3: Start Screening

1. Click the **"Start Screening"** button
2. The system will:
   - Extract text from each resume
   - Run all 4 evaluation agents in parallel
   - Calculate weighted scores
   - Rank candidates automatically
3. Wait for screening to complete (typically 1-2 minutes for multiple resumes)

### Step 4: Review Results

The results dashboard displays:

- **Ranked Candidates**: Listed from highest to lowest match score
- **Color-Coded Scores**: 
  - 🟢 Green (80+): Excellent match
  - 🟡 Yellow (60-79): Good match
  - 🔴 Red (0-59): Needs review

### Step 5: Analyze Individual Candidates

Click on any candidate to view detailed analysis:

#### Score Breakdown Tab
- **Skills Evaluation** (40% weight)
  - Matched skills
  - Missing skills
  - Partial matches
- **Experience Evaluation** (35% weight)
  - Years of experience
  - Seniority level
  - Leadership experience
  - Relevant roles
- **Education Evaluation** (15% weight)
  - Degree match
  - Relevant certifications
- **Culture Fit Evaluation** (10% weight)
  - Soft skills demonstrated
  - Cultural indicators
  - Team collaboration signals

#### Details Tab
- Key highlights from resume
- Identified strengths
- Potential weaknesses
- Relevant work experience

## 🏗️ Architecture

### Multi-Agent Scoring System

The system uses four specialized agents that work independently:

```
┌─────────────────────────────────────────────────────┐
│              Resume + Job Description               │
└─────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌────────┐      ┌────────┐      ┌────────┐
    │ Skills │      │ Exper. │      │ Educat.│
    │ Agent  │      │ Agent  │      │ Agent  │
    │ (40%)  │      │ (35%)  │      │ (15%)  │
    └────────┘      └────────┘      └────────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                    ┌────────┐
                    │ Culture│
                    │ Agent  │
                    │ (10%)  │
                    └────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
    ┌─────────────┐              ┌──────────────┐
    │  Aggregate  │─────────────▶│ Overall Score│
    │  Scores     │              │   (0-100)    │
    └─────────────┘              └──────────────┘
```

### Tech Stack

**Frontend:**
- React 19
- TypeScript
- Tailwind CSS 4
- tRPC for type-safe API calls
- Shadcn/UI components

**Backend:**
- Express.js
- tRPC 11
- Drizzle ORM
- MySQL/TiDB database
- OpenAI LLM integration

**Testing:**
- Vitest
- 12 comprehensive tests

## 🧪 Testing

Run all tests:
```bash
pnpm test
```

Run tests in watch mode:
```bash
pnpm test:watch
```

Run specific test file:
```bash
pnpm test server/agents/scoreAggregator.test.ts
```

## 📊 Database Schema

### Key Tables

- **screenings**: Stores screening sessions with job descriptions
- **resumes**: Uploaded resume files and extracted text
- **candidateScores**: Multi-agent evaluation results with detailed breakdowns
- **scoringWeights**: Configurable weights for each screening
- **users**: User authentication and profiles

## 🔧 Configuration

### Adjusting Scoring Weights

To customize scoring weights for different roles:

1. Go to screening settings
2. Adjust weights for:
   - Skills (default: 40%)
   - Experience (default: 35%)
   - Education (default: 15%)
   - Culture (default: 10%)
3. Weights automatically normalize to 100%

### Example Weight Configurations

**For Senior/Leadership Roles:**
- Skills: 30%
- Experience: 45%
- Education: 10%
- Culture: 15%

**For Junior/Entry-Level Roles:**
- Skills: 35%
- Experience: 20%
- Education: 25%
- Culture: 20%

**For Technical Roles:**
- Skills: 50%
- Experience: 30%
- Education: 15%
- Culture: 5%

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Verify database connection
pnpm db:push

# Check DATABASE_URL format
echo $DATABASE_URL
```

### LLM API Errors
- Verify `BUILT_IN_FORGE_API_KEY` is set correctly
- Check API rate limits
- Ensure network connectivity to API endpoint

### Resume Upload Failures
- Verify file format (PDF or DOCX)
- Check file size (max 10MB recommended)
- Ensure text is extractable from PDF

### Slow Screening Performance
- LLM calls typically take 5-10 seconds per resume
- Multiple resumes are processed sequentially
- Consider batch processing for large volumes

## 📝 Development

### Project Structure

```
ai-resume-screener/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities
│   │   └── App.tsx        # Main app
│   └── public/            # Static assets
├── server/                 # Express backend
│   ├── agents/            # Multi-agent scoring
│   │   ├── skillsAgent.ts
│   │   ├── experienceAgent.ts
│   │   ├── educationAgent.ts
│   │   ├── cultureAgent.ts
│   │   └── scoreAggregator.ts
│   ├── routers.ts         # tRPC procedures
│   ├── db.ts              # Database queries
│   └── screening.ts       # Screening logic
├── drizzle/               # Database schema
├── shared/                # Shared types
└── package.json
```

### Adding New Features

1. **Update Database Schema** (if needed)
   ```bash
   # Edit drizzle/schema.ts
   pnpm db:push
   ```

2. **Add Backend Logic**
   - Create new procedures in `server/routers.ts`
   - Add database helpers in `server/db.ts`

3. **Add Frontend UI**
   - Create components in `client/src/components/`
   - Add pages in `client/src/pages/`
   - Wire up tRPC calls

4. **Write Tests**
   ```bash
   # Create test file
   touch server/feature.test.ts
   pnpm test
   ```

## 🔐 Security

- All API calls use tRPC with type safety
- Database credentials stored in environment variables
- Authentication via Manus OAuth
- Protected procedures require authentication
- Resume data encrypted in transit (HTTPS)

## 📈 Performance

- Multi-agent evaluation runs in parallel
- Database queries optimized with indexes
- Frontend caching with React Query
- Lazy loading for large result sets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues, questions, or suggestions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

## 🎓 Learning Resources

- [tRPC Documentation](https://trpc.io/)
- [Drizzle ORM Guide](https://orm.drizzle.team/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express.js Guide](https://expressjs.com/)

## 🚀 Deployment

### Deploy to Manus Platform

1. Ensure all tests pass: `pnpm test`
2. Create a checkpoint in the Management UI
3. Click "Publish" button
4. Follow deployment instructions

### Deploy to External Hosting

The application can be deployed to services like Vercel, Railway, or Render:

1. Build the application: `pnpm build`
2. Set environment variables on hosting platform
3. Deploy using platform-specific instructions

## 📊 Future Enhancements

- [ ] Batch import from job boards (LinkedIn, Indeed)
- [ ] Automated candidate outreach
- [ ] Interview scheduling integration
- [ ] Offer management system
- [ ] Hiring analytics dashboard
- [ ] Custom evaluation criteria per role
- [ ] Resume comparison tool
- [ ] Candidate feedback templates

---

**Built with ❤️ using AI-powered multi-agent evaluation**
