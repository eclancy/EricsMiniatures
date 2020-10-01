import * as React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import './Banner.scss';

export default function Banner(props) {
  const { post } = props;

  return (
    <Paper id='banner' className={props.className} >
      <div id="overlay">
        <Grid item md={7} className={'bannerText'}>
          <Typography
            component="h1"
            variant="h3"
            color="inherit"
            gutterBottom
            className={'title'}
          >
            {post.title}
          </Typography>
          <Typography variant="h5" color="inherit" paragraph className="flavorText">
            {post.description}
          </Typography>

        </Grid>
      </div>
    </Paper>
  );
}

Banner.propTypes = {
  post: PropTypes.object,
};
