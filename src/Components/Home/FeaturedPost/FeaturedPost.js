import * as React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import './FeaturedPost.scss';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flex: 1,
    height: '330px',
    minHeight: '330px',
    '@media (max-width: 760px)': {
      flexDirection: 'column',
      height: 'auto',
      minHeight: 'auto',
    },
  },
  cardDetails: {
    flex: 1,
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    '@media (max-width: 760px)': {
      padding: '20px',
    },
  },
  cardMedia: {
    width: 300,
    minWidth: 300,
    '@media (max-width: 760px)': {
      width: '100%',
      minWidth: 'auto',
      height: 240,
    },
  },
  ArrowForwardIcon: {
    marginTop: '4px',
  },
});

export default function FeaturedPost(props) {
  const classes = useStyles();
  const { post } = props;
  const { pathname } = useLocation();

  const previewImage = post.image || '/images/preview-1200x630.png';
  const previewTitle = post.title || "Eric's Miniatures";
  const previewDescription = post.description || "Eric's Miniatures — galleries, models, and painting inspiration.";

  // Only set Helmet metadata when the current path matches this post's url (or is a subpath)
  const normalizedPostUrl = post.url || '';
  const isActivePath =
    pathname === normalizedPostUrl ||
    (normalizedPostUrl !== '' && pathname.startsWith(normalizedPostUrl + '/'));

  return (
    <Grid item xs={12} md={10} lg={8} className={props.className}>
      {isActivePath && (
        <Helmet>
          <title>{previewTitle}</title>
          <meta property="og:title" content={previewTitle} />
          <meta property="og:description" content={previewDescription} />
          <meta property="og:image" content={previewImage} />
          <meta property="og:url" content={window.location.href} />
          <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
      )}

      <CardActionArea component={Link} to={post.url} className={'featuredCard'}>
        <Card className={classes.card}>
          <div className={classes.cardDetails}>
            <CardContent>
              <Typography component="h2" variant="h5">
                {post.title}
              </Typography>

              <Typography variant="subtitle1" paragraph>
                {post.description}
              </Typography>
              <Typography variant="subtitle1" className={'galleryLink'} color="primary">
                Check out the gallery <ArrowForwardIcon className={'arrowIcon'} />
              </Typography>
            </CardContent>
          </div>
          <CardMedia
            className={classes.cardMedia + " sectionPreviewImage"}
            image={post.image}
            title={post.imageTitle}
          />
        </Card>
      </CardActionArea>
    </Grid>
  );
}

FeaturedPost.propTypes = {
  post: PropTypes.object,
  className: PropTypes.string,
};
