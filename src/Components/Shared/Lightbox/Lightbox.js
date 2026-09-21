import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import MediaImage from '../MediaImage/MediaImage';
import { mediaUrl } from '../../../api/client';
import './Lightbox.scss';

/**
 * Full-screen photo viewer for a single project.
 *
 * Replaces react-bnb-gallery, which is unmaintained and could not render the
 * per-photo captions or the responsive srcsets the media API serves.
 */
export default function Lightbox({ project, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex || 0);
  const containerRef = useRef(null);
  const previouslyFocused = useRef(null);

  // Memoised so the preload effect below does not re-run on every render.
  const photos = useMemo(() => project?.photos || [], [project]);
  const count = photos.length;

  const go = useCallback(
    (delta) => setIndex((current) => (count ? (current + delta + count) % count : 0)),
    [count]
  );

  useEffect(() => setIndex(startIndex || 0), [startIndex, project]);

  // Keyboard control, and restore focus to whatever opened the lightbox.
  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    containerRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowRight') go(1);
      else if (event.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKeyDown);

    // Stop the page behind the overlay from scrolling.
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus?.();
    };
  }, [go, onClose]);

  // Warm the neighbouring photos so arrowing through feels instant.
  useEffect(() => {
    if (!count) return;
    [index + 1, index - 1].forEach((i) => {
      const photo = photos[(i + count) % count];
      if (photo && photo.kind !== 'video') new Image().src = mediaUrl(photo.src, { width: 1280 });
    });
  }, [index, photos, count]);

  if (!project || !count) return null;

  const photo = photos[index];
  const caption = photo.caption || project.description;

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} photos`}
      tabIndex={-1}
      ref={containerRef}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button type="button" className="lightbox__close" onClick={onClose} aria-label="Close">
        &times;
      </button>

      {count > 1 && (
        <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => go(-1)} aria-label="Previous photo">
          &#8249;
        </button>
      )}

      <figure className="lightbox__stage">
        <MediaImage
          key={photo.file}
          photo={photo}
          variant="full"
          eager
          sizes="(max-width: 960px) 100vw, 80vw"
          alt={photo.caption || `${project.title} — photo ${index + 1} of ${count}`}
          className="lightbox__media"
        />

        <figcaption className="lightbox__caption">
          <h2 className="lightbox__title">{project.title}</h2>
          {caption && <p className="lightbox__text">{caption}</p>}
          {count > 1 && (
            <p className="lightbox__counter">
              {index + 1} / {count}
            </p>
          )}
        </figcaption>
      </figure>

      {count > 1 && (
        <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => go(1)} aria-label="Next photo">
          &#8250;
        </button>
      )}

      {count > 1 && (
        <div className="lightbox__thumbs">
          {photos.map((thumb, i) => (
            <button
              type="button"
              key={thumb.file}
              className={`lightbox__thumb ${i === index ? 'is-active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
            >
              {thumb.kind === 'video' ? (
                <span className="lightbox__thumbVideo" aria-hidden="true">
                  &#9654;
                </span>
              ) : (
                <img src={mediaUrl(thumb.src, { width: 160 })} alt="" loading="lazy" decoding="async" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

Lightbox.propTypes = {
  project: PropTypes.object,
  startIndex: PropTypes.number,
  onClose: PropTypes.func.isRequired,
};
