import { fetchApi } from "./client";

export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: { name: string; url: string };
  location: { name: string; url: string };
  image: string;
  episode: string[];
  url?: string;
  created?: string;
}

export interface CharacterResponse {
  info?: {
    count?: number;
    pages?: number;
    next?: string | null;
    prev?: string | null;
  };
  results?: Character[];
  error?: string;
}

export interface CharacterFilters {
  page: number;
  name?: string;
  status?: string;
  gender?: string;
  species?: string;
}

export function getCharacters(filters: CharacterFilters, signal?: AbortSignal) {
  const searchParams = new URLSearchParams({ page: String(filters.page) });
  if (filters.name) searchParams.set("name", filters.name);
  if (filters.status) searchParams.set("status", filters.status);
  if (filters.gender) searchParams.set("gender", filters.gender);
  if (filters.species) searchParams.set("species", filters.species);

  return fetchApi<CharacterResponse>(`/character/?${searchParams.toString()}`, {
    signal,
  });
}

export function getCharacter(id: string | number, signal?: AbortSignal) {
  return fetchApi<Character>(`/character/${id}`, { signal });
}

export function getCharactersByUrls(urls: string[], signal?: AbortSignal) {
  const ids = urls
    .map((url) => url.split("/").filter(Boolean).at(-1))
    .filter(Boolean);
  if (ids.length === 0) return Promise.resolve([] as Character[]);

  return fetchApi<Character | Character[]>(`/character/${ids.join(",")}`, {
    signal,
  }).then((data) => (Array.isArray(data) ? data : [data]));
}
