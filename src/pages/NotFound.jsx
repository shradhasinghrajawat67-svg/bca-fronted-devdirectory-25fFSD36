import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="container page narrow">
      <h1>404: page not found</h1>
      <p className="lead">That address doesn’t lead anywhere in DevSphere.</p>
      <Link to="/" className="btn btn-primary">Go to home</Link>
    </section>
  );
}
