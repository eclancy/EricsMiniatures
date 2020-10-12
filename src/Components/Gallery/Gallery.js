import * as React from 'react';
import './Gallery.scss'
import Banner from '../Home/Banner/Banner';
import Grid from '@material-ui/core/Grid';
import {getSection} from '../Shared/Constants';


const MinisBanner = {
  title: 'Hand Painted Miniatures',
  description: "Creatures of all shapes and sizes - some are nice, some are not...",
};
const TerrainBanner = {
  title: 'Custom Built Terrain',
  description: "Every journey begins somewhere",
};
const OtherBanner = {
  title: 'Other Projects',
  description: "Check out some of the other things I spend time on",
};

//import all pictures for the given page
function importAll(r) {
  return r.keys().map(r);
}

//If user clicks an image, look at all the pictures from a particular set
function visitExhibit(props, image) {
image = image.substring(14, image.indexOf('1'));

  props.history.push({
    pathname: '/gallery/' + sectionLabel + '/exhibit/' + image,
    state: {
      exhibitName: (image),
      sectionLabel: sectionLabel,
    }
  });
}

//fisher-yates shuffle algorithm for randomizing images on the page
function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

//load all the images for the given gallery
let images = [], sectionLabel, bannerInfo = {};
function loadImages(e) {
  sectionLabel = getSection();
  //this a switch because "require.context()" cannot take a variable - it needs to be statically analyzed
  switch (sectionLabel) {
    case 'miniatures':
      bannerInfo = MinisBanner;
      images = shuffle(importAll(require.context('../../Images/Miniatures/', true, /1\.(png|jpe?g|svg)$/)));
      break;
    case 'terrain':
      bannerInfo = TerrainBanner;
      images = shuffle(importAll(require.context('../../Images/Terrain/', true, /1\.(png|jpe?g|svg)$/)));
      break;
    case 'other':
      bannerInfo = OtherBanner;
      images = shuffle(importAll(require.context('../../Images/Other/', true, /1\.(png|jpe?g|svg)$/)));
      break;
    default: //default to other if they've somehow ended up with a random url in the gallery
      bannerInfo = OtherBanner;
      images = shuffle(importAll(require.context('../../Images/Other/', true, /1\.(png|jpe?g|svg)$/)));
      break;
  }
}

export default function Gallery(props) {
  loadImages();

  return (
    <main>
      <Banner bannerInfo={bannerInfo} className="short galleryBackgroundImage" />

      <Grid className='gridContainer' container spacing={4}>
        {images.map((image, index) => (
          <div className="imageContainer" key={image} >
            <img className="previewLink" alt={image.key} src={image} onClick={() => visitExhibit(props, image)}></img>
          </div>
        ))}
      </Grid>
    </main>
  );
}

