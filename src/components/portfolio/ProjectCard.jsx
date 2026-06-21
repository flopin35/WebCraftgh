import './Portfolio.css';

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function ProjectVisual({ project }) {
  const { previewTheme, name, url } = project;
  const domain = url ? getDomain(url) : null;

  return (
    <div className={`project-card__visual project-card__visual--${previewTheme}`}>
      <div className="project-card__browser" aria-hidden="true">
        <span className="project-card__browser-dots">
          <span />
          <span />
          <span />
        </span>
        <span className="project-card__browser-url">{domain || 'webcraftgh.com'}</span>
      </div>

      <div className="project-card__visual-inner">
        {previewTheme === 'security' && (
          <>
            <p className="project-card__visual-eyebrow">Marine Security Services</p>
            <h4 className="project-card__visual-title">Professional Security</h4>
            <p className="project-card__visual-sub">Licensed Private Security in Ghana</p>
            <div className="project-card__visual-blocks">
              <span>Manned Guarding</span>
              <span>Mobile Patrol</span>
              <span>24/7 Protection</span>
            </div>
          </>
        )}

        {previewTheme === 'campaign' && (
          <>
            <p className="project-card__visual-eyebrow">CampaignHub</p>
            <h4 className="project-card__visual-title">Your Campaign OS</h4>
            <p className="project-card__visual-sub">Launch, share, and track campaigns</p>
            <div className="project-card__visual-blocks">
              <span>Free Hosting</span>
              <span>QR Links</span>
              <span>Analytics</span>
            </div>
          </>
        )}

        {previewTheme === 'premium-campaign' && (
          <>
            <span className="project-card__visual-badge">Vote 2026</span>
            <h4 className="project-card__visual-title">{name}</h4>
            <p className="project-card__visual-sub">Premium campaign website</p>
            <div className="project-card__visual-blocks project-card__visual-blocks--gold">
              <span>Events</span>
              <span>Donations</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProjectCard({ project }) {
  const isLive = project.status === 'live';
  const isPremiumDev = project.status === 'in-development';
  const domain = project.url ? getDomain(project.url) : null;

  return (
    <article
      className={`project-card${isPremiumDev ? ' project-card--premium-dev' : ''}${
        isLive ? ' project-card--live' : ''
      }`}
    >
      <div className="project-card__media">
        <ProjectVisual project={project} />
        <div className="project-card__badges">
          <span className="project-card__category">{project.category}</span>
          <span className={`project-card__status project-card__status--${project.status}`}>
            {isLive ? 'Live Online' : project.statusLabel}
          </span>
        </div>
      </div>

      <div className="project-card__body">
        <h3 className="project-card__title">{project.name}</h3>
        {isLive && domain && (
          <p className="project-card__live-url">
            <span className="project-card__live-dot" aria-hidden="true" />
            {domain}
          </p>
        )}
        <p className="project-card__description">{project.description}</p>

        {project.technologies?.length > 0 && (
          <ul className="project-card__tech">
            {project.technologies.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        )}

        <div className="project-card__footer">
          {isLive && project.url ? (
            <a
              href={project.url}
              className="btn btn--primary project-card__cta"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Live Website
              <span className="project-card__cta-icon" aria-hidden="true">
                ↗
              </span>
            </a>
          ) : (
            <span className="project-card__cta project-card__cta--disabled">Launching Soon</span>
          )}
        </div>
      </div>
    </article>
  );
}
