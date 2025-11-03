# Study Planner & Focus Tracker - Implementation Guide

## Completed Components

1. **Theme System** (`src/context/ThemeContext.jsx`)
   - Light/Dark mode toggle
   - Persists to localStorage
   - Applied globally via document classes

2. **Toast Notifications** (`src/components/Toast.jsx`, `src/components/ToastContainer.jsx`)
   - Success/error toasts
   - Auto-dismiss after 3 seconds
   - Context-based usage

3. **Navbar** (`src/components/Navbar.jsx`)
   - Centered title
   - Theme toggle
   - User info + logout

4. **Subject Dropdown** (`src/components/SubjectDropdown.jsx`)
   - 10 CS subjects + "Other" option
   - Custom subject input

5. **Task Form** (`src/components/TaskForm.jsx`)
   - Title (required, validated)
   - Description (optional)
   - Deadline (date)
   - Time (time input)
   - Prevents close if title is empty

6. **Firestore Service Updates** (`src/services/firestoreService.js`)
   - Added onSnapshot subscriptions
   - Updated task structure (deadlineISO, timeISO)
   - Updated session structure (durationMinutes, durationSeconds, dateISO)
   - User counters support

## Remaining Implementation Tasks

### 1. Update Timer Component
- Add minutes AND seconds input fields
- Show "Focusing on: <subject>" when selected
- Add "Use Focus Timer for this subject" checkbox per subject
- Log sessions with durationMinutes, durationSeconds, dateISO
- Format stats: show minutes if < 60, hours if >= 60

### 2. Update SubjectCard Component
- Add "Use Focus Timer" toggle
- Add Subject Summary dropdown showing tasks
- Track subject completion (all tasks done = completed)
- Prevent double-counting completions

### 3. Update DashboardStats Component
- Calculate Focus Hours from durationMinutes
- Display: "X min" if < 60, "Y.Yh" if >= 60
- Real-time updates via subscriptions

### 4. Update Analytics Component
- Use onSnapshot for real-time updates
- Keep Bar/Line/Pie/Radar chart types
- Only Daily/Monthly time ranges (remove weekly/yearly)
- Subject-wise performance tracking

### 5. Update Home Page
- Use new Navbar component
- Integrate SubjectDropdown
- Add TaskForm modal
- Theme-aware styling throughout
- Subject completion tracking

## Firebase Configuration

Add your Firebase config to `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Firestore Structure

```
users/{userId} (document)
  - totalSessions (optional counter)
  - totalFocusMinutes (optional counter)
  - totalTasks (optional counter)
  - completedTasks (optional counter)

users/{userId}/subjects/{subjectId} (collection)
  - name: string
  - useForTimer: boolean
  - createdAt: timestamp

users/{userId}/subjects/{subjectId}/tasks/{taskId} (collection)
  - title: string
  - description: string
  - deadlineISO: string (ISO date) or null
  - timeISO: string (ISO datetime) or null
  - completed: boolean
  - createdAt: timestamp

users/{userId}/sessions/{sessionId} (collection)
  - durationMinutes: number
  - durationSeconds: number
  - dateISO: string (YYYY-MM-DD)
  - subject: string
  - completed: true
  - timestamp: timestamp
```

## Key Features Implementation Status

- ✅ Theme Toggle (Light/Dark)
- ✅ Toast Notifications
- ✅ Navbar with theme toggle
- ✅ Subject Dropdown with CS subjects
- ✅ Task Form with validation
- ✅ Firestore service with subscriptions
- ⏳ Timer with minutes/seconds
- ⏳ Subject completion tracking
- ⏳ Stats with proper minute display
- ⏳ Analytics with onSnapshot
- ⏳ Subject Summary dropdown
