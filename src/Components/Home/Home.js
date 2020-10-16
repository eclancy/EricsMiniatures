import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import './Home.scss';
import Banner from './Banner/Banner';
import FeaturedPost from './FeaturedPost/FeaturedPost';
import {sections} from "../Shared/Constants.js";

const banner = {
  title: 'Art That Escapes Reality',
  description: "Need a break from the real world? Come explore some weird places and even weirder creatures.",
};


export default function Home() {

  return (
    <main className='main'>
      <Banner bannerInfo={banner} className="homeBackgroundImage"/>
      <div className="linkCardsContainer">
        <Grid className='linksGrid' container spacing={4}>

          {sections.map((section, index) => (
            /*Determine if this is there is an open space next to the last card (odd number of cards). 
              If there is, expand the final card to fill in the empty space. */
            <FeaturedPost className={(index === sections.length - 1 && sections.length % 2) ? 'expand' : ''} key={section.title} post={section} />
          ))}
        </Grid>
      </div>
    </main>
  )
}
