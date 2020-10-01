import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Header from './Code/Shared/Header/Header';
import Footer from './Code/Shared/Footer/Footer';
import * as Constants from './Code/Shared/Constants'

// Pages
import Home from './Code/Home/Home';
import Gallery from './Code/Gallery/Gallery';

import CssBaseline from '@material-ui/core/CssBaseline';

function App() {
  return (
    <BrowserRouter onUpdate={() => window.scrollTo(0, 0)}>

      <React.Fragment>
        <CssBaseline />
        <div id="main-wrapper">
            <Header sections={Constants.sections} />

            {/* Routing for the various pages rendered inside the header and footer */}
            <Route default exact path="/" component={Home} />

            <Route path="/Gallery" component={Gallery} />

            {/* End of routing */}
          <Footer />
        </div>
      </React.Fragment>
    </BrowserRouter>
  );
}
export default App;

