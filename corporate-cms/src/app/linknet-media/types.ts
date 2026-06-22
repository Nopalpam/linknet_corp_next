export interface Channel {
  id: string;
  name: string;
  logo: string;
  genre: string[];
  date_update: string;
}

export interface ReelItem {
  id?: string;
  title?: string;
  name?: string;
  poster?: string;
  poster_landscape?: string;
  poster_portrait?: string;
  genre?: string[];
  year?: string | null;
  rating?: string;
  synopsis?: string;
  actor?: string[];
  channel_id?: string;
  channel_name?: string;
}

export interface Reel {
  name: string;
  date_update: string;
  data: ReelItem[];
}

export interface Genre {
  name: string;
  date_update: string;
}

export interface MediaApiResponse {
  channels: Channel[];
  reels: Reel[];
  genres: Genre[];
}
