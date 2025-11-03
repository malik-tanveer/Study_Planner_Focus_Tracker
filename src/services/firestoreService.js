// Firestore service for managing subjects, tasks, and sessions
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

// ========== USER COUNTERS ==========
export const updateUserCounters = async (userId, updates) => {
  const userRef = doc(db, `users/${userId}`);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    await updateDoc(userRef, updates);
  } else {
    await setDoc(userRef, { ...updates, createdAt: serverTimestamp() });
  }
};

// ========== SUBJECTS ==========
export const addSubject = async (userId, subjectName, useForTimer = false, description = "") => {
  const subjectData = {
    name: subjectName,
    description: description || "",
    useForTimer: useForTimer,
    createdAt: serverTimestamp(),
  };
  const subjectRef = await addDoc(
    collection(db, `users/${userId}/subjects`),
    subjectData
  );
  return subjectRef.id;
};

export const getSubjects = async (userId) => {
  const subjectsRef = collection(db, `users/${userId}/subjects`);
  const q = query(subjectsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const subscribeToSubjects = (userId, callback) => {
  const subjectsRef = collection(db, `users/${userId}/subjects`);
  const q = query(subjectsRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const subjects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(subjects);
  });
};

export const updateSubject = async (userId, subjectId, updates) => {
  await updateDoc(doc(db, `users/${userId}/subjects`, subjectId), updates);
};

export const deleteSubject = async (userId, subjectId) => {
  // Delete all tasks under this subject first
  const tasksRef = collection(
    db,
    `users/${userId}/subjects/${subjectId}/tasks`
  );
  const tasksSnapshot = await getDocs(tasksRef);
  const deleteTasksPromises = tasksSnapshot.docs.map((taskDoc) =>
    deleteDoc(taskDoc.ref)
  );
  await Promise.all(deleteTasksPromises);

  // Delete the subject
  await deleteDoc(doc(db, `users/${userId}/subjects`, subjectId));
};

// ========== TASKS ==========
export const addTask = async (userId, subjectId, taskData) => {
  const taskRef = await addDoc(
    collection(db, `users/${userId}/subjects/${subjectId}/tasks`),
    {
      title: taskData.title,
      description: taskData.description || "",
      deadlineISO: taskData.deadlineISO || null,
      timeISO: taskData.timeISO || null,
      completed: false,
      createdAt: serverTimestamp(),
    }
  );
  return taskRef.id;
};

export const getTasks = async (userId, subjectId) => {
  const tasksRef = collection(
    db,
    `users/${userId}/subjects/${subjectId}/tasks`
  );
  const q = query(tasksRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const subscribeToTasks = (userId, subjectId, callback) => {
  const tasksRef = collection(
    db,
    `users/${userId}/subjects/${subjectId}/tasks`
  );
  const q = query(tasksRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(tasks);
  });
};

export const updateTask = async (userId, subjectId, taskId, updates) => {
  await updateDoc(
    doc(db, `users/${userId}/subjects/${subjectId}/tasks`, taskId),
    updates
  );
};

export const deleteTask = async (userId, subjectId, taskId) => {
  await deleteDoc(
    doc(db, `users/${userId}/subjects/${subjectId}/tasks`, taskId)
  );
};

// ========== SESSIONS ==========
export const addSession = async (userId, sessionData) => {
  const sessionRef = await addDoc(
    collection(db, `users/${userId}/sessions`),
    {
      durationMinutes: sessionData.durationMinutes || 0,
      durationSeconds: sessionData.durationSeconds || 0,
      dateISO: sessionData.dateISO,
      subject: sessionData.subject || "General",
      completed: true,
      timestamp: serverTimestamp(),
    }
  );
  
  // Update user counters
  await updateUserCounters(userId, {
    totalSessions: serverTimestamp(), // Will be calculated
    totalFocusMinutes: serverTimestamp(), // Will be calculated
  });
  
  return sessionRef.id;
};

export const getSessions = async (userId, limit = null) => {
  const sessionsRef = collection(db, `users/${userId}/sessions`);
  let q = query(sessionsRef, orderBy("timestamp", "desc"));
  if (limit) {
    const snapshot = await getDocs(q);
    return snapshot.docs
      .slice(0, limit)
      .map((doc) => ({ id: doc.id, ...doc.data() }));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const subscribeToSessions = (userId, callback) => {
  const sessionsRef = collection(db, `users/${userId}/sessions`);
  const q = query(sessionsRef, orderBy("timestamp", "desc"));
  return onSnapshot(q, (snapshot) => {
    const sessions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(sessions);
  });
};

export const getSessionsByDateRange = async (userId, startDate, endDate) => {
  const sessionsRef = collection(db, `users/${userId}/sessions`);
  const q = query(
    sessionsRef,
    where("dateISO", ">=", startDate),
    where("dateISO", "<=", endDate),
    orderBy("dateISO", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
