import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Header from './Code/Shared/Header/Header';
import Footer from './Code/Shared/Footer/Footer';
import * as Constants from './Code/Shared/Constants'

// Pages
import Home from './Code/Home/Home';
import Gallery from './Code/Gallery/Gallery';

import CssBaseline from '@material-ui/core/CssBaseline';
import Exhibit from './Code/Gallery/Exhibit/Exhibit';

function App() {
  return (
    <BrowserRouter>
      <React.Fragment>
        <CssBaseline />
        <div id="main-wrapper">
          <Header sections={Constants.sections} />
          {/* Routing for the various pages rendered inside the header and footer */}
          <Switch>
            <Route exact path="/" component={Home} />

            <Route path="/gallery/:id/exhibit/" component={Exhibit} />

            <Route exact path="/gallery/:id" component={Gallery} />

          </Switch>
          {/* End of routing */}
          <Footer />
        </div>
      </React.Fragment>
    </BrowserRouter>

  );
}
export default App;

