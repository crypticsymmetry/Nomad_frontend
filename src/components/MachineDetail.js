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
  const [issueImage, setIssueImage] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrierCode, setCarrierCode] = useState('');

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

  const uploadPhoto = async (event, type, issueId = null) => {
    const file = event.target.files[0];
    const storageRef = storage.ref();
    let fileRef;

    if (type === 'machine') {
      fileRef = storageRef.child(`machines/${id}/${file.name}`);
    } else if (type === 'issue') {
      fileRef = storageRef.child(`machines/${id}/issues/${issueId}/${file.name}`);
    }

    try {
      await fileRef.put(file);
      const photoUrl = await fileRef.getDownloadURL();

      if (type === 'machine') {
        db.collection('machines').doc(id).update({ photo: photoUrl });
        setMachine(prevMachine => ({ ...prevMachine, photo: photoUrl }));
      } else if (type === 'issue') {
        db.collection('issues').doc(issueId).update({ photo: photoUrl });
        setMachine(prevMachine => ({
          ...prevMachine,
          issues: prevMachine.issues.map(issue => issue.id === issueId ? { ...issue, photo: photoUrl } : issue)
        }));
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
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
      trackingNumber: '',
      carrierCode: '',
    })
      .then(async (docRef) => {
        if (issueImage) {
          await uploadPhoto({ target: { files: [issueImage] } }, 'issue', docRef.id);
          setIssueImage(null);
        }
        const issuesSnapshot = await db.collection('issues').where('machine_id', '==', id).get();
        const issues = issuesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMachine(prevMachine => ({ ...prevMachine, issues }));
        setSelectedIssue(null);
        setNote('');
      })
      .catch(error => console.error('Error adding issue:', error));
  };

  const updateTrackingInfo = (issueId) => {
    db.collection('issues').doc(issueId).update({
      trackingNumber,
      carrierCode,
    })
      .then(() => {
        setMachine(prevMachine => ({
          ...prevMachine,
          issues: prevMachine.issues.map(issue => issue.id === issueId ? { ...issue, trackingNumber, carrierCode } : issue)
        }));
      })
      .catch(error => console.error('Error updating tracking info:', error));
  };

  const removeIssue = (issueId) => {
    db.collection('issues').doc(issueId).delete()
      .then(() => {
        setMachine(prevMachine => ({
          ...prevMachine,
          issues: prevMachine.issues.filter(issue => issue.id !== issueId)
        }));
      })
      .catch(error => console.error('Error removing issue:', error));
  };

  const updateNote = (issueId) => {
    db.collection('issues').doc(issueId).update({ note })
      .then(() => {
        setMachine(prevMachine => ({
          ...prevMachine,
          issues: prevMachine.issues.map(issue => issue.id === issueId ? { ...issue, note } : issue)
        }));
      })
      .catch(error => console.error('Error updating note:', error));
  };

  const updateSeverity = (issueId, newSeverity) => {
    db.collection('issues').doc(issueId).update({ severity: newSeverity })
      .then(() => {
        setMachine(prevMachine => ({
          ...prevMachine,
          issues: prevMachine.issues.map(issue => issue.id === issueId ? { ...issue, severity: newSeverity } : issue)
        }));
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
      <div className="machine-header">
        <div className="machine-info">
          <h1>{machine.name}</h1>
          <p>Status: {machine.status}</p>
          <p>Worker: {machine.worker_name}</p>
          <p>Total Time: {machine.total_time}</p>
          <p>Inspection Time: {machine.inspection_total_time}</p>
          <p>Servicing Time: {machine.servicing_total_time}</p>
        </div>
        <div className="machine-image">
          <input type="file" onChange={(event) => uploadPhoto(event, 'machine')} />
          {machine.photo && <img src={machine.photo} alt="Machine" style={{ width: '100px', height: '100px' }} />}
        </div>
      </div>
      <h2>Issues:</h2>
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
            <input type="file" onChange={(event) => uploadPhoto(event, 'issue', issue.id)} />
            {issue.photo && <img src={issue.photo} alt="Issue" style={{ width: '50px', height: '50px' }} />}
            <input
              type="text"
              value={issue.trackingNumber || ''}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Tracking Number"
            />
            <select value={issue.carrierCode || ''} onChange={(e) => setCarrierCode(e.target.value)}>
              <option value="">Select Carrier</option>
              <option value="ups">UPS</option>
              <option value="usps">USPS</option>
              <option value="fedex">FedEx</option>
              <option value="stamps_com">Stamps.com</option>
            </select>
            <button onClick={() => updateTrackingInfo(issue.id)}>Update Tracking Info</button>
            {issue.trackingData && (
              <div>
                <h3>Tracking Info:</h3>
                <pre>{JSON.stringify(issue.trackingData, null, 2)}</pre>
              </div>
            )}
          </li>
        ))}
      </ul>
      <h2>Inspection Timer</h2>
      <div className="button-container">
        <button className="button" onClick={startInspectionTimer}>Start Inspection</button>
        <button className="button" onClick={pauseInspectionTimer}>Pause Inspection</button>
        <button className="button" onClick={stopInspectionTimer}>Stop Inspection</button>
      </div>
      <h2>Servicing Timer</h2>
      <div className="button-container">
        <button className="button" onClick={startServicingTimer}>Start Servicing</button>
        <button className="button" onClick={pauseServicingTimer}>Pause Servicing</button>
        <button className="button" onClick={stopServicingTimer}>Stop Servicing</button>
      </div>
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
      <input type="file" onChange={(e) => setIssueImage(e.target.files[0])} />
      <button className="button" onClick={addIssue}>Add Issue</button>
      <Link to="/" className="button">Back</Link>
    </div>
  );
};

export default MachineDetail;

function getIssueColor(severity) {
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
}

function secondsToHMS(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}:${m < 10 ? '0' : ''}${m}`;
}
