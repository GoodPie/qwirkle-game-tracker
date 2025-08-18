export default function LobbyHome() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Qwirkle Score Tracker</h1>
          <p className="mt-2 text-gray-600">Create or join a game lobby</p>
        </div>
        
        <div className="space-y-4">
          <button className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Create Game
          </button>
          
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter lobby code"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={6}
            />
            <button className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
              Join Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}