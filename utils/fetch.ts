export type FetchArgs<B> = {
  path: string;
  data?: B;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
};

async function awaitJson<B, R>({
  path,
  data,
  method,
}: FetchArgs<B>): Promise<R> {
  const resp = await fetch(path, {
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
    method,
  });
  return await resp.json();
}

export function useFetch(path: string) {
  const get = <R>() => awaitJson<undefined, R>({ path, method: "GET" });

  const post = <B, R>(data: B) =>
    awaitJson<B, R>({ path, data, method: "POST" });

  return { get, post };
}
