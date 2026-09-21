import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import './Home.scss';
import Banner from './Banner/Banner';
import FeaturedPost from './FeaturedPost/FeaturedPost';
import { sections as staticSections } from '../Shared/Constants.js';
import { fetchSections } from '../../api/client';

const banner = {
  title: 'Art That Escapes Reality',
  description: "Need a break from the real world? Come explore some weird places and even weirder creatures.",
};

export default function Home() {
  // Render the copy immediately from the static list, then fill in preview
  // photos and project counts once the API answers.
  const [sections, setSections] = useState(staticSections);

  useEffect(() => {
    let cancelled = false;
    fetchSections()
      .then((result) => {
        if (!cancelled && result.sections?.length) {
          setSections(
            staticSections.map((section) => {
              const live = result.sections.find((s) => s.slug === section.slug);
              return live ? { ...section, preview: live.preview, projectCount: live.projectCount } : section;
            })
          );
        }
      })
      .catch(() => {
        /* the static copy is already on screen; previews are a nice-to-have */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className='main'>
      <Banner bannerInfo={banner} slot="home" className="homeBackgroundImage"/>
      <div className="linkCardsContainer">
        <Grid className='linksGrid' container spacing={4} justify="center">

          {sections.map((section, index) => (
            /*Determine if there is an open space next to the last card (odd number of cards).
              If there is, expand the final card to fill in the empty space. */
            <FeaturedPost
              className={(index === sections.length - 1 && sections.length % 2) ? 'expand' : ''}
              key={section.title}
              post={section}
              eager={index < 2}
            />
          ))}
        </Grid>
      </div>
    </main>
  )
}
