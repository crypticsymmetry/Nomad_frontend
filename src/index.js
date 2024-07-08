import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { auth } from './firebaseConfig';

// Set the base URL for Axios requests
axios.defaults.baseURL = 'https://nomad-backend-1.onrender.com'; // Replace with your Render backend URL

// Sign in the user anonymously
auth.signInAnonymously().catch(error => {
    console.error('Error signing in anonymously:', error);
});

ReactDOM.render(<App />, document.getElementById('root'));
