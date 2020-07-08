import {Route, BrowserRouter} from 'react-router-dom';
import React from 'react';
import Home from './pages/Home'
import CreatePoint from './pages/CreatePoint'
import ListPoints from './pages/ListPoints'

const Routes =()=>{

    return(
        <BrowserRouter>
            <Route component={Home}  path="/" exact/>
            <Route component={CreatePoint} exact path="/create-point"/>
            <Route component={ListPoints} exact path="/list-point"/>
        </BrowserRouter>
    )

}

export default Routes;