import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center text-white">
        <h1 className="text-6xl font-bold mb-4">Welcome to HireFlow</h1>
        <p className="text-2xl mb-8">Job Portal & Recruitment Platform</p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            to="/login"
            className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Admin Login
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 bg-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-12 p-6 bg-white bg-opacity-20 backdrop-blur-lg rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Quick Start Guide</h2>
          <ol className="text-left space-y-2 max-w-2xl mx-auto">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Register a new account or use: admin@hireflow.com / admin123</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Assign admin role in MySQL Workbench (see SQL file in backend folder)</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Login and navigate to /admin to access the admin dashboard</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Home;
