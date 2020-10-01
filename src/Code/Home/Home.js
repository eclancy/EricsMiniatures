import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import './Home.scss';
import Banner from './Banner/Banner';
import FeaturedPost from './FeaturedPost/FeaturedPost';
import * as Constants from "../Shared/Constants.js";
import { makeStyles } from '@material-ui/core/styles';

import LongBanner from '../../Images/BannerImages/ZoomedBannerPurpleWorm4.jpg';
import SlimBanner from '../../Images/BannerImages/FullBannerPurpleWormSlim.jpg'

const banner = {
  title: 'Art That Escapes Reality',
  description: "Need a break from the real world? Come explore some weird places and even weirder creatures.",
};

const useStyles = makeStyles((theme) => ({
  homeBackgroundImage: {
    ['@media (min-width:990px)']: {// eslint-disable-line no-useless-computed-key
      backgroundImage: `url(${LongBanner})`,
    },
    ['@media (max-width:990px)']: {// eslint-disable-line no-useless-computed-key
      backgroundImage: `url(${SlimBanner})`,
    },
  },
}));

export default function Home() {
  const classes = useStyles();

  return (
    <main className='main'>
      <Banner post={banner} className={classes.homeBackgroundImage} />
      <Grid className='linkCardContainer' container spacing={4}>

        {Constants.sections.map((section, index) => (

          /*Determine if this is there is an open space next to the last card (odd number of cards). 
            If there is, expand the final card to fill in the empty space. */
          <FeaturedPost className={(index === Constants.sections.length - 1 && Constants.sections.length % 2) ? 'expand' : ''} key={section.title} post={section} />
        ))}
      </Grid>
    </main>
  )
}

