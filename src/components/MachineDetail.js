import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Select from 'react-select';
import './MachineDetail.css';

const MachineDetail = () => {
    const { id } = useParams();
    const [machine, setMachine] = useState(null);
    const [issuesOptions, setIssuesOptions] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [note, setNote] = useState('');
    const [severity, setSeverity] = useState('green');

    useEffect(() => {
        axios.get(`/machines/${id}`)
            .then(response => {
                const machineData = response.data;
                if (!Array.isArray(machineData.issues)) {
                    machineData.issues = [];
                }
                setMachine(machineData);
            })
            .catch(error => console.error('Error fetching machine:', error));

        axios.get('/issues-file')
            .then(response => {
                setIssuesOptions(response.data.map(issue => ({ value: issue, label: issue })));
            })
            .catch(error => console.error('Error fetching issues file:', error));
    }, [id]);

    const uploadPhoto = (event) => {
        const formData = new FormData();
        formData.append('photo', event.target.files[0]);
        axios.post(`/machines/${id}/photo`, formData)
            .then(response => setMachine({ ...machine, photo: response.data.photo }))
            .catch(error => console.error('Error uploading photo:', error));
    };

    const startTimer = () => {
        axios.post(`/machines/${id}/start`)
            .then(() => setMachine({ ...machine, status: 'Started' }))
            .catch(error => console.error('Error starting timer:', error));
    };

    const pauseTimer = () => {
        axios.post(`/machines/${id}/pause`)
            .then(() => setMachine({ ...machine, status: 'Paused' }))
            .catch(error => console.error('Error pausing timer:', error));
    };

    const stopTimer = () => {
        axios.post(`/machines/${id}/stop`)
            .then(() => setMachine({ ...machine, status: 'Stopped/Finished' }))
            .catch(error => console.error('Error stopping timer:', error));
    };

    const addIssue = () => {
        if (!selectedIssue) {
            alert('Please select an issue.');
            return;
        }
        axios.post(`/machines/${id}/issues`, { issue: selectedIssue.value, note, severity })
            .then(response => {
                setMachine({
                    ...machine,
                    issues: response.data,
                });
                setSelectedIssue(null);
                setNote('');
            })
            .catch(error => console.error('Error adding issue:', error));
    };

    const removeIssue = (issueId) => {
        axios.delete(`/machines/${id}/issues/${issueId}`)
            .then(response => {
                setMachine({
                    ...machine,
                    issues: response.data,
                });
            })
            .catch(error => console.error('Error removing issue:', error));
    };

    const updateNote = (issueId) => {
        axios.put(`/machines/${id}/issues/${issueId}/note`, { note })
            .then(response => {
                setMachine({
                    ...machine,
                    issues: response.data,
                });
            })
            .catch(error => console.error('Error updating note:', error));
    };

    const updateSeverity = (issueId, newSeverity) => {
        axios.put(`/machines/${id}/issues/${issueId}/severity`, { severity: newSeverity })
            .then(response => {
                setMachine({
                    ...machine,
                    issues: response.data,
                });
            })
            .catch(error => console.error('Error updating severity:', error));
    };

    const getIssueColor = (severity) => {
        switch (severity) {
            case 'green':
                return 'green';
            case 'yellow':
                return 'yellow';
            case 'red':
                return 'red';
            default:
                return 'black';
        }
    };

    if (!machine) return <div>Loading...</div>;

    return (
        <div className="machine-detail-container">
            <h1>{machine.name}</h1>
            <p>Status: {machine.status}</p>
            <p>Issues:</p>
            <ul>
                {machine.issues.map((issue, index) => (
                    <li key={index} style={{ color: getIssueColor(issue.severity) }}>
                        {issue.issue}
                        <input
                            type="text"
                            value={issue.note || ''}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Update Note"
                        />
                        <button onClick={() => updateNote(issue.id)}>Update Note</button>
                        <select value={issue.severity} onChange={(e) => updateSeverity(issue.id, e.target.value)}>
                            <option value="green">Perfect</option>
                            <option value="yellow">Okay</option>
                            <option value="red">Poor</option>
                        </select>
                        <button onClick={() => removeIssue(issue.id)}>Remove</button>
                    </li>
                ))}
            </ul>
            <input type="file" onChange={uploadPhoto} />
            {machine.photo && <img src={`/images/${machine.photo}`} alt="Machine" />}
            <button onClick={startTimer}>Start</button>
            <button onClick={pauseTimer}>Pause</button>
            <button onClick={stopTimer}>Stop</button>
            <Select
                value={selectedIssue}
                onChange={setSelectedIssue}
                options={issuesOptions}
                placeholder="Select an issue..."
                isClearable
                isSearchable
            />
            <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Issue Note"
            />
            <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="green">Perfect</option>
                <option value="yellow">Okay</option>
                <option value="red">Poor</option>
            </select>
            <button onClick={addIssue}>Add Issue</button>
            <Link to="/" className="button">Back</Link>
        </div>
    );
};

export default MachineDetail;
