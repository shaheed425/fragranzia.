import React from 'react'

const SignUp = () => {
  return (
    <div>
       <div className="min-h-screen flex">
      {/* LEFT IMAGE SECTION */}
      <div className="hidden md:block relative w-1/2 bg-[url('')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="absolute top-1/2 left-10 -translate-y-1/2 text-white">
          <h2 className="text-4xl font-bold mb-4">Let's Get Started!</h2>
          <p className="text-lg">
            Create your account and unlock the <br /> full potential of
            Fragranzia.
          </p>
        </div>
      </div>

      {/* RIGHT FORM SECTION */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* SOCIAL BUTTONS */}
          <div className="space-y-4 text-center">
            <a href="https://www.google.com/">
              <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-gray-100">
                Continue with Google
                <i className="fab fa-google text-red-500 text-lg"></i>
              </button>
            </a>

            <a href="https://www.facebook.com/">
              <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:bg-gray-100">
                Continue with Facebook
                <i className="fab fa-facebook text-blue-600 text-lg"></i>
              </button>
            </a>

            <p className="text-gray-500 text-sm">Or sign up with email</p>
          </div>

          {/* FORM */}
          <form className="mt-6 space-y-4">
            <div className="flex items-center border rounded-lg px-3 py-2">
              <i className="fa-regular fa-user text-gray-500 mr-3"></i>
              <input
                type="text"
                placeholder="Enter Your Username"
                className="w-full outline-none"
              />
            </div>

            <div className="flex items-center border rounded-lg px-3 py-2">
              <i className="fa-regular fa-envelope text-gray-500 mr-3"></i>
              <input
                type="email"
                placeholder="Enter Your Email"
                className="w-full outline-none"
              />
            </div>

            <div className="flex items-center border rounded-lg px-3 py-2">
              <i className="fa-solid fa-lock text-gray-500 mr-3"></i>
              <input
                type="password"
                placeholder="Enter Your Password"
                className="w-full outline-none"
              />
            </div>

            <div className="flex items-center border rounded-lg px-3 py-2">
              <i className="fa-solid fa-lock text-gray-500 mr-3"></i>
              <input
                type="password"
                placeholder="Confirm Your Password"
                className="w-full outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" />
              <label className="text-sm text-gray-600">
                Agree with{" "}
                <a
                  href="https://www.freeprivacypolicy.com/blog/terms-conditions-google-forms/"
                  className="text-blue-600"
                >
                  Terms & Conditions
                </a>
              </label>
            </div>

            <button className="w-full bg-[#0d2a46] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#123a5c] transition-all shadow-xl hover:translate-y-[-2px] active:scale-95">
              Sign Up
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a href="login.html" className="text-blue-600">
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
    </div>
  )
}

export default SignUp
