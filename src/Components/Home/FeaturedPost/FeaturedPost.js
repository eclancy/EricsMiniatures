import * as React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Hidden from '@material-ui/core/Hidden';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import './FeaturedPost.scss';
import { Link } from 'react-router-dom';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flex: 1,
    height: '230px',
  },
  cardDetails: {
    flex: 1,
  },
  cardMedia: {
    width: 160,
  },
  ArrowForwardIcon: {
    marginTop: '30px',
  },

});

export default function FeaturedPost(props) {
  const classes = useStyles();
  const { post } = props;

  return (
    <Grid item xs={12} md={6} className={props.className}>
      <CardActionArea component={Link} to={post.url} className={'featuredCard'}>
          <Card className={classes.card} >
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
            <Hidden >
              <CardMedia
                className={classes.cardMedia}
                image={post.image}
                title={post.imageTitle}
              />
            </Hidden>
          </Card>
      </CardActionArea>
    </Grid>
  );
}

FeaturedPost.propTypes = {
  post: PropTypes.object,
};
