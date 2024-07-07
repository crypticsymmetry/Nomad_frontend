import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const MachineForm = () => {
    const [name, setName] = useState('');
    const history = useHistory();

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post('/machines', { name })
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
            <button type="submit">Add Machine</button>
        </form>
    );
};

export default MachineForm;
