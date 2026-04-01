import { useState } from "react";
import { subscribeToPro } from "@/services/payment";

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await subscribeToPro();
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Unable to start subscription");
      return null;
    }
  };

  return {
    subscribe,
    isLoading,
    error
  };
}

