import * as React from 'react';
import './Gallery.scss'
import Banner from '../Home/Banner/Banner';
import { makeStyles } from '@material-ui/core/styles';
import SlimBanner from '../../Images/BannerImages/ClockworkDragonBannerHighContrast.jpg';
import LongBanner from '../../Images/BannerImages/SludgeMonstrosity.jpg';
import Grid from '@material-ui/core/Grid';


const MinisBanner = {
  title: 'Hand Painted Miniatures',
  description: "Creatures of all shapes and sizes - some are nice, some are not...",
};
const TerrainBanner = {
  title: 'CHANGE THIS TERRAIN',
  description: "CHANGE THIS. Sculpted from clay, foam, or even trash! Realistic landscaps crafted and painted from basic every day items.",
};
const OtherBanner = {
  title: 'CHANGE THIS OTHER',
  description: "CHANGE THIS. Other projects I've worked on, including 3d printing, creating games, and anything else I think is cool enough to share.",
};
let bannerInfo = {};

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
    bannerInfo = MinisBanner;
    return 'Miniatures'
  }
  else if (window.location.href.includes('Terrain')) {
    bannerInfo = TerrainBanner;
    return 'Terrain'
  }
  else if (window.location.href.includes('Other')) {
    bannerInfo = OtherBanner;
    return 'Other'
  }
}

function importAll(r) {
  return r.keys().map(r);
}


let images = [];
function loadImages(e) {
  //have to make this a switch because "require.context()" cannot take a variable - needs to be statically analyzed
  switch (getSection()) {
    case 'Miniatures':
      // images = importAll(require.context('../../Images/Miniatures/', false, /\.(png|jpe?g|svg)$/));
      images = importAll(require.context('../../Images/Miniatures/', true, /1\.(png|jpe?g|svg)$/));
      break;
    case 'Terrain':
      images = importAll(require.context('../../Images/Terrain/', true, /1\.(png|jpe?g|svg)$/));
      break;
    default: //default to other if they've somehow ended up with a random url in the gallery
      images = importAll(require.context('../../Images/Other/', true, /1\.(png|jpe?g|svg)$/));
      break;
  }
}

export default function Gallery() {
  const classes = useStyles();
  loadImages();

  return (


    <main>
      <Banner bannerInfo={bannerInfo} className={"short " + classes.homeBackgroundImage} />

      <Grid className='gridContainer' container spacing={4}>


        {images.map((image, index) => (
          <div className="imageContainer">
            <img className="previewLink" alt={image.key} key={index} src={image} onClick={loadImages} ></img>
          </div>
        ))}


      </Grid>


    </main>


  );
}
