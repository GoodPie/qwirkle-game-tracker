import { useParams } from 'react-router-dom';

export default function LobbyRoom() {
  const { code } = useParams<{ code: string }>();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Game Lobby</h1>
            <div className="mt-2">
              <span className="text-sm text-gray-600">Lobby Code:</span>
              <div className="text-3xl font-mono font-bold text-blue-600 mt-1">
                {code}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Players</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600">Loading players...</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button className="flex-1 py-2 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                Leave Lobby
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}