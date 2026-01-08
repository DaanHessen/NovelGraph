export default function WritePage() {
  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="mb-8">
         <h1 className="text-4xl font-serif text-white mb-2">Chapter 1</h1>
         <p className="text-gray-400 font-serif italic">The Beginning...</p>
      </div>
      
      <div className="prose prose-invert prose-lg max-w-none">
        <p className="text-gray-300 leading-relaxed">
          Start writing your masterpiece here...
        </p>
      </div>
    </div>
  );
}
