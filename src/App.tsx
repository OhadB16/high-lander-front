import React from 'react';
import { useHttpClient } from './hooks/http-hook';
import { Box } from '@mui/material';
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';
import { CheckGoalResponse } from './components/models/CheckGoalResponse';
import { useLocation } from './contexts/useLocation';

const containerStyle = {
  width: '100%',
  height: '100vh'
};

type MapIconType = {
  url: string;
  scaledSize: google.maps.Size;
};


function App() {
  const { currentLocation, setCurrentLocation, goalLocation } = useLocation();
  // can also add context or redux for the state mamagement (usually use for larger apps)

  const { sendRequest } = useHttpClient();
  const [mapLoaded, setMapLoaded] = React.useState(false);

  const ballIcon = React.useRef<MapIconType | null>(null);
  const goalIcon = React.useRef<MapIconType | null>(null);

  const API_BASE_URL = 'http://localhost:8080/api';

  React.useEffect(() => {
    if (window.google && window.google.maps && !mapLoaded) {
      ballIcon.current = {
        url: `${process.env.PUBLIC_URL}/ball.png`,
        scaledSize: new window.google.maps.Size(100, 100),
      };

      goalIcon.current = {
        url: `${process.env.PUBLIC_URL}/goal.png`,
        scaledSize: new window.google.maps.Size(100, 100),
      };
      setMapLoaded(true);
    }
  }, [mapLoaded]);

  React.useEffect(() => {
    const checkGoal = async () => {
      if (currentLocation && goalLocation) {
        try {
          const result = await sendRequest(API_BASE_URL +'check-goal', 'POST', JSON.stringify({
            userPosition: currentLocation,
            goalPosition: goalLocation
          }), {
            'Content-Type': 'application/json'
          }) as CheckGoalResponse;

          if (result.isGoalReached) {
            alert("GOAL!");
          }
        } catch (err) {
          console.error('Error checking goal', err);
        }
      }
    };

    checkGoal();
  }, [currentLocation, goalLocation, sendRequest]);

  const createIcon = (iconUrl: any) => {
    if (window.google) {
      console.log(`Creating icon for: ${iconUrl}`);
      const icon = {
        url: iconUrl,
        scaledSize: new window.google.maps.Size(50, 50),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(25, 50), 
      };
      console.log('Icon created:', icon);
      return icon;
    }
    console.log('Google Maps API not loaded yet');
    return undefined;
  };
  
  return (
      <div className="App">
        <Box component='div' sx={{ display: 'flex', justifyContent: 'flex-start', margin: 5, height: 2 }}>
          <Box component='div' sx={{ minWidth: '100%', display: 'flex' }}>
            <LoadScript googleMapsApiKey="AIzaSyCdtGPc2gg0Wh8UWRWDGDy8ChwLNyB5DnI" onLoad={() => { console.log('Google Maps API loaded'); setMapLoaded(true); }}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={currentLocation || undefined}
              zoom={15}
              onClick={(e) => {
                if (e.latLng) {
                  setCurrentLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                }
              }}
            >
              {mapLoaded && currentLocation && (
                <Marker position={currentLocation} icon={createIcon(`${process.env.PUBLIC_URL}/ball.png`)} />
              )}
              {mapLoaded && goalLocation && (
                <Marker position={goalLocation} icon={createIcon(`${process.env.PUBLIC_URL}/goal.png`)} />
              )}
            </GoogleMap>
          </LoadScript>
          </Box>
        </Box>
      </div>
    );
}

export default App;