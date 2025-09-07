import { useState } from "react";
import { toast } from "sonner";

type AsyncFunction<TArgs extends any[], TResult> = (...args: TArgs) => Promise<TResult>;

function useFetch<TArgs extends any[], TResult>(cb: AsyncFunction<TArgs, TResult>) {
  const [data, setData] = useState<TResult | undefined>(undefined);
  const [loading, setLoading] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: TArgs): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (err: any) {
      setError(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
}

export default useFetch;
