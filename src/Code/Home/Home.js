import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import './Home.scss';
import Banner from './Banner/Banner';
import FeaturedPost from './FeaturedPost/FeaturedPost';
import ZoomedWormBanner from "../../Images/Miniatures/PurpleWorm/ZoomedBannerPurpleWorm3.jpg";
import { Link } from 'react-router-dom';
import * as Constants from "../Shared/Constants.js";

//for importing a folder
// function importAll(r) {
//   let images = {};
//   r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
//   return images;
// }

// const images = importAll(require.context('../Miniatures/PurpleWorm', false, /\.(png|jpe?g|svg)$/));

const banner = {
  title: 'Art That Escapes Reality',
  description: "Need a break from the real world? Come explore some weird places and even weirder creatures.",
  image: ZoomedWormBanner
};


export default function Home() {

  return (
    <main>
      <Banner post={banner} />
      <Grid container spacing={4}>
        {Constants.sections.map((section) => (

          section.title !== 'Home' && (<FeaturedPost key={section.title} post={section} component={Link} to={section.url} />) 
        
        ))}
      </Grid>
    </main>
  )
}
