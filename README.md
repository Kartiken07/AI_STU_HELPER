# Udaan - AI Student Career Helper

An AI-powered career guidance platform designed to help students navigate their career journey through intelligent chatbots, quiz assessments, PDF document analysis, and personalized career insights.

## Features

| Feature | Description |
|---------|-------------|
| **AI Career Chatbot** | Ask career-related questions and get personalized guidance powered by AI |
| **Career Quiz** | Take quizzes to discover your strengths and get career recommendations |
| **PDF Reader with RAG** | Upload PDFs and chat with your documents using Retrieval-Augmented Generation |
| **Student Dashboard** | Visualize your progress with interactive charts and analytics |
| **Admin Dashboard** | Manage users, view analytics, and monitor platform usage |
| **Authentication** | Secure user registration and login system |

## Tech Stack

### Frontend
- **React 19** + **TypeScript** — Type-safe component architecture
- **Vite** — Fast dev server and build tool
- **React Router** — Client-side routing
- **Lucide React** — Icon library

### Backend
- **FastAPI** — High-performance Python web framework
- **LangChain** — AI/LLM orchestration framework
- **LangGraph** — Stateful AI agent workflows
- **Hugging Face** — Sentence transformers for embeddings
- **FAISS** — Vector similarity search
- **SQLAlchemy** — Database ORM
- **SQLite** — Lightweight database

### AI/ML
- **OpenAI** — LLM API integration
- **LangSmith** — LLM observability and tracing
- **TensorFlow / PyTorch** — Deep learning frameworks
- **Sentence Transformers** — Text embeddings

## Project Structure

```
├── Backend/
│   ├── app/
│   │   ├── app.py              # FastAPI main application
│   │   ├── auth.py             # Authentication routes
│   │   ├── loadmodel.py        # AI model loading
│   │   ├── model.py            # Chat/AI model logic
│   │   ├── Chatschema.py       # Chat data schemas
│   │   ├── Database.py         # Database configuration
│   │   ├── models_database.py  # Database models
│   │   └── seed_career_data.py # Career data seeder
│   ├── Schema/                 # Request/Response schemas
│   ├── Schemafordatabase/      # Database schemas
│   └── utility/                # Helper functions
├── Front-end/
│   └── my-app/
│       └── src/
│           ├── Components/
│           │   ├── AdminDashboard.tsx    # Admin panel
│           │   ├── AuthForm.tsx          # Login/Signup form
│           │   ├── Chartsinterface.tsx   # Analytics dashboard
│           │   ├── Chat_Bot_Interface.tsx # AI chatbot UI
│           │   ├── Chats.tsx             # Career network graph
│           │   ├── Homepage.tsx          # Landing page
│           │   ├── Login.tsx             # Login page
│           │   ├── Navbar.tsx            # Navigation bar
│           │   ├── PDF_Reader_Rag.tsx    # PDF chat interface
│           │   ├── Quiz_interface.tsx    # Quiz system
│           │   ├── Signup_page.tsx       # Registration page
│           │   └── Toast.tsx             # Notifications
│           ├── context/
│           │   └── AuthContext.tsx       # Auth state management
│           └── api/
│               └── config.ts            # API configuration
└── requirements.txt
```

## Getting Started

### Prerequisites

- **Node.js** (v18+)
- **Python** (3.10+)
- **pip** (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kartiken07/AI_STU_HELPER.git
   cd AI_STU_HELPER
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   pip install -r ../requirements.txt
   python -m app.app
   ```

3. **Frontend Setup**
   ```bash
   cd Front-end/my-app
   npm install
   npm run dev
   ```

4. **Environment Variables**

   Create `.env` files in the `Backend/app/` directory with:
   ```env
   HUGGINGFACEHUB_API_TOKEN=your_huggingface_token
   OPENAI_API_KEY=your_openai_key
   LANGSMITH_API_KEY=your_langsmith_key
   ```

### Access

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:8000`

## Routes

| Path | Description |
|------|-------------|
| `/signup` | User registration |
| `/login` | User login |
| `/home` | Homepage / Landing page |
| `/chat` | AI Career Chatbot |
| `/quiz` | Career Assessment Quiz |
| `/dashboard` | Student Analytics Dashboard |
| `/admin` | Admin Dashboard |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Contact

**Kartiken** — [GitHub](https://github.com/Kartiken07)
