import React, { useEffect } from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Helmet } from "react-helmet-async";

// Pages
import Home from "./Components/Home/Home";
import Gallery from "./Components/Gallery/Gallery";

import Header from "./Components/Shared/Header/Header";
import Footer from "./Components/Shared/Footer/Footer";

// Import your sections constants (adjust path if needed)
import sections from "./Components/Shared/Constants.js";


function getTitleForPath(pathname) {
  // exact match
  const exact = sections.find((s) => s.url === pathname);
  if (exact) return `${exact.title} – Eric's Miniatures`;

  // subpath match (e.g. /gallery/miniatures/123)
  const sub = sections.find((s) => s.url && pathname.startsWith(s.url + "/"));
  if (sub) return `${sub.title} – Eric's Miniatures`;

  // fallback default
  return "Eric's Miniatures";
}

function App() {
  const { pathname } = useLocation();
  const title = getTitleForPath(pathname);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return (
    <React.Fragment>
      <CssBaseline />

      {/* Centralized Helmet so title/meta update on every route change */}
      <Helmet>
        <title>{title}</title>
        <meta
          name="description"
          content="Eric's Miniatures — galleries, models, and painting inspiration."
        />
      </Helmet>

      <div id="main-wrapper">
        <Header component={Header} />

        {/* Routing for the various pages rendered inside the header and footer */}
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/gallery/:id" component={Gallery} />
          {/* add other routes here */}
        </Switch>
        {/* End of routing */}

        <Footer />
      </div>
    </React.Fragment>
  );
}

export default App;
