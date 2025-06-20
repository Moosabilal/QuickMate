import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle'; // Assuming this exists
import { useState } from 'react'; // For dropdown and potential search input

// Dummy Data for demonstration
const categories = [
  { name: 'Cleaning', icon: (
    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
  ) },
  { name: 'Repairs', icon: (
    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
  ) },
  { name: 'Beauty', icon: (
    <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
  ) },
  { name: 'Tutoring', icon: (
    <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.747 0-3.332.477-4.5 1.253"></path></svg>
  ) },
  // Add more categories as needed
];

const popularServices = [
  { id: 1, name: 'House Cleaning', price: '$50/hr', imageUrl: 'https://via.placeholder.com/150/f0f9ff/6b7280?text=Cleaning' },
  { id: 2, name: 'Dog Walking', price: '$20/hr', imageUrl: 'https://via.placeholder.com/150/f0f9ff/6b7280?text=Dog+Walk' },
  { id: 3, name: 'Piano Lessons', price: '$60/hr', imageUrl: 'https://via.placeholder.com/150/f0f9ff/6b7280?text=Piano' },
  { id: 4, name: 'Handyman', price: '$75/hr', imageUrl: 'https://via.placeholder.com/150/f0f9ff/6b7280?text=Handyman' },
];

const trendingServices = [
    { id: 5, name: 'Gardening Cleanup', price: '$45/hr', imageUrl: 'https://via.placeholder.com/150/f0f9ff/6b7280?text=Gardening' },
    { id: 6, name: 'Personal Training', price: '$80/hr', imageUrl: 'https://via.placeholder.com/150/f0f9ff/6b7280?text=Training' },
    { id: 7, name: 'Car Detailing', price: '$100', imageUrl: 'https://via.placeholder.com/150/f0f9ff/6b7280?text=Car+Detail' },
];

const featuredProviders = [
  { id: 1, name: 'Olivia R.', rating: 5, imageUrl: 'https://via.placeholder.com/64/a78bfa/ffffff?text=OR' },
  { id: 2, name: 'Marcus P.', rating: 4.8, imageUrl: 'https://via.placeholder.com/64/34d399/ffffff?text=MP' },
  { id: 3, name: 'Emily C.', rating: 4.9, imageUrl: 'https://via.placeholder.com/64/facc15/ffffff?text=EC' },
  { id: 4, name: 'Jonathan S.', rating: 5, imageUrl: 'https://via.placeholder.com/64/fb7185/ffffff?text=JS' },
];

const testimonials = [
  {
    id: 1,
    author: 'Sarah F.',
    rating: 5,
    text: 'QuickMate made finding a reliable cleaner so easy! Jessica was efficient and amazing, my home has never looked better!',
  },
  {
    id: 2,
    author: 'David L.',
    rating: 5,
    text: 'Highly recommend! Peter was insightful in helping my Music Theory! He was professional and helped me grasp difficult concepts.',
  },
];

// Helper for Star Rating Display
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
        </svg>
      ))}
      {hasHalfStar && (
        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118L5.2 12.72a1 1 0 00-.364-1.118L2.03 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69L9.049 2.927zM12 15.5l-2.293-1.664a1 1 0 00-1.175 0L6.23 15.5 7.3 12.21a1 1 0 00-.364-1.118L4.13 9.052h3.462a1 1 0 00.95-.69L9.049 5.292 9.049 15.5z"></path>
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"></path>
        </svg>
      ))}
    </div>
  );
};


