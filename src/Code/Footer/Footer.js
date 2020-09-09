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
    { name: "Check out this website's code on GitHub", icon: GitHubIcon, link: "https://github.com/eclancy" },
    { name: "I'm a developer, reach out to me on LinkedIn!", icon: LinkedInIcon, link: "https://www.linkedin.com/in/ericclancy/" },
  ],
};

export default function Footer(props) {

  return (
    <footer class="footer">
      <Container maxWidth="lg">
        <Grid item xs={12} md={4}>
          {socials.social.map((network) => (
            <Link variant="body1" href="#" key={network}>
              <Grid container direction="row" spacing={1} alignItems="center">
                <Grid item>
                  <network.icon />
                </Grid>
                <Grid item>{network.name}</Grid>
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
