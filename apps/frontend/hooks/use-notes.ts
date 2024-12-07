import { useState, useEffect } from 'react';
import { openDB, DBSchema } from 'idb';

export interface Note {
  id?: number;
  title: string;
  text: string;
  done?: boolean;
  teamId?: string;
}

interface NotesDb extends DBSchema {
  notes: {
    key: number;
    value: Note;
  };
}

export const useIndexDb = () => {
  const [notes, setNotes] = useState<NotesDb['notes']['value'][]>([]);

  useEffect(() => {
    const initDb = async () => {
      const db = await openDB<NotesDb>('notes-database', 1, {
        upgrade(db) {
          db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
        }
      });

      const allNotes = await db.getAll('notes');
      setNotes(allNotes);
    };

    initDb();
  }, []);

  const addNote = async (note: Note) => {
    const db = await openDB<NotesDb>('notes-database', 1);
    const tx = db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');
    const id = await store.add(note);
    await tx.done;

    setNotes(prevNotes => [...prevNotes, { ...note, id }]);
  };

  const updateNote = async (note: Note) => {
    const db = await openDB<NotesDb>('notes-database', 1);
    const tx = db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');
    await store.put(note);
    await tx.done;

    setNotes(prevNotes => prevNotes.map(prevNote => (prevNote.id === note.id ? note : prevNote)));
  };

  const clearNotes = async () => {
    const db = await openDB<NotesDb>('notes-database', 1);
    const tx = db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');
    await store.clear();
    await tx.done;

    setNotes([]);
  };

  return { notes, addNote, updateNote, clearNotes };
};
