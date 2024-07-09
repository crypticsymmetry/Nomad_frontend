import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const [machines, setMachines] = useState([]);

    useEffect(() => {
        const unsubscribe = db.collection('machines').onSnapshot(async snapshot => {
            const machinesData = [];
            for (const doc of snapshot.docs) {
                const data = doc.data();
                const issuesSnapshot = await db.collection('issues').where('machine_id', '==', doc.id).get();
                const issues = issuesSnapshot.docs.map(issueDoc => issueDoc.data().issue).join(', ');
                machinesData.push({
                    id: doc.id,
                    ...data,
                    issues,
                    total_time: secondsToHMS(data.total_time),
                    inspection_total_time: secondsToHMS(data.inspection_total_time),
                    servicing_total_time: secondsToHMS(data.servicing_total_time),
                });
            }
            setMachines(machinesData);
        });

        return () => unsubscribe();
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
        db.collection('machines').doc(id).delete()
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
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {machines.map(machine => (
                        <tr key={machine.id}>
                            <td>{machine.id}</td>
                            <td>{machine.name}</td>
                            <td style={{ color: getStatusColor(machine.status) }}>{machine.status}</td>
                            <td>{machine.worker_name}</td>
                            <td>{machine.issues.split(',').map(issue => (
                                <div key={issue}>{issue}</div>
                            ))}</td>
                            <td>
                                {`Total: ${machine.total_time}`}
                                <br />
                                {`Inspection: ${machine.inspection_total_time}`}
                                <br />
                                {`Servicing: ${machine.servicing_total_time}`}
                            </td>
                            <td>
                                <Link to={`/machines/${machine.id}`} className="button">Details</Link>
                                <button onClick={() => handleRemoveMachine(machine.id)} className="button">Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Home;

function secondsToHMS(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}:${m < 10 ? '0' : ''}${m}`;
}
