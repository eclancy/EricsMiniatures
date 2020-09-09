import * as React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import './Home.scss';
import Header from '../Header';
import Banner from '../Banner';
import FeaturedPost from '../FeaturedPost/FeaturedPost';
import Footer from '../Footer/Footer';
import ZoomedWormBanner from "../../Images/Miniatures/PurpleWorm/ZoomedBannerPurpleWorm3.jpg";
import Waystone from "../../Images/Terrain/Waystone/Waystone1.jpg";
import GirlOnBeach from "../../Images/Miniatures/GirlOnBeach.jpg";

//for importing a folder
// function importAll(r) {
//   let images = {};
//   r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
//   return images;
// }

// const images = importAll(require.context('../Miniatures/PurpleWorm', false, /\.(png|jpe?g|svg)$/));

const sections = [
  { title: 'Miniatures', url: '#' },
  { title: 'Terrain', url: '#' },
  { title: 'Other Projects', url: '#' },
];

const banner = {
  title: 'Art That Escapes Reality',
  description: "Need a break from the real world? Come explore some weird places and even weirder creatures.",
  image: ZoomedWormBanner
};

const featuredLinks = [
  {
    title: 'Miniatures',
    date: 'Aug 4',
    description:
      'Hand painted miniature creatures, characters, and props. ',
    image: GirlOnBeach
  },
  {
    title: 'Terrain',
    date: 'Aug 4',
    description:
      'Sculpted from clay, foam, or even trash! Realistic landscaps crafted and painted from basic every day items.',
    image: Waystone
  },
];

export default function Home() {

  return (
    <React.Fragment>
      <CssBaseline />
        <div id="main-wrapper">
          <Container maxWidth="lg">
            <Header sections={sections} />
            <main>
              <Banner post={banner} />
              <Grid container spacing={4}>
                {featuredLinks.map((post) => (
                  <FeaturedPost key={post.title} post={post} />
                ))}
              </Grid>

            </main>
          </Container>
          <Footer />
        </div>
    </React.Fragment>
  );
}
