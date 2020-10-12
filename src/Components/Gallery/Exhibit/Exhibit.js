import * as React from 'react';
import './Exhibit.scss'
import Grid from '@material-ui/core/Grid';
import { getSection } from '../../Shared/Constants';
import Carousel from 'react-image-carousel';

function importAll(r) {
  return r.keys().map(r);
}

/*
  Loads all images based on the URL parameter (so you can link to a specific exhibit)
*/
let images = [];
function loadImages(exhibitName) {
  let sectionLabel = getSection();

  switch (sectionLabel) {
    //this a switch because "require.context()" cannot take a variable - it needs to be statically analyzed
    case 'miniatures':
      images = importAll(require.context('../../../Images/Miniatures/', true, /\.(png|jpe?g|svg)$/));
      break;
    case 'terrain':
      images = importAll(require.context('../../../Images/Terrain/', true, /\.(png|jpe?g|svg)$/));
      break;
    default: //they're in other
      images = importAll(require.context('../../../Images/Other/', true, /\.(png|jpe?g|svg)$/));
      break;
  }

  console.log(exhibitName)
  console.log( images.filter(image => image.indexOf(exhibitName)));

}

export default function Exhibit(props) {

  //load the data for the image they selected/image in the url. 
  let exhibitData = window.location.href.substring( window.location.href.lastIndexOf('exhibit/')+8, window.location.href.length );
  loadImages(exhibitData);

  return (
    <main id="dark-background">
      <Grid className='gridContainer' container spacing={4}>
        {images.map((image, index) => (
          <div className="imageContainer" key={image} >
            <img className="previewLink" alt={image.key} src={image} ></img>
          </div>
        ))}
      </Grid>



      {/* <div className="previewLink">
        <Carousel images={images}
          thumb={true}
          loop={true}
          autoplay={3000} />
      </div> */}

    </main>
  );
}