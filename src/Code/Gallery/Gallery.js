import * as React from 'react';
import Banner from '../Home/Banner/Banner';
import { makeStyles } from '@material-ui/core/styles';
import SlimBanner from '../../Images/BannerImages/ClockworkDragonBannerHighContrast.jpg';
import LongBanner from '../../Images/BannerImages/SludgeMonstrosity.jpg';
import Grid from '@material-ui/core/Grid';

const banner = {
  title: 'Hand Painted Miniatures',
  description: "Creatures of all shapes and sizes - some are nice, some are not...",
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

function getSection() {
  if (window.location.href.includes('Miniatures')) {
    return 'Miniatures'
  }
  else if (window.location.href.includes('Terrain')) {
    return 'Terrain'
  }
  else if (window.location.href.includes('Other')) {
    return 'Other'
  }
}

// function importAll(r) {
//   let images = {};
//   r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
//   return images;
// }


export default function Gallery() {

  const classes = useStyles();
  const imagesPath = '../../Images/' + getSection();
  // const images = importAll(require.context( section, false, /\.(png|jpe?g|svg)$/));
  // console.log(images);

  return (


    <main>
      <Banner post={banner} className={"short " + classes.homeBackgroundImage} />

      <Grid className='linkCardContainer' container spacing={4}>

        {imagesPath}

        {/* { images.map((section, index) => ( 

        ))}  */}
      </Grid>


    </main>


  );
}
