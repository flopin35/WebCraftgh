import { useNavigate } from 'react-router-dom';
import './WebsiteTypeCard.css';

export default function WebsiteTypeCard({ id, label, description }) {
  const navigate = useNavigate();

  const handleSelect = () => {
    navigate(`/request?type=${id}`);
  };

  return (
    <article className="website-type-card">
      <h3 className="website-type-card__title">{label}</h3>
      <p className="website-type-card__description">{description}</p>
      <button type="button" className="btn btn--outline btn--full" onClick={handleSelect}>
        Get Started
      </button>
    </article>
  );
}
