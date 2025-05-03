import React from "react";

const About = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-cyan-800 to-blue-900 py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            About BestElectronics4U
          </h1>
          <p className="text-xl text-white/80">
            Your trusted source for premium electronics
          </p>
        </div>

        <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 shadow-xl">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-3">
                Our Mission
              </h2>
              <p className="text-white/90 leading-relaxed">
                At BestElectronics4U, our mission is simple — to connect
                customers with the best in modern electronics through a smooth,
                reliable, and enjoyable online experience.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-3">
                What We Offer
              </h2>
              <p className="text-white/90 leading-relaxed">
                Our goal is to offer a wide selection of quality products,
                paired with a simple and seamless shopping experience. We are
                committed to helping you discover the best electronics to fit
                your needs, whether you're upgrading your gear, searching for
                the perfect gift, or exploring the latest technology trends.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-3">
                Our Promise
              </h2>
              <p className="text-white/90 leading-relaxed">
                We stand behind every product we sell with exceptional customer
                service and support. Your satisfaction is our top priority, and
                we're dedicated to making your shopping experience with us as
                enjoyable as the products you purchase.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-10 text-center">
          <p className="text-white/80 max-w-2xl mx-auto font-medium">
            Thank you for choosing BestElectronics4U — where innovation meets
            exceptional service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
