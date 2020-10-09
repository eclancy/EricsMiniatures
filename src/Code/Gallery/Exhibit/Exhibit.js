import * as React from 'react';
import './Exhibit.scss'
import Grid from '@material-ui/core/Grid';
import { getSection } from '../../Shared/Constants';



function importAll(r) {
  return r.keys().map(r);
}

let images = [];
function loadImages(props, exhibitName) {
  console.log(exhibitName)
  let sectionLabel = props.location.state.sectionLabel;
  console.log(sectionLabel)
  
  switch (sectionLabel) {   
    //this a switch because "require.context()" cannot take a variable - it needs to be statically analyzed
    case 'miniatures':
      images = importAll(require.context('../../../Images/Miniatures/', true, /Artificer[1-9]*.[1-9a-z]*.(png|jpe?g|svg)$/ ));
      break;
    case 'terrain':
      images = importAll(require.context('../../../Images/Terrain/', true, /1\.(png|jpe?g|svg)$/));
      break;
    default: //they're in other
      images = importAll(require.context('../../../Images/Other/', true, /1\.(png|jpe?g|svg)$/));
      break;
  }

  console.log(images)

  // //this a switch because "require.context()" cannot take a variable - it needs to be statically analyzed
  // switch (sectionLabel) {
  //   case 'miniatures':
  //     images = importAll(require.context('../../../Images/miniatures/', true, /1\.(png|jpe?g|svg)$/));
  //     break;
  //   case 'terrain':
  //     images = importAll(require.context('../../../Images/terrain/', true, /1\.(png|jpe?g|svg)$/));
  //     break;
  //   case 'other':
  //     images = importAll(require.context('../../../Images/other/', true, /1\.(png|jpe?g|svg)$/));
  //     break;
  //   default:
  //     props.history.push('/');
  //     break; //if they load without a section, redirect them to home
  // }
}

export default function Exhibit(props) {

  //load the data for the image they selected. If they're opening this page without data, redirect them to the gallery
  let exhibitData = props.location.state.exhibitName;
  if (exhibitData === undefined) {
    props.history.push('/gallery/' + getSection() + '/');
  }
  loadImages(props, exhibitData);

  return (
    <main>

      <Grid className='gridContainer' container spacing={4}>

        {images.map((image, index) => (
          <div className="imageContainer" key={image} >
            <img className="previewLink" alt={image.key} src={image} ></img>
          </div>
        ))}
      </Grid>
    </main>
  );
}