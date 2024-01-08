import React, { useState, useContext, createContext } from 'react';
import io, { Socket } from 'socket.io-client';

type Location = {
  lat: number;
  lng: number;
};

type LocationContextType = {
  currentLocation: Location | null;
  setCurrentLocation: React.Dispatch<React.SetStateAction<Location | null>>;
  goalLocation: Location | null;
  setGoalLocation: React.Dispatch<React.SetStateAction<Location | null>>;
  socket: Socket | null;
};

type LocationProviderProps = {
    children: React.ReactNode;
  };

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const SOCKET_SERVER_URL = 'http://localhost:8080';

export const useLocationProvider = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [goalLocation, setGoalLocation] = useState<Location | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  React.useEffect(() => {
    console.log('Setting up WebSocket connection...');
    const socket: Socket = io(SOCKET_SERVER_URL);
    setSocket(socket);

    socket.on('goalLocation', (goalData: Location) => {
      console.log('Received goal location:', goalData);
      setGoalLocation(goalData);
    });

    socket.on('goalEvent', () => {
        console.log('Goal reached!');
        alert('Goal Reached!');
    });

    // Cleanup on unmount
    return () => {
      console.log('Disconnecting WebSocket...');
      socket.disconnect();
    };
  }, []);

  React.useEffect(() => {
    if (currentLocation && socket?.connected) {
      console.log('Emitting updated location to server:', currentLocation);
      socket.emit('updateLocation', currentLocation);
    }
  }, [currentLocation, socket]);

  React.useEffect(() => {
    console.log('Requesting geolocation permission...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('Current location:', userLocation);
        setCurrentLocation(userLocation);

        // Emit location to server to generate a goal
        console.log('Emitting location to server:', userLocation);
        console.log('Emitting location to server:', userLocation);
        if (typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
        socket?.emit('requestGoalLocation', userLocation);
        } else {
        console.error('Invalid location data:', userLocation);
        }
      },
      (err) => {
        console.error('Error getting location', err);
      }
    );
  }, [socket]); // add goalEvent

  return { currentLocation, setCurrentLocation, goalLocation, setGoalLocation, socket };
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    console.error('useLocation must be used within a LocationProvider');
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
    const location = useLocationProvider();
    return (
      <LocationContext.Provider value={location}>
        {children}
      </LocationContext.Provider>
    );
};
