/**
 * columns-media -- side-by-side media + text feature rows.
 * - Marks picture-only cells so CSS can order the image to the left.
 * - Converts a lone YouTube link cell into a responsive embedded player.
 */

function youTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
  } catch (e) {
    // ignore malformed URLs
  }
  return null;
}

function decorateVideoCell(col) {
  // A cell whose only meaningful content is a single YouTube link.
  const links = col.querySelectorAll('a');
  if (links.length !== 1) return false;
  const link = links[0];
  const id = youTubeId(link.href);
  if (!id) return false;

  const wrapper = document.createElement('div');
  wrapper.className = 'columns-media-video';
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${id}`;
  iframe.title = link.textContent.trim() || 'YouTube video player';
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  iframe.setAttribute('allowfullscreen', '');
  wrapper.append(iframe);

  col.textContent = '';
  col.append(wrapper);
  col.classList.add('columns-media-video-col');
  return true;
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-media-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-media-img-col');
        }
        return;
      }
      decorateVideoCell(col);
    });
  });
}
