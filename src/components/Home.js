import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const [machines, setMachines] = useState([]);

    useEffect(() => {
        axios.get('/machines')
            .then(response => setMachines(response.data))
            .catch(error => console.error('Error fetching machines:', error));
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Started':
                return 'green';
            case 'Paused':
                return 'yellow';
            case 'Stopped/Finished':
                return 'red';
            default:
                return 'black';
        }
    };

    const handleRemoveMachine = (id) => {
        axios.delete(`/machines/${id}`)
            .then(() => {
                setMachines(machines.filter(machine => machine.id !== id));
            })
            .catch(error => console.error('Error removing machine:', error));
    };

    return (
        <div className="home-container">
            <h1>Powersports Shop Management</h1>
            <Link to="/add-machine" className="button">Add Machine</Link>
            <table className="machines-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Worker</th>
                        <th>Issues</th>
                        <th>Time Spent</th>
                        <th>Actions</th> {/* Add Actions column */}
                    </tr>
                </thead>
                <tbody>
                    {machines.map(machine => (
                        <tr key={machine.id}>
                            <td>{machine.id}</td>
                            <td>{machine.name}</td>
                            <td>{machine.status}</td>
                            <td>{machine.worker_name}</td>
                            <td>
                                {machine.issues && machine.issues.split(',').map(issue => (
                                    <div key={issue} style={{ color: getStatusColor(issue.severity) }}>
                                        {issue}
                                    </div>
                                ))}
                            </td>
                            <td style={{ color: getStatusColor(machine.status) }}>
                                {machine.total_time}
                            </td>
                            <td>
                                <Link to={`/machines/${machine.id}`} className="button">Details</Link>
                                <button onClick={() => handleRemoveMachine(machine.id)} className="button">Remove</button> {/* Add Remove button */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Home;
