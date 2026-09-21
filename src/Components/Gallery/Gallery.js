import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import Pagination from '@material-ui/lab/Pagination';
import { Helmet } from 'react-helmet-async';
import Banner from '../Home/Banner/Banner';
import MediaImage from '../Shared/MediaImage/MediaImage';
import Lightbox from '../Shared/Lightbox/Lightbox';
import { fetchGallery, fetchProject } from '../../api/client';
import './Gallery.scss';

const PER_PAGE = 10;

// Two columns above the tablet breakpoint, one below - keep this in sync with
// the grid in Gallery.scss so the browser picks the right srcset candidate.
const GRID_SIZES = '(max-width: 960px) 92vw, (max-width: 1480px) 46vw, 700px';

function pageFromLocation(location) {
  const fromState = location.state?.pageNumber;
  const fromQuery = new URLSearchParams(location.search).get('page');
  return Math.max(1, Number(fromState || fromQuery) || 1);
}

/** Scroll past the banner, the way the site did before. */
function scrollBelowBanner() {
  const banner = document.getElementById('banner');
  if (!banner) return;
  window.scrollTo({ top: banner.offsetHeight, behavior: 'smooth' });
}

export default function Gallery() {
  const { id: section } = useParams();
  const location = useLocation();
  const history = useHistory();
  const page = pageFromLocation(location);

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState(null);

  // Gallery metadata for the current page. Image bytes are never part of this.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchGallery(section, { page, perPage: PER_PAGE })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [section, page]);

  // Move below the banner when the visitor switches section or page, but not
  // on first load - arriving at a gallery should show the banner.
  const isFirstRender = useRef(true);
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    scrollBelowBanner();
  }, [section, page]);

  const changePage = (_event, selectedPage) => {
    history.push({
      pathname: `/gallery/${section}`,
      search: selectedPage > 1 ? `?page=${selectedPage}` : '',
      state: { pageNumber: selectedPage },
    });
  };

  // Full photo list is fetched only when a project is actually opened.
  const openProject = useCallback(
    (project) => {
      fetchProject(section, project.slug)
        .then((result) => setActiveProject(result.project))
        .catch(() => setActiveProject({ ...project, photos: [project.cover] }));
    },
    [section]
  );

  const bannerInfo = data
    ? { title: data.section.bannerTitle, description: data.section.bannerDescription }
    : { title: '', description: '' };
  const screenClass = typeof window !== 'undefined' && window.innerWidth > 990 ? 'large' : 'slim';

  return (
    <main>
      {data && (
        <Helmet>
          <title>{`${data.section.title} – Eric's Miniatures`}</title>
          <meta name="description" content={data.section.blurb} />
        </Helmet>
      )}

      <Banner bannerInfo={bannerInfo} slot={section} className={`short ${screenClass}${section}`} />

      {error && (
        <p className="galleryMessage" role="alert">
          Could not load this gallery. Please try again.
        </p>
      )}

      <div className="gridContainer">
        {loading && !data
          ? Array.from({ length: PER_PAGE }, (_, i) => <div className="projectCard projectCard--skeleton" key={`skeleton-${i}`} />)
          : (data?.items || []).map((project, index) => (
              <article className="projectCard" key={project.id}>
                <button
                  type="button"
                  className="projectCard__button"
                  onClick={() => openProject(project)}
                  aria-label={`View ${project.photoCount} photos of ${project.title}`}
                >
                  <MediaImage
                    photo={project.cover}
                    alt={project.title}
                    sizes={GRID_SIZES}
                    // The first row is above the fold on most screens.
                    eager={index < 2}
                    className="projectCard__image"
                  />
                  {project.photoCount > 1 && (
                    <span className="projectCard__count">{project.photoCount} photos</span>
                  )}
                </button>

                <div className="projectCard__body">
                  <h2 className="projectCard__title">{project.title}</h2>
                  {project.description && <p className="projectCard__description">{project.description}</p>}
                </div>
              </article>
            ))}
      </div>

      {data && data.pageCount > 1 && (
        <div className="paginationWrapper">
          <Pagination
            className="paginationController"
            color="primary"
            count={data.pageCount}
            page={data.page}
            onChange={changePage}
          />
        </div>
      )}

      {activeProject && (
        <Lightbox project={activeProject} startIndex={0} onClose={() => setActiveProject(null)} />
      )}
    </main>
  );
}
