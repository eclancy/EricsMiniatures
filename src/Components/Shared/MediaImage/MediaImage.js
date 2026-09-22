import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { mediaUrl, srcSetFor } from '../../../api/client';
import './MediaImage.scss';

// Widths the grid and lightbox ask for. The server snaps anything else to the
// nearest allowed size, so these just need to be sensible - not exhaustive.
const GRID_WIDTHS = [320, 480, 640, 960, 1280];
const FULL_WIDTHS = [640, 960, 1280, 1600, 1920, 2560];

/**
 * A photo from the media API.
 *
 * Renders at an explicit aspect ratio so the page never reflows while images
 * load, shows the inline blur placeholder from the index until the real file
 * arrives, and leaves format selection to the server via content negotiation.
 */
export default function MediaImage({ photo, alt, sizes, variant, eager, playAnimation, className, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!photo) return null;

  const widths = variant === 'full' ? FULL_WIDTHS : GRID_WIDTHS;
  const fallbackWidth = variant === 'full' ? 1280 : 640;
  const ratio = photo.width && photo.height ? `${photo.width} / ${photo.height}` : undefined;

  // Video has no still derivative; play it inline instead.
  if (photo.kind === 'video') {
    return (
      <video
        className={`mediaImage mediaImage--video ${className || ''}`}
        style={{ aspectRatio: ratio }}
        src={mediaUrl(photo.src)}
        controls
        muted
        loop
        playsInline
        preload="none"
        onClick={onClick}
      />
    );
  }

  // Grid tiles get a still frame by default, so a gallery of GIFs does not cost
  // megabytes. The lightbox always animates, and callers can opt in explicitly
  // (the home page section cards, which used to be animated CSS backgrounds).
  const animated = photo.animated && (variant === 'full' || playAnimation);

  // A full view exists to show the picture, so it is never cropped. Grid tiles
  // fill their box instead, which keeps rows tidy.
  const contain = variant === 'full';

  return (
    <div
      className={`mediaImage__frame ${loaded ? 'is-loaded' : ''} ${contain ? 'is-contain' : ''} ${
        failed ? 'is-failed' : ''
      } ${className || ''}`}
      style={{
        aspectRatio: ratio,
        backgroundImage: photo.blur && !contain ? `url(${photo.blur})` : undefined,
      }}
    >
      <img
        className="mediaImage"
        src={mediaUrl(photo.src, { width: fallbackWidth, animated })}
        srcSet={animated ? undefined : srcSetFor(photo.src, widths)}
        sizes={animated ? undefined : sizes}
        width={photo.width || undefined}
        height={photo.height || undefined}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchpriority={eager ? 'high' : undefined}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        onClick={onClick}
      />

      {/* A cold derivative is resized on first request, which takes a couple of
          seconds. The spinner fades in only after a short delay, so an image
          served from cache never flashes one. */}
      {!loaded && !failed && (
        <span className="mediaImage__spinner" role="status" aria-label="Loading image" />
      )}

      {failed && (
        <span className="mediaImage__failed" role="status">
          Image unavailable
        </span>
      )}
    </div>
  );
}

MediaImage.propTypes = {
  photo: PropTypes.object,
  alt: PropTypes.string.isRequired,
  sizes: PropTypes.string,
  variant: PropTypes.oneOf(['grid', 'full']),
  eager: PropTypes.bool,
  /** Animate an animated source even in a grid tile. */
  playAnimation: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

MediaImage.defaultProps = {
  variant: 'grid',
  sizes: '100vw',
};
