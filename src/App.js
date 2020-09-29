import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Header from './Code/Shared/Header/Header';
import Footer from './Code/Shared/Footer/Footer';
import * as Constants from './Code/Shared/Constants'

// Pages
import Home from './Code/Home/Home';
import Gallery from './Code/Gallery/Gallery';

import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';

function App() {
  return (
    <BrowserRouter onUpdate={() => window.scrollTo(0, 0)}>

      <React.Fragment>
        <CssBaseline />
        <div id="main-wrapper">
          <Container maxWidth="lg">
            
          <Header sections={Constants.sections} />
            <main>

              <Route default exact path="/" component={Home} />

              <Route path="/gallery" component={Gallery} />

            </main>
          </Container>
          <Footer />
        </div>
      </React.Fragment>

    </BrowserRouter>
  );
}
export default App;