const Home = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = {} // useAuth(); // Assuming you'd get user from context if logged in

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      {/* Header/Navigation */}
      <header className="fixed w-full top-0 z-50 bg-white dark:bg-gray-800 shadow-sm">
        <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              QuickMate
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">Home</Link>
              <Link to="/services" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">Services</Link>
              <Link to="/providers" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">Providers</Link>
              <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">About Us</Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {/* Conditional rendering for Login/Register or User Dropdown */}
            {/* Replace `user` with actual user state from useAuth() */}
            {false ? ( // Placeholder: Replace `false` with `user` or `isLoggedIn` check
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
                >
                  <img src="https://via.placeholder.com/32" alt="User Avatar" className="w-8 h-8 rounded-full" />
                  <span>{user?.name || 'My Account'}</span>
                  <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Profile</Link>
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Dashboard</Link>
                    {user?.role === 'Admin' && <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Admin Panel</Link>}
                    <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-2 hidden sm:block"> {/* Hide on small screens to avoid clutter */}
                <Link to="/login">
                  <button className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-3 py-2 rounded-md">
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200">
                    Register
                  </button>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="pt-20"> {/* Padding top to account for fixed header */}
        {/* Hero Section */}
        <section
          className="relative bg-cover bg-center h-[500px] md:h-[600px] flex items-center justify-center text-white"
          style={{ backgroundImage: "url('/images/hero-bg.jpg')" }} 
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 text-center px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
              Find local services for <span className="text-emerald-300">almost anything</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Connect with trusted professionals for your everyday needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="text"
                placeholder="What service are you looking for?"
                className="p-3 rounded-lg w-full sm:w-80 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
              <input
                type="text"
                placeholder="Your Location (e.g., Delhi, Mumbai)"
                className="p-3 rounded-lg w-full sm:w-64 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
              <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-200">
                Search
              </button>
            </div>
          </div>
        </section>

        {/* Browse by Category Section */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link to={`/category/${category.name.toLowerCase().replace(/\s/g, '-')}`} key={category.name} className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition duration-200 transform hover:-translate-y-1">
                <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center">{category.name}</h3>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Services Near You Section */}
        <section className="bg-gray-100 dark:bg-gray-950 px-4 py-12 md:py-16">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Popular Services Near You</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularServices.map((service) => (
                <Link to={`/service/${service.id}`} key={service.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200 transform hover:-translate-y-1">
                  <img src={service.imageUrl} alt={service.name} className="w-full h-48 object-cover" />
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{service.name}</h3>
                    <p className="text-blue-600 dark:text-blue-400 font-bold">{service.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trending in Your Area Section */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Trending in Your Area</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingServices.map((service) => (
              <Link to={`/service/${service.id}`} key={service.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200 transform hover:-translate-y-1">
                <img src={service.imageUrl} alt={service.name} className="w-full h-48 object-cover" />
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{service.name}</h3>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold">{service.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Providers Section */}
        <section className="bg-gray-100 dark:bg-gray-950 px-4 py-12 md:py-16">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Featured Providers</h2>
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide"> {/* scrollbar-hide might need custom CSS */}
              <div className="flex space-x-6">
                {featuredProviders.map((provider) => (
                  <Link to={`/provider/${provider.id}`} key={provider.id} className="flex-shrink-0 w-48 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center hover:shadow-lg transition duration-200 transform hover:-translate-y-1">
                    <img src={provider.imageUrl} alt={provider.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{provider.name}</h3>
                    <StarRating rating={provider.rating} />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{provider.rating} Stars</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What People Are Saying (Testimonials) */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">What People Are Saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border-t-4 border-blue-500 dark:border-blue-400">
                <StarRating rating={testimonial.rating} />
                <p className="text-gray-700 dark:text-gray-300 mt-4 italic">"{testimonial.text}"</p>
                <p className="font-semibold text-gray-800 dark:text-gray-100 mt-4">- {testimonial.author}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-gray-100 dark:bg-gray-950 px-4 py-12 md:py-16">
          <div className="container mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2">
              <img src="/images/how-it-works.png" alt="How QuickMate Works" className="rounded-lg shadow-lg w-full h-auto object-cover" /> {/* Add this image */}
            </div>
            <div className="md:w-1/2 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">How It Works</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                QuickMate connects you with skilled local professionals for all your needs. Simply search for the service you need, browse through profiles and reviews, book your service, and get things done! It's that easy.
              </p>
              <Link to="/how-it-works" className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200">
                Learn More
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Ready to Get Started? CTA */}
        <section className="container mx-auto px-4 py-12 md:py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Join QuickMate today and simplify your life!
          </p>
          <Link to="/register" className="inline-flex items-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out">
            Sign Up Now - It's Free!
            <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-900 text-gray-300 dark:text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center text-sm">
          <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-8 mb-4">
            <Link to="/contact" className="hover:text-white">Contact</Link>
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} QuickMate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;