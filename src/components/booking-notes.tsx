import { type BookingNote, type User } from "@/core/types";
import { formatTimestamp } from "@/utils/dates";
import React, { useState } from "react";

interface BookingNotesProps {
  bookingId: string;
  notes: BookingNote[];
  user: User;
}

const BookingNotes = ({
  bookingId,
  notes: initialNotes,
  user,
}: BookingNotesProps) => {
  const [notes, setNotes] = useState<BookingNote[]>(initialNotes);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim() === "") return;

    const response = await fetch(`/api/bookings/${bookingId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: newNote }),
    });

    if (response.ok) {
      const createdNote = await response.json();
      setNotes([...notes, createdNote]);
      setNewNote("");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
        Booking Notes
      </h2>
      <div className="space-y-4 mb-6">
        {notes.map((note) => (
          <div key={note.id} className="border-b pb-2">
            <p className="text-gray-800">{note.note}</p>
            <p className="text-sm text-gray-500">
              {note.user ? `${note.user.first_name || 'Admin'} ${note.user.last_name || ''}` : 'System'} -{" "}
              {formatTimestamp(note.created_at)}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={handleAddNote}>
        <textarea
          className="w-full border rounded-md p-2"
          rows={3}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a new note..."
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Add Note
        </button>
      </form>
    </div>
  );
};

export default BookingNotes;
