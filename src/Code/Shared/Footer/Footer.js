import * as React from 'react';
import PropTypes from 'prop-types';
import Container from '@material-ui/core/Container';
import GitHubIcon from '@material-ui/icons/GitHub';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import './Footer.scss';

const socials = {
  social: [
    { label: "Check out this website's code on GitHub", icon: GitHubIcon, link: "https://github.com/eclancy" },
    { label: "I'm a developer - reach out to me on LinkedIn!", icon: LinkedInIcon, link: "https://www.linkedin.com/in/ericclancy/" },
  ],
};

export default function Footer(props) {

  return (
    <footer className="footer">
      <Container >
        <Grid item >
          {socials.social.map((links) => (
            <Link variant="body1" href="#" key={links.label}>
              <Grid container  alignItems="center" justify="center" className={"footerLink"}>
                <Grid item className={"icon"}>
                  <links.icon />
                </Grid>
                <Grid item className={"text"}>{links.label}</Grid>
              </Grid>
            </Link>
          ))}
        </Grid>
      </Container>
    </footer>
  );
}

Footer.propTypes = {
  description: PropTypes.string,
  title: PropTypes.string,
};
