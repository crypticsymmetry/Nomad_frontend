import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { auth } from './firebaseConfig';

// Sign in the user anonymously
auth.signInAnonymously().catch(error => {
    console.error('Error signing in anonymously:', error);
});

ReactDOM.render(<App />, document.getElementById('root'));
