import { useState, useCallback, useRef, useEffect } from 'react';

// You might want to define a more specific type for your requests or responses, depending on your use case.
interface HttpClientHook {
  isLoading: boolean;
  error: Error | null;
  sendRequest: <T>(url: string, method?: string, body?: BodyInit, headers?: HeadersInit) => Promise<T>;
  clearError: () => void;
}

export const useHttpClient = (): HttpClientHook => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Storing the array of AbortControllers to manage ongoing requests.
  const activeHttpRequests = useRef<AbortController[]>([]);

  const sendRequest = useCallback(
    async <T>(url: string, method: string = 'GET', body?: BodyInit, headers: HeadersInit = {})
          : Promise<T> => {
      setIsLoading(true);
      const httpAbortCtrl = new AbortController();
      activeHttpRequests.current.push(httpAbortCtrl);

      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortCtrl.signal, // for aborting the request if needed
        });

        // Removing the response's AbortController from the list.
        activeHttpRequests.current = activeHttpRequests.current.filter(
          reqCtrl => reqCtrl !== httpAbortCtrl
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message || 'Could not get response.');
        }

        setIsLoading(false);
        return responseData as T;
      } catch (err: any) {
        setError(new Error(err.message)); // Assuming err is an instance of Error.
        setIsLoading(false);
        throw err; // You may want to handle the error differently or re-throw it for the component using this hook.
      }
    },
    [] // Empty dependency array because this callback does not depend on any outside values.
  );

  const clearError = (): void => {
    setError(null);
  };

  // This useEffect is for cleanup when the component using the hook unmounts.
  useEffect(() => {
    return () => {
      // Aborting all ongoing requests to prevent memory leaks.
      activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abort());
    };
  }, []); // Empty dependency array as it runs only once when the component mounts and unmounts.

  return { isLoading, error, sendRequest, clearError };
};
