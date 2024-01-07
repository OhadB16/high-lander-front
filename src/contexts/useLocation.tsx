// useLocation.ts
import { useHttpClient } from '../hooks/http-hook';
import { GoalLocationResponse } from '../components/models/GoalLocationResponse';
import React from 'react';

type Location = {
  lat: number;
  lng: number;
};


export const useLocation = () => {
  const [currentLocation, setCurrentLocation] = React.useState<Location | null>(null);
  const [goalLocation, setGoalLocation] = React.useState<GoalLocationResponse | null>(null);
  const { sendRequest } = useHttpClient();

  const API_URL = `http://localhost:8080/api/`;

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition( 
      async (position) => {
        const userLocation: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCurrentLocation(userLocation);

        try {
          const goalData = await sendRequest(API_URL + `generate-goal?lat=${userLocation.lat}&lng=${userLocation.lng}`) as Location;
          setGoalLocation(goalData);
        } catch (err) {
          console.error('Error generating goal', err);
        }
      },
      (err) => {
        console.error('Error getting location', err);
      }
    );
  }, [sendRequest]);

  return { currentLocation, setCurrentLocation, goalLocation, setGoalLocation };
};