import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const IssuesForm = ({ machineId, onIssueAdded }) => {
  const [issue, setIssue] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await addDoc(collection(db, 'issues'), {
        machine_id: machineId,
        issue,
        note,
        created_at: new Date().toISOString(),
      });
      onIssueAdded(issue, note);
      setIssue('');
      setNote('');
    } catch (error) {
      console.error('Error adding issue:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={issue}
        onChange={(e) => setIssue(e.target.value)}
        placeholder="New Issue"
      />
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Issue Note"
      />
      <button type="submit">Add Issue</button>
    </form>
  );
};

export default IssuesForm;
