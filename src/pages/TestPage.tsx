
const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Page</h1>
        <p className="text-gray-600">
          Si vous voyez cette page, l'application React fonctionne correctement.
        </p>
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p className="text-green-800">✅ React est opérationnel</p>
          <p className="text-green-800">✅ Tailwind CSS fonctionne</p>
          <p className="text-green-800">✅ Le routage fonctionne</p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
