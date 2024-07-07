import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebaseConfig';
import { useParams, Link } from 'react-router-dom';
import Select from 'react-select';
import axios from 'axios';
import './MachineDetail.css';

const MachineDetail = () => {
    const { id } = useParams();
    const [machine, setMachine] = useState(null);
    const [issuesOptions, setIssuesOptions] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [note, setNote] = useState('');
    const [severity, setSeverity] = useState('green');

    useEffect(() => {
        const fetchMachine = async () => {
            const machineDoc = await db.collection('machines').doc(id).get();
            const machineData = machineDoc.data();
            const issuesSnapshot = await db.collection('issues').where('machine_id', '==', id).get();
            const issues = issuesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMachine({ ...machineData, issues });
        };

        fetchMachine();

        axios.get('/issues-file')
        .then(response => {
            const options = response.data.map(issue => ({ value: issue, label: issue }));
            setIssuesOptions(options);
        })
        .catch(error => console.error('Error fetching issues file:', error));
    }, [id]);

    const uploadPhoto = (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('photo', file);

        axios.post(`/machines/${id}/photo`, formData)
        .then(response => {
            const photoPath = response.data.photo;
            setMachine(prevMachine => ({ ...prevMachine, photo: photoPath }));
        })
        .catch(error => console.error('Error uploading photo:', error));
    };

    const startInspectionTimer = () => {
        db.collection('machines').doc(id).update({
            inspection_start_time: new Date().toISOString(),
            status: 'Started',
        })
        .then(() => setMachine(prevMachine => ({ ...prevMachine, status: 'Started' })))
        .catch(error => console.error('Error starting inspection timer:', error));
    };

    const pauseInspectionTimer = () => {
        db.collection('machines').doc(id).get()
        .then(doc => {
            const data = doc.data();
            const startTime = new Date(data.inspection_start_time);
            const elapsed = (new Date() - startTime) / 1000;
            const newTotalTime = data.inspection_total_time + elapsed;
            db.collection('machines').doc(id).update({
                inspection_start_time: null,
                inspection_total_time: newTotalTime,
                status: 'Paused',
            })
            .then(() => setMachine(prevMachine => ({ ...prevMachine, status: 'Paused' })))
            .catch(error => console.error('Error pausing inspection timer:', error));
        });
    };

    const stopInspectionTimer = () => {
        db.collection('machines').doc(id).get()
        .then(doc => {
            const data = doc.data();
            const startTime = new Date(data.inspection_start_time);
            const elapsed = (new Date() - startTime) / 1000;
            const newTotalTime = data.inspection_total_time + elapsed;
            db.collection('machines').doc(id).update({
                inspection_start_time: null,
                inspection_total_time: newTotalTime,
                status: 'Stopped/Finished',
            })
            .then(() => setMachine(prevMachine => ({ ...prevMachine, status: 'Stopped/Finished' })))
            .catch(error => console.error('Error stopping inspection timer:', error));
        });
    };

    const startServicingTimer = () => {
        db.collection('machines').doc(id).update({
            servicing_start_time: new Date().toISOString(),
            status: 'Started',
        })
        .then(() => setMachine(prevMachine => ({ ...prevMachine, status: 'Started' })))
        .catch(error => console.error('Error starting servicing timer:', error));
    };

    const pauseServicingTimer = () => {
        db.collection('machines').doc(id).get()
        .then(doc => {
            const data = doc.data();
            const startTime = new Date(data.servicing_start_time);
            const elapsed = (new Date() - startTime) / 1000;
            const newTotalTime = data.servicing_total_time + elapsed;
            db.collection('machines').doc(id).update({
                servicing_start_time: null,
                servicing_total_time: newTotalTime,
                status: 'Paused',
            })
            .then(() => setMachine(prevMachine => ({ ...prevMachine, status: 'Paused' })))
            .catch(error => console.error('Error pausing servicing timer:', error));
        });
    };

    const stopServicingTimer = () => {
        db.collection('machines').doc(id).get()
        .then(doc => {
            const data = doc.data();
            const startTime = new Date(data.servicing_start_time);
            const elapsed = (new Date() - startTime) / 1000;
            const newTotalTime = data.servicing_total_time + elapsed;
            db.collection('machines').doc(id).update({
                servicing_start_time: null,
                servicing_total_time: newTotalTime,
                status: 'Stopped/Finished',
            })
            .then(() => setMachine(prevMachine => ({ ...prevMachine, status: 'Stopped/Finished' })))
            .catch(error => console.error('Error stopping servicing timer:', error));
        });
    };

    const addIssue = () => {
        if (!selectedIssue) {
            alert('Please select an issue.');
            return;
        }
        db.collection('issues').add({
            machine_id: id,
            issue: selectedIssue.value,
            status: 'Pending',
            note,
            severity,
            created_at: new Date().toISOString(),
        })
        .then(() => {
            db.collection('issues').where('machine_id', '==', id).get()
            .then(snapshot => {
                const issues = [];
                snapshot.forEach(doc => {
                    issues.push({ id: doc.id, ...doc.data() });
                });
                setMachine(prevMachine => ({ ...prevMachine, issues }));
                setSelectedIssue(null);
                setNote('');
            });
        })
        .catch(error => console.error('Error adding issue:', error));
    };

    const removeIssue = (issueId) => {
        db.collection('issues').doc(issueId).delete()
        .then(() => {
            db.collection('issues').where('machine_id', '==', id).get()
            .then(snapshot => {
                const issues = [];
                snapshot.forEach(doc => {
                    issues.push({ id: doc.id, ...doc.data() });
                });
                setMachine(prevMachine => ({ ...prevMachine, issues }));
            });
        })
        .catch(error => console.error('Error removing issue:', error));
    };

    const updateNote = (issueId) => {
        db.collection('issues').doc(issueId).update({ note })
        .then(() => {
            db.collection('issues').where('machine_id', '==', id).get()
            .then(snapshot => {
                const issues = [];
                snapshot.forEach(doc => {
                    issues.push({ id: doc.id, ...doc.data() });
                });
                setMachine(prevMachine => ({ ...prevMachine, issues }));
            });
        })
        .catch(error => console.error('Error updating note:', error));
    };

    const updateSeverity = (issueId, newSeverity) => {
        db.collection('issues').doc(issueId).update({ severity: newSeverity })
        .then(() => {
            db.collection('issues').where('machine_id', '==', id).get()
            .then(snapshot => {
                const issues = [];
                snapshot.forEach(doc => {
                    issues.push({ id: doc.id, ...doc.data() });
                });
                setMachine(prevMachine => ({ ...prevMachine, issues }));
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
            <p>Worker: {machine.worker_name}</p> {/* Display the worker name */}
            <p>Total Time: {machine.total_time}</p>
            <p>Inspection Time: {machine.inspection_total_time}</p>
            <p>Servicing Time: {machine.servicing_total_time}</p>
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
            {machine.photo && <img src={machine.photo} alt="Machine" />}
            <h2>Inspection Timer</h2>
            <button onClick={startInspectionTimer}>Start Inspection</button>
            <button onClick={pauseInspectionTimer}>Pause Inspection</button>
            <button onClick={stopInspectionTimer}>Stop Inspection</button>
            <h2>Servicing Timer</h2>
            <button onClick={startServicingTimer}>Start Servicing</button>
            <button onClick={pauseServicingTimer}>Pause Servicing</button>
            <button onClick={stopServicingTimer}>Stop Servicing</button>
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

function secondsToHMS(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}:${m < 10 ? '0' : ''}${m}`;
}
