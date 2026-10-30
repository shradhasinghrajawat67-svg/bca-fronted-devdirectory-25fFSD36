import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import ProjectShowcase from '../components/ProjectShowcase';
import ProfileStrength from '../components/ProfileStrength';

export default function Projects() {
  const { user } = useAuth();
  const { projects, saveProject, removeProject } = useSocial();
  return (
    <div className="container page">
      <h1>My project showcase</h1>
      <p className="lead">Show what you have built: screenshots, tech stack, links and your role. Everyone who visits your profile can open each project.</p>
      <div className="two-pane">
        <ProjectShowcase projects={projects} editable onSave={saveProject} onRemove={removeProject}
          empty={<>You have no projects yet. Press “Add project”, or get inspiration from the <Link to="/ideas">Project Idea Generator</Link>.</>} />
        <aside><ProfileStrength profile={user} projectCount={projects.length} compact /></aside>
      </div>
    </div>
  );
}
