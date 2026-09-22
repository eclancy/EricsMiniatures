import React, { Suspense, lazy, useEffect, useMemo } from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider, createTheme } from "@material-ui/core/styles";
import { Helmet } from "react-helmet-async";

import Header from "./Components/Shared/Header/Header";
import Footer from "./Components/Shared/Footer/Footer";
import useTheme from "./Components/Shared/useTheme";

import sections from "./Components/Shared/Constants.js";

// Route-level code splitting: the gallery pulls in the pagination and lightbox
// code, which the home page has no use for.
const Home = lazy(() => import("./Components/Home/Home"));
const Gallery = lazy(() => import("./Components/Gallery/Gallery"));

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
  const { theme, toggleTheme, isDark } = useTheme();

  // Material-UI components (pagination, cards, the menu) read their colours
  // from here rather than from the CSS tokens, so the palette has to follow
  // the same switch.
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          type: isDark ? 'dark' : 'light',
          primary: { main: isDark ? '#7fb2ff' : '#0d47a1' },
          background: {
            default: isDark ? '#16181c' : '#eaeded',
            paper: isDark ? '#1f2228' : '#ffffff',
          },
        },
      }),
    [isDark]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return (
    <ThemeProvider theme={muiTheme}>
      {/* CssBaseline paints the page background from the palette above. */}
      <CssBaseline />

      {/* Centralized Helmet so title/meta update on every route change */}
      <Helmet>
        <title>{title}</title>
        <meta
          name="description"
          content="Eric's Miniatures — galleries, models, and painting inspiration."
        />
        {/* Tells the browser to theme its own UI (address bar, form controls). */}
        <meta name="color-scheme" content={theme} />
        <meta name="theme-color" content={isDark ? '#16181c' : '#ffffff'} />
      </Helmet>

      <div id="main-wrapper">
        <Header isDark={isDark} onToggleTheme={toggleTheme} />

        {/* Routing for the various pages rendered inside the header and footer */}
        <Suspense fallback={<div className="routeFallback" aria-busy="true" />}>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/gallery/:id" component={Gallery} />
            {/* add other routes here */}
          </Switch>
        </Suspense>
        {/* End of routing */}

        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
