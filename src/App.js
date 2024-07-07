import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import MachineDetail from './components/MachineDetail';
import MachineForm from './components/MachineForm';

const App = () => {
    return (
        <Router>
            <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/machines/:id" component={MachineDetail} />
                <Route path="/add-machine" component={MachineForm} />
            </Switch>
        </Router>
    );
};

export default App;
