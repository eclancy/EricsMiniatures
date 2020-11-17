import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
// import ScrollIntoView from "./Components/Shared/ScrollIntoView";

// Pages
import Home from './Components/Home/Home';
import Gallery from './Components/Gallery/Gallery';
import Exhibit from './Components/Gallery/Exhibit/Exhibit';

import Header from './Components/Shared/Header/Header';
import Footer from './Components/Shared/Footer/Footer';

function App() {
  return (
    <BrowserRouter>
      {/* <ScrollIntoView> */}
        <React.Fragment>
          <CssBaseline />
          <div id="main-wrapper">
            <Header component={Header} />
            {/* Routing for the various pages rendered inside the header and footer */}
            <Switch>
              <Route exact path="/" component={Home} />

              <Route path="/gallery/:id/exhibit/" component={Exhibit} />

              <Route exact path="/gallery/:id" component={Gallery} />

              {/* if they have nonsensical url, redirect to home */}

            </Switch>
            {/* End of routing */}
            <Footer />
          </div>
        </React.Fragment>
      {/* </ScrollIntoView> */}
    </BrowserRouter>

  );
}
export default App;

