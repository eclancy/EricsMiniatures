import React, { useLayoutEffect, useState } from 'react';
import './Gallery.scss'
import Banner from '../Home/Banner/Banner';
import Grid from '@material-ui/core/Grid';
import debounce from 'lodash.debounce';
import Pagination from '@material-ui/lab/Pagination';
import { makeStyles } from '@material-ui/core/styles';
import { useEffect } from 'react'

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
let images = [];
let bannerInfo = {};

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(2),
      justifyContent: "center",
      display: 'flex'
    },
  },
}));

//import all pictures for the given page
function importAll(r) {
  return r.keys().map(r);
}

//If user clicks an image, look at all the pictures from a particular set
function visitExhibit(props, section, image) {
  image = image.substring(14, image.indexOf('1'));

  props.history.push({
    pathname: '/gallery/' + section + '/exhibit/' + image,
    state: {
      exhibitName: (image),
      sectionLabel: section,
    }
  });
}

//fisher-yates shuffle algorithm for randomizing images on the page
// function shuffle(a) {
//   var j, x, i;
//   for (i = a.length - 1; i > 0; i--) {
//     j = Math.floor(Math.random() * (i + 1));
//     x = a[i];
//     a[i] = a[j];
//     a[j] = x;
//   }
//   return a;
// }

//load all the images for the given gallery

function loadImages(sectionLabel) {
  //this a switch because "require.context()" cannot take a variable - it needs to be statically analyzed
  switch (sectionLabel) {
    case 'miniatures':
      bannerInfo = MinisBanner;
      return importAll(require.context('../../Images/Miniatures/', true, /1\.(png|jpe?g|svg)$/));
    case 'terrain':
      bannerInfo = TerrainBanner;
      return importAll(require.context('../../Images/Terrain/', true, /1\.(png|jpe?g|svg)$/));
    case 'other':
      bannerInfo = OtherBanner;
      return importAll(require.context('../../Images/Other/', true, /1\.(png|jpe?g|svg)$/));
    default: //default to other if they've somehow ended up with a random url in the gallery
      bannerInfo = OtherBanner;
      return importAll(require.context('../../Images/Other/', true, /1\.(png|jpe?g|svg)$/));
  }
  //randomize the images
  // images = shuffle(images);
}

//function to listen for window resizing, and limit the rerender calls
function useWindowSize() {
  const [size, setSize] = useState([0]);
  useLayoutEffect(() => {
    const debouncedUpdateSize = debounce(function updateSize() {
      setSize([window.innerWidth]);
    }, 10);

    window.addEventListener('resize', debouncedUpdateSize);
    debouncedUpdateSize();
    return () => window.removeEventListener('resize', debouncedUpdateSize);
  }, []);
  return size;
}

export default function Gallery(props) {

  const screenWidth = (useWindowSize() > 990 ? 'large' : 'slim');
  const section = props.match.params.id;
  const classes = useStyles();
  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  //loads the next ten images, as well as scrolling to top and pushing the page change to the history
  const changePage = (props, section, selectedPageNumber) => {
    props.history.push({
      pathname: '/gallery/' + section,
      state: { pageNumber: selectedPageNumber }
    });
    setImagesRendered(images.slice((selectedPageNumber - 1) * 10, (selectedPageNumber * 10)));
    scrollTop();
  }

  //all the images in the gallery, and the images we're rendering based on the user's selected page
  images = loadImages(props.match.params.id);
  if(!props.state.pageNumber) {props.state.pageNumber = 1}
  let [imagesRendered, setImagesRendered] = useState(
    images.slice(props.state.pageNumber - 1 * 10), (props.state.pageNumber * 10)
  );

  console.log(props.history)


  // let [pageNumber, setPageNumber] = useState(pageNumber !== null ? pageNumber : 1);
  //used to pick the ten relevant images to display, based on the user's selected page
  const renderImages = imagesRendered.map((image, index) => {
    return <div className="imageContainer" key={image} >
      <img className="previewLink" alt={image.key} src={image} onClick={() => visitExhibit(props, section, image)}></img>
    </div>
  });

  return (
    <main>
      <Banner bannerInfo={bannerInfo} className={"short " + screenWidth + section} />
      <Grid className='gridContainer' container spacing={4}>
        {renderImages}
      </Grid>

      <div className={classes.root}>
        <Pagination
          className={"paginationController"}
          color="primary"
          count={images.length % 10 === 0 ? images.length / 10 : Math.floor(images.length / 10) + 1}

          //loads the next ten images, as well as scrolling to top and pushing the page change to the history
          onChange={(event, selectedPageNumber) => changePage(props, section, selectedPageNumber)}
        />
      </div>

    </main>
  );
}

