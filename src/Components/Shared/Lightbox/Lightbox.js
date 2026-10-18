import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import MediaImage from '../MediaImage/MediaImage';
import { mediaUrl } from '../../../api/client';
import './Lightbox.scss';

const CAPTION_KEY = 'ericsminiatures:lightbox-caption';

/** Whether the visitor last chose to minimise the caption. */
function storedCollapsed() {
  try {
    return window.localStorage.getItem(CAPTION_KEY) === 'collapsed';
  } catch {
    // Private browsing and blocked site data both throw here.
    return false;
  }
}

/**
 * Full-screen photo viewer for a single project.
 *
 * Replaces react-bnb-gallery, which is unmaintained and could not render the
 * per-photo captions or the responsive srcsets the media API serves.
 */
export default function Lightbox({ project, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex || 0);
  // Reading a description is a one-off; looking at the photo is the point. The
  // visitor can fold the text away, and the stage hands the freed height
  // straight to the image.
  const [captionOpen, setCaptionOpen] = useState(() => !storedCollapsed());
  const containerRef = useRef(null);
  const previouslyFocused = useRef(null);

  // Memoised so the preload effect below does not re-run on every render.
  const photos = useMemo(() => project?.photos || [], [project]);
  const count = photos.length;

  const go = useCallback(
    (delta) => setIndex((current) => (count ? (current + delta + count) % count : 0)),
    [count]
  );

  const toggleCaption = useCallback(() => {
    setCaptionOpen((open) => {
      const next = !open;
      try {
        window.localStorage.setItem(CAPTION_KEY, next ? 'open' : 'collapsed');
      } catch {
        // Not being able to remember the choice should not break the toggle.
      }
      return next;
    });
  }, []);

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

        <figcaption className={`lightbox__caption ${captionOpen ? 'is-open' : 'is-collapsed'}`}>
          {/* Always one line: title, position in the set, and the fold control.
              Everything below it is what folds away. */}
          <div className="lightbox__captionHead">
            <h2 className="lightbox__title">{project.title}</h2>

            {count > 1 && (
              <span className="lightbox__counter">
                {index + 1} / {count}
              </span>
            )}

            {caption && (
              <button
                type="button"
                className="lightbox__captionToggle"
                onClick={toggleCaption}
                aria-expanded={captionOpen}
                aria-controls="lightboxCaptionText"
              >
                <span className="lightbox__captionChevron" aria-hidden="true">
                  &#9650;
                </span>
                {captionOpen ? 'Hide text' : 'Show text'}
              </button>
            )}
          </div>

          {caption && (
            <p className="lightbox__text" id="lightboxCaptionText">
              {caption}
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
