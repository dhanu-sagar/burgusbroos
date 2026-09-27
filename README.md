# Burgusbroos ⚡

**Burgusbroos** is an intentional productivity and focus-sprint workspace built around **Reality-Based Time Tracking**, **3-Bucket Triage (Must / Should / Could)**, and **Creative Takeaways**. Available as both a responsive Web application and a cross-platform Flutter mobile client.

---

## 🚀 Key Features

- **Daily Grounding**: Daily Highlight, atomic micro-commitments, and brain dump archiving.
- **3-Bucket Intentional Triage**: Prioritize tasks strictly into **Must Do**, **Should Do**, and **Could Do**.
- **Live Focus Sprints**: 25-minute Pomodoro-style sprints with real-time countdown, mini overlay, and pause/resume.
- **Creative Breakaway Log**: Capture real-time breakthrough ideas, solutions, and takeaways during sprints.
- **Project Containers**: Group tasks by momentum milestones and visualize progress completion rates.
- **Reality Analytics & Weekly Reports**: Automatic logging of live sprint focus duration grouped by bucket and week.
- **Cross-Platform Mobile**: 100% feature-parity Flutter app tested on compact mobile phone viewports (360x640) with zero pixel cutoffs.

---

## 🛠 Project Structure

```text
burgusbroos/
├── src/                    # React web application (Vite + Tailwind CSS + Lucide Icons)
├── supabase/               # Supabase database migrations & schemas
├── burgusbroos_flutter/    # Flutter mobile client (Android / iOS / Web / Desktop)
│   ├── lib/
│   │   ├── constants/      # AppTheme & AppColors
│   │   ├── models/         # TaskItem, SprintSession, Project, DailyRecord
│   │   ├── providers/      # AppProvider state management
│   │   ├── services/       # SupabaseService sync layer
│   │   ├── views/          # Dashboard, Tasks, Sprint, Projects, Weekly Report, Simple Mode
│   │   └── widgets/        # Modals, headers, floating sprint overlay
│   └── test/               # Responsive mobile widget & unit test suites
└── REQUIREMENTS_AND_IMPLEMENTATION_SPEC.md # Full architectural specification
```

---

## 💻 Getting Started

### 1. Web Application (React + Vite)
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### 2. Mobile Application (Flutter)
```bash
cd burgusbroos_flutter

# Install Flutter dependencies
flutter pub get

# Run test suite
flutter test

# Run on connected device or emulator
flutter run
```

---

## 📦 Tech Stack
- **Web**: React 19, Vite, Tailwind CSS, Lucide React, TypeScript
- **Mobile**: Flutter 3.x, Dart SDK, Provider, Google Fonts, Lucide Icons
- **Backend / Database**: Supabase

