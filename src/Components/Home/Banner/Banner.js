import * as React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import './Banner.scss';
import {getSection} from '../../Shared/Constants';

function getBackgroundImages(){
  let sectionLabel = getSection();

  switch (sectionLabel) {
    //this a switch because "require.context()" cannot take a variable - it needs to be statically analyzed
    case 'miniatures':
      break;
    case 'terrain':
      break;
      case 'other':
      break;
    default: //they're in home
      break;
  }
}

export default function Banner(props) {
  const { bannerInfo } = props;

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
            {bannerInfo.title}
          </Typography>
          <Typography variant="h5" color="inherit" paragraph className="flavorText">
            {bannerInfo.description}
          </Typography>

        </Grid>
      </div>
    </Paper>
  );
}

Banner.propTypes = {
  post: PropTypes.object,
};
