import { useState, useEffect } from 'react';
import { WithId } from 'mongodb';
import { openDB, DBSchema } from 'idb';
import { Team } from '@lems/types';

export interface Note {
  id?: number;
  text: string;
  title?: string;
  done?: boolean;
  team?: WithId<Team> | null;
  editing?: boolean;
}

interface NotesDb extends DBSchema {
  notes: {
    key: number;
    value: Note;
  };
}

export const useNotes = () => {
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
    console.log(note);
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

  const deleteNote = async (id: number) => {
    const db = await openDB<NotesDb>('notes-database', 1);
    const tx = db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');
    await store.delete(id);
    await tx.done;

    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };

  const clearNotes = async () => {
    const db = await openDB<NotesDb>('notes-database', 1);
    const tx = db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');
    await store.clear();
    await tx.done;

    setNotes([]);
  };

  return { notes, addNote, updateNote, deleteNote, clearNotes };
};
