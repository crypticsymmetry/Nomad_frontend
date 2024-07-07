import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { auth, onAuthStateChanged } from './firebaseConfig';
import Home from './components/Home';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  return (
    <Router>
      <Switch>
        <PrivateRoute exact path="/" component={Home} user={user} />
        <Route path="/login" component={Login} />
      </Switch>
    </Router>
  );
};

export default App;
