import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);

  const fetchEvents = async () => {
    const snapshot = await getDocs(collection(db, "events"));
    const data = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
    setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddOrEdit = async (data) => {
    if (editEvent) {
      await updateDoc(doc(db, "events", editEvent.id), data);
    } else {
      await addDoc(collection(db, "events"), data);
    }
    setModalOpen(false);
    setEditEvent(null);
    fetchEvents();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "events", id));
    fetchEvents();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Events</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-neutral-200 transition"
          >
            <Plus size={18} /> Add Event
          </motion.button>
        </div>

        {events.length === 0 ? (
          <p className="text-neutral-400 text-center mt-10">No events yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                onEdit={() => {
                  setEditEvent(event);
                  setModalOpen(true);
                }}
                onDelete={() => handleDelete(event.id)}
              />
            ))}
          </div>
        )}
      </div>

      <EventModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditEvent(null);
        }}
        onSave={handleAddOrEdit}
        eventData={editEvent}
      />
    </div>
  );
};

export default Home;
