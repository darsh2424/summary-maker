# 🧠 Summary Maker (AI-powered Chat & PPT Generator)

This is a full-stack AI document summarizer and PowerPoint generator tool. It allows users to interactively summarize documents (PDFs) or chat directly with AI to extract structured insights. It also generates downloadable PowerPoint presentations with a single click.

---

## 📁 Project Structure

```
summary_maker/
├── backend/
│   └── ppt_summarizer/
│       ├── manage.py
│       ├── ppt_summarizer/     # Django settings
│       └── summarizer/         # Core logic (views, utils, urls)
│       └── requirements.txt
│
├── frontend/
│   └── src/
│       └── ChatApp.jsx         # React chat app
│   └── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

---

## ⚙️ Backend Setup (Django)

### 1. Navigate & Create Virtual Environment

```bash
cd backend/ppt_summarizer
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Apply Migrations & Run Server

```bash
python manage.py migrate
python manage.py runserver
```

### 4. CORS Setup (Required for frontend)

In `settings.py`:

```python
INSTALLED_APPS += ["corsheaders"]
MIDDLEWARE.insert(0, "corsheaders.middleware.CorsMiddleware")
CORS_ALLOW_ALL_ORIGINS = True
```

---

## 🚀 Frontend Setup (React + Vite)

### 1. Navigate & Install

```bash
cd frontend
npm install
```

### 2. Run Frontend

```bash
npm run dev
```

It should run on [http://localhost:5173](http://localhost:5173)

---

## 🧠 Features

- AI-powered PDF summarization with user prompt
- Markdown slide structure + HTML formatting support
- Automatic generation of `.pptx` files from AI responses
- Dual modes:
  - `Chat Mode`: Conversational summarization
  - `PPT Mode`: Paste or generate content and instantly download slides
- Clipboard copy + timestamp
- File upload and response stream handling
- Custom helper prompt system to reduce user effort

---

## 📌 Technologies Used

- **Backend:** Django REST Framework, PyMuPDF, python-pptx, sentence-transformers
- **Frontend:** React, Vite, Axios, Lucide Icons
- **AI Model:** DeepSeek via OpenRouter

---

## 📥 API Endpoints

- `POST /api/chat/`: Handles chat and summarization mode
- `POST /api/generate-ppt/`: Accepts summary text and returns generated PPT

---
