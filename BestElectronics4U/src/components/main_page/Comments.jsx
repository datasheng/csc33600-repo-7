import React from "react";

const comments = [
  {
    text: `"Amzing!!! This website located me the most nearby store for a new laptop that I needed."`,
    user: "John Doe",
    highlight: "Found a new laptop!",
  },
  {
    text: `"I love the variety of products available. Highly recommend!"`,
    user: "Jane Smith",
    highlight: "Great product selection",
  },
  {
    text: `"They even show the lowest price. I found my dream phone here!"`,
    user: "Mike Johnson",
    highlight: "Saved big on a phone",
  },
];

const Comments = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-indigo-900 via-cyan-800 to-blue-900 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-white">
            What Our Users Say
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Discover why customers love BestElectronics4U for finding the best
            deals on electronics
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {comments.map((comment, idx) => (
            <div
              key={idx}
              className="relative bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border border-white/20 overflow-hidden group"
            >
              {/* Decorative gradient circles */}
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-xl group-hover:from-cyan-500/30 transition-all duration-500"></div>
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-gradient-to-tl from-indigo-500/20 to-transparent rounded-full blur-xl group-hover:from-indigo-500/30 transition-all duration-500"></div>

              {/* Quote mark */}
              <div className="text-cyan-400/20 text-6xl font-serif absolute top-2 left-3">
                "
              </div>

              <div className="relative">
                <p className="text-lg font-medium text-white mb-6">
                  {comment.text}
                </p>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-cyan-300 font-semibold">{comment.user}</p>
                  <p className="text-white/60 text-sm">{comment.highlight}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Comments;
