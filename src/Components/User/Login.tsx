// import React from 'react';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Navbar */}
      <nav className="fixed w-full top-0 left-0 z-50 bg-black border-b border-gray-700">
        <div className="px-3 sm:px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 sm:w-18 md:w-24 lg:w-32 h-8 bg-purple-600 rounded-full" />
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white font-bold">
              Clear View
            </h1>
          </div>
        </div>
      </nav>

      {/* Main Content Wrapper */}
      <div className="flex flex-col min-h-screen pt-16 bg-black overflow-hidden">
        {/* Mobile Image Section */}
        <div className="block md:hidden bg-gradient-to-br from-purple-800 to-purple-600 p-4 flex-shrink-0">
          <div className="max-w-[200px] mx-auto">
            <img 
              src="/api/placeholder/400/300"
              alt="News illustration" 
              className="w-full h-auto rounded-xl shadow-2xl" 
            />
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto">
          {/* Login Form Section */}
          <div className="flex-1 bg-black text-white flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-4 md:py-8">
            <div className="max-w-md mx-auto w-full space-y-4 md:space-y-6">
              {/* Header */}
              <div className="text-center mb-4 md:mb-8">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl leading-relaxed">
                  Your trusted source for
                  <br />
                  the latest news and insights
                </h2>
              </div>

              {/* Google Sign In Button */}
              <button className="w-full flex items-center justify-center bg-white hover:bg-gray-50 text-black py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold space-x-2 sm:space-x-3 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg">
                <div className="w-5 h-5 bg-blue-500 rounded-full" />
                <span>Sign in with Google</span>
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-black text-sm text-gray-400">
                    or
                  </span>
                </div>
              </div>

              {/* Login Form */}
              <form className="space-y-3 sm:space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Enter your Email"
                    className="w-full py-2 sm:py-2.5 px-3 sm:px-4 border border-gray-700 bg-black rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm hover:border-purple-400 transition-colors duration-300 text-white"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full py-2 sm:py-2.5 px-3 sm:px-4 border border-gray-700 bg-black rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm hover:border-purple-400 transition-colors duration-300 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300 text-white py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg mt-2"
                >
                  Log in
                </button>
              </form>

              {/* Links */}
              <div className="text-center space-y-2 pt-2">
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white text-xs sm:text-sm transition-colors duration-300"
                >
                  Forgot password?
                </a>
                <p className="text-xs sm:text-sm">
                  Don't have an account?{" "}
                  <a
                    href="#"
                    className="font-bold text-purple-400 hover:text-purple-300 transition-colors duration-300"
                  >
                    Sign up
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Image Section */}
          <div className="hidden md:flex flex-1 bg-gradient-to-br from-purple-800 to-purple-600 justify-center items-center p-6 lg:p-12">
            <div className="w-full max-w-lg xl:max-w-xl">
              <img
                src="/api/placeholder/800/600"
                alt="News illustration"
                className="w-full h-auto rounded-xl shadow-2xl transform transition-all duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;