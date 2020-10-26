import * as React from 'react';
import PropTypes from 'prop-types';
import GitHubIcon from '@material-ui/icons/GitHub';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import './Footer.scss';
import { useLocation } from 'react-router-dom';

const socials = {
  social: [
    { label: "Check out this website's code on GitHub", icon: GitHubIcon, link: "https://github.com/eclancy" },
    { label: "I'm a developer - reach out to me on LinkedIn!", icon: LinkedInIcon, link: "https://www.linkedin.com/in/ericclancy/" },
  ],
};

export default function Footer(props) {
  const location = useLocation();

  return (
    <footer className={location.pathname.includes('exhibit') ? "footer darkMode" : "footer"}>
      {socials.social.map((links) => (
        <Link className="footerLinkContainer" variant="body1" href="#" key={links.label}>
          <Grid container alignItems="center" justify="center" className={"footerLink"}>
            <links.icon className={"icon " + (links.icon === GitHubIcon ? 'githubLinkFix' : '')} />
            <p className={"text"}>{links.label}</p>
          </Grid>
        </Link>
      ))}
    </footer>
  );
}

Footer.propTypes = {
  description: PropTypes.string,
  title: PropTypes.string,
};
