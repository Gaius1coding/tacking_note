'use client';

import { useState, useEffect } from 'react';
import { FaEdit, FaStar, FaTrashAlt, FaPlus } from 'react-icons/fa';

interface Note {
  id: number;
  title: string;
  content: string;
  favorite: boolean;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    // Fetch les notes json-server
    fetch('http://localhost:3001/notes')
      .then((response) => response.json())
      .then((data) => setNotes(data));
  }, []);

  const addNote = async () => {
    if (newTitle.trim() && newContent.trim()) {
      const newNote = { title: newTitle, content: newContent, favorite: false };
      const response = await fetch('http://localhost:3001/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });

      const savedNote = await response.json();
      setNotes([...notes, savedNote]);
      setNewTitle('');
      setNewContent('');
    }
  };

  const deleteNote = async (id: number) => {
    await fetch(`http://localhost:3001/notes/${id}`, {
      method: 'DELETE',
    });

    setNotes(notes.filter((note) => note.id !== id));
  };

  const toggleFavorite = async (id: number) => {
    const noteToUpdate = notes.find((note) => note.id === id);
    if (noteToUpdate) {
      const updatedNote = { ...noteToUpdate, favorite: !noteToUpdate.favorite };
      await fetch(`http://localhost:3001/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNote),
      });

      setNotes(notes.map((note) => (note.id === id ? updatedNote : note)));
    }
  };

  const startEdit = (note: Note) => {
    setEditId(note.id);
    setNewTitle(note.title);
    setNewContent(note.content);
  };

  const editNote = async () => {
    if (editId !== null) {
      const updatedNote = { title: newTitle, content: newContent, favorite: false };
      await fetch(`http://localhost:3001/notes/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNote),
      });

      setNotes(notes.map((note) => (note.id === editId ? { ...note, ...updatedNote } : note)));
      setEditId(null);
      setNewTitle('');
      setNewContent('');
    }
  };

  return (
    <div className="container">
      <h1 className="title">Note Taking App</h1>
      <div className="input-container">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Note title..."
          className="input"
        />
        <input
          type="text"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Note content..."
          className="input"
        />
        <button onClick={editId !== null ? editNote : addNote} className="add-btn">
          {editId !== null ? 'Update' : <FaPlus />}
        </button>
      </div>

      <div className="notes-grid">
        {notes.map((note) => (
          <div key={note.id} className="note-card">
            <h2 className="note-title">{note.title}</h2>
            <p className="note-content">{note.content}</p>
            <div className="note-actions">
              <button onClick={() => toggleFavorite(note.id)} className="icon-btn">
                <FaStar className={note.favorite ? 'favorite' : 'not-favorite'} />
              </button>
              <button onClick={() => startEdit(note)} className="icon-btn">
                <FaEdit />
              </button>
              <button onClick={() => deleteNote(note.id)} className="icon-btn">
                <FaTrashAlt />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
