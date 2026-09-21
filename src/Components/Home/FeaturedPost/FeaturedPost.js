import * as React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import './FeaturedPost.scss';
import { Link } from 'react-router-dom';
import MediaImage from '../../Shared/MediaImage/MediaImage';

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
  ArrowForwardIcon: {
    marginTop: '4px',
  },
});

export default function FeaturedPost(props) {
  const classes = useStyles();
  const { post, eager } = props;

  return (
    <Grid item xs={12} md={10} lg={8} className={props.className}>
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
                {post.projectCount ? `Browse ${post.projectCount} projects` : 'Check out the gallery'}
                <ArrowForwardIcon className={'arrowIcon'} />
              </Typography>
            </CardContent>
          </div>

          {/* Preview arrives from /api/sections; the card keeps its shape until then. */}
          <div className="sectionPreviewImage">
            <MediaImage
              photo={post.preview}
              alt={`${post.title} preview`}
              sizes="(max-width: 760px) 100vw, 300px"
              eager={eager}
              className="sectionPreviewImage__media"
            />
          </div>
        </Card>
      </CardActionArea>
    </Grid>
  );
}

FeaturedPost.propTypes = {
  post: PropTypes.object,
  className: PropTypes.string,
  eager: PropTypes.bool,
};
