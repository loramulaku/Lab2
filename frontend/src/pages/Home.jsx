import { Link } from 'react-router-dom';
import CmsBlock from '../components/cms/CmsBlock';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center text-white">
        <CmsBlock cmsKey="home.hero.title" fallback="Welcome to HireFlow" as="h1" className="text-6xl font-bold mb-4" />
        <CmsBlock cmsKey="home.hero.subtitle" fallback="Job Portal & Recruitment Platform" as="p" className="text-2xl mb-8" />

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/login"
            className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <CmsBlock cmsKey="home.cta.primary" fallback="Login" as="span" />
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 bg-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <CmsBlock cmsKey="home.cta.secondary" fallback="Create Account" as="span" />
          </Link>
        </div>

        <div className="mt-12 p-6 bg-white bg-opacity-20 backdrop-blur-lg rounded-lg">
          <CmsBlock cmsKey="home.guide.title" fallback="Quick Start Guide" as="h2" className="text-2xl font-bold mb-4" />
          <ol className="text-left space-y-2 max-w-2xl mx-auto">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <CmsBlock cmsKey="home.guide.step1" fallback="Register a new account or sign in." as="span" />
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <CmsBlock cmsKey="home.guide.step2" fallback="Recruiters can post jobs, candidates can apply." as="span" />
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <CmsBlock cmsKey="home.guide.step3" fallback="Admins manage everything from the dashboard." as="span" />
            </li>
          </ol>
        </div>

        <CmsBlock cmsKey="site.footer.text" fallback="© HireFlow. All rights reserved." as="p" className="mt-10 text-xs text-white/70" />
      </div>
    </div>
  );
};

export default Home;
