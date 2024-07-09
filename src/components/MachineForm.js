import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { useHistory } from 'react-router-dom';
import './MachineForm.css';

const MachineForm = () => {
    const [name, setName] = useState('');
    const [workerName, setWorkerName] = useState('');
    const history = useHistory();

    const handleSubmit = (event) => {
        event.preventDefault();
        db.collection('machines').add({
            name,
            worker_name: workerName,
            status: 'Pending',
            total_time: 0,
            inspection_total_time: 0,
            servicing_total_time: 0,
            created_at: new Date().toISOString(),
        })
        .then(() => {
            history.push('/');
        })
        .catch(error => console.error('Error adding machine:', error));
    };

    return (
        <div className="machine-detail-container">
            <h1>Add Machine</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Machine Name"
                />
                <input
                    type="text"
                    value={workerName}
                    onChange={(e) => setWorkerName(e.target.value)}
                    placeholder="Worker Name"
                />
                <button type="submit" className="button">Add Machine</button>
            </form>
        </div>
    );
};

export default MachineForm;
