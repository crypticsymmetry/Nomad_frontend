import React, { useState } from 'react';
import axios from 'axios';

const IssueForm = ({ machineId, onIssueAdded }) => {
    const [issue, setIssue] = useState('');
    const [note, setNote] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post(`/machines/${machineId}/issues`, { issue, note })
            .then(response => {
                onIssueAdded(issue, note);
                setIssue('');
                setNote('');
            })
            .catch(error => console.error('Error adding issue:', error));
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

export default IssueForm;
