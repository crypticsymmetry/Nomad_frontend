import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import axios from 'axios';

// Set the base URL for Axios requests
axios.defaults.baseURL = 'https://nomad-backend-1.onrender.com'; // Replace with your Render backend URL

ReactDOM.render(<App />, document.getElementById('root'));
