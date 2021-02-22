import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Main from '../pages/main/index';
import Config from '../pages/config/index';

export default () => {
    return <Router>
        <Switch>
            <Route path="/main" component={Main}></Route>
            <Route path="/config" component={Config}></Route>
        </Switch>
    </Router>
}