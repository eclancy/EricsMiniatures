import * as React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import bannerAssets from '../../Shared/bannerAssets';
import { srcSetFor, mediaUrl } from '../../../api/client';
import './Banner.scss';

// The banner is the largest above-the-fold image, so it is a real <picture>
// rather than a CSS background: that lets the browser pick a width from srcset,
// start the download during HTML parsing, and treat it as the LCP candidate.
const SLIM_WIDTHS = [640, 960, 1280];
const LARGE_WIDTHS = [1280, 1600, 1920, 2560];
const SLIM_BREAKPOINT = '(max-width: 990px)';

export default function Banner(props) {
  const { bannerInfo, slot } = props;
  const art = bannerAssets[slot];

  return (
    <Paper id='banner' className={props.className} >
      {art && (
        <picture className="banner__picture">
          <source media={SLIM_BREAKPOINT} srcSet={srcSetFor(art.slim.src, SLIM_WIDTHS)} sizes="100vw" />
          <source srcSet={srcSetFor(art.large.src, LARGE_WIDTHS)} sizes="100vw" />
          <img
            className="banner__image"
            src={mediaUrl(art.large.src, { width: 1600 })}
            alt=""
            width={art.large.width}
            height={art.large.height}
            // Above the fold on every page: never lazy, always high priority.
            loading="eager"
            fetchpriority="high"
            decoding="async"
            style={{ backgroundImage: art.large.blur ? `url(${art.large.blur})` : undefined }}
          />
        </picture>
      )}

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
  bannerInfo: PropTypes.object,
  /** Which artwork to show; a key of bannerAssets. */
  slot: PropTypes.string,
  className: PropTypes.string,
};
