import * as React from 'react';
import './Exhibit.scss'
import { Fab } from '@material-ui/core';
import AwesomeSlider from 'react-awesome-slider';
import AwsSliderStyles from 'react-awesome-slider/src/styles.js';

function importAll(r) {
  return r.keys().map(r);
}

//If user clicks an image, look at all the pictures from a particular set
function backToGallery(props, sectionLabel) {

  props.history.push({
    pathname: '/gallery/' + sectionLabel
  });
}

// Loads all images based on the URL parameter (so you can link to a specific exhibit)
function loadImages(sectionLabel, exhibitName) {
  let images;
  switch (sectionLabel) {
    //this a switch because "require.context()" cannot take a variable - it needs to be statically analyzed
    case 'miniatures':
      images = importAll(require.context('../../../Images/Miniatures/', true, /\.(png|jpe?g|svg|gif)$/));
      break;
    case 'terrain':
      images = importAll(require.context('../../../Images/Terrain/', true, /\.(png|jpe?g|svg|gif)$/));
      break;
    default: //they're in other
      images = importAll(require.context('../../../Images/Other/', true, /\.(png|jpe?g|svg|gif)$/));
      break;
  }
  return images.filter(image => image.includes(exhibitName));

}

export default function Exhibit(props) {
  //load the data for the image they selected/image in the url. 
  let exhibitData = window.location.href.substring(window.location.href.lastIndexOf('exhibit/') + 8, window.location.href.length);
  let images = loadImages(props.match.params.id, exhibitData);

  return (
    <main id="dark-background">

      <div className="image-container">
        {images.length === 1 &&
          <img src={images[0]} alt={images[0]} className="exhibitImageSingle"></img>
        }

        {/* Render a Carousel if there is more than one image */}
        {images.length > 1 &&
          <AwesomeSlider cssModule={AwsSliderStyles}>
            {images.map((section, index) => (
              <div key={images[index]} data-src={images[index]} className="exhibitImage" />
            ))}
          </AwesomeSlider>
        }
      </div>

      <Fab className="galleryButton" variant="extended" onClick={() => backToGallery(props, props.match.params.id)}> Back to Gallery </Fab>

    </main>

  );
}