import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const MachineForm = () => {
    const [name, setName] = useState('');
    const [workerName, setWorkerName] = useState('');
    const history = useHistory();

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post('/machines', { name, worker_name: workerName })
            .then(response => {
                history.push('/');
            })
            .catch(error => console.error('Error adding machine:', error));
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Add Machine</h1>
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
            <button type="submit">Add Machine</button>
        </form>
    );
};

export default MachineForm;
