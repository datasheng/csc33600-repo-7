import React from 'react';

const comments = [
  {
    text: `"Amzing!!! This website located me the most nearby store for a new laptop that I needed."`,
    user: 'John Doe',
    highlight: 'Found a new laptop!',
  },
  {
    text: `"I love the variety of products available. Highly recommend!"`,
    user: 'Jane Smith',
    highlight: 'Great product selection',
  },
  {
    text: `"They even show the lowest price. I found my dream phone here!"`,
    user: 'Mike Johnson',
    highlight: 'Saved big on a phone',
  },
];

const Comments = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {comments.map((comment, idx) => (
          <div
            key={idx}
            className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border border-white/20"
          >
            <p className="text-lg font-semibold italic text-white mb-4">
              {comment.text}
            </p>
            <hr className="my-4 border-white/30" />
            <p className="text-sm font-bold text-white/90">{comment.user}</p>
            <p className="text-sm text-white/60">{comment.highlight}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Comments;
