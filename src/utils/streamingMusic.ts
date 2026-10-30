/**
 * Online Streaming Music Integration (Spotify, Apple Music, YouTube Music, SoundCloud)
 * Supports parsing links, converting to secure embed players, curated romantic playlists,
 * account linking storage, and synchronization between calling partners.
 */

export type StreamingProvider = 'spotify' | 'apple-music' | 'youtube' | 'soundcloud';

export interface StreamingTrackInfo {
  provider: StreamingProvider;
  embedUrl: string;
  originalUrl: string;
  title: string;
  subtitle: string;
  icon: string;
  type: 'track' | 'playlist' | 'album' | 'video';
  height?: number;
}

export interface LinkedAccount {
  provider: StreamingProvider;
  accountIdentifier: string; // username, profile link, or client ID
  displayName?: string;
  connectedAt: number;
}

const STORAGE_KEY_LINKED_ACCOUNTS = 'love_streaming_linked_accounts';

/**
 * Retrieve linked streaming accounts from local storage
 */
export function getLinkedAccounts(): Record<string, LinkedAccount> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LINKED_ACCOUNTS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Save a linked streaming account
 */
export function saveLinkedAccount(account: LinkedAccount): void {
  try {
    const all = getLinkedAccounts();
    all[account.provider] = account;
    localStorage.setItem(STORAGE_KEY_LINKED_ACCOUNTS, JSON.stringify(all));
  } catch {}
}

/**
 * Remove a linked streaming account
 */
export function removeLinkedAccount(provider: StreamingProvider): void {
  try {
    const all = getLinkedAccounts();
    delete all[provider];
    localStorage.setItem(STORAGE_KEY_LINKED_ACCOUNTS, JSON.stringify(all));
  } catch {}
}

/**
 * Parse any user-provided URL and convert it into a secure embed player
 */
export function parseStreamingUrl(rawUrl: string, customTitle?: string): StreamingTrackInfo | null {
  const url = rawUrl.trim();
  if (!url) return null;

  // 1. Spotify
  // Matches: open.spotify.com/track/{id}, open.spotify.com/playlist/{id}, open.spotify.com/album/{id}, open.spotify.com/artist/{id}
  // Or spotify:track:{id}, spotify:playlist:{id}
  if (url.includes('spotify.com') || url.startsWith('spotify:')) {
    let type: 'track' | 'playlist' | 'album' = 'track';
    let id = '';

    if (url.includes('spotify.com')) {
      const match = url.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/i);
      if (match) {
        type = match[1].toLowerCase() as 'track' | 'playlist' | 'album';
        id = match[2];
      }
    } else if (url.startsWith('spotify:')) {
      const parts = url.split(':');
      if (parts.length >= 3) {
        type = (parts[1] === 'playlist' || parts[1] === 'album') ? parts[1] : 'track';
        id = parts[2];
      }
    }

    if (id) {
      const embedUrl = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
      const title = customTitle || (type === 'playlist' ? 'Spotify Romantic Playlist' : type === 'album' ? 'Spotify Album' : 'Spotify Romantic Song');
      return {
        provider: 'spotify',
        embedUrl,
        originalUrl: url,
        title,
        subtitle: `Spotify ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        icon: '🟢',
        type,
        height: type === 'track' ? 80 : 152,
      };
    }
  }

  // 2. Apple Music
  // Matches: music.apple.com/{country}/album/{name}/{id}?i={trackId}
  // Or: music.apple.com/{country}/playlist/{name}/{id}
  if (url.includes('music.apple.com')) {
    const cleanUrl = url.split('?')[0];
    const isPlaylist = url.includes('/playlist/');
    const isAlbum = url.includes('/album/');
    const type = isPlaylist ? 'playlist' : isAlbum ? 'album' : 'track';

    // Replace music.apple.com with embed.music.apple.com
    const embedUrl = url.replace('https://music.apple.com', 'https://embed.music.apple.com');
    const title = customTitle || (isPlaylist ? 'Apple Music Romantic Playlist' : 'Apple Music Love Ballad');

    return {
      provider: 'apple-music',
      embedUrl,
      originalUrl: url,
      title,
      subtitle: `Apple Music ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      icon: '🍎',
      type,
      height: 152,
    };
  }

  // 3. YouTube & YouTube Music
  // Matches: youtube.com/watch?v={id}, youtu.be/{id}, music.youtube.com/watch?v={id}
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      videoId = match[2];
    }

    if (videoId) {
      const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`;
      return {
        provider: 'youtube',
        embedUrl,
        originalUrl: url,
        title: customTitle || 'YouTube Romantic Music Stream',
        subtitle: 'YouTube Music Audio',
        icon: '▶️',
        type: 'video',
        height: 180,
      };
    }
  }

  // 4. SoundCloud
  if (url.includes('soundcloud.com')) {
    const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23f43f5e&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
    return {
      provider: 'soundcloud',
      embedUrl,
      originalUrl: url,
      title: customTitle || 'SoundCloud Romantic Track',
      subtitle: 'SoundCloud Stream',
      icon: '☁️',
      type: 'track',
      height: 120,
    };
  }

  return null;
}

/**
 * Curated romantic playlists & soundscapes for instant 1-click couple listening
 */
export const ROMANTIC_STREAMING_PRESETS: StreamingTrackInfo[] = [
  // Spotify Presets
  {
    provider: 'spotify',
    originalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX50oq6vV7x2S',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX50oq6vV7x2S?utm_source=generator&theme=0',
    title: 'Love Ballads & Romance',
    subtitle: 'Spotify Official • All-time romantic classics & slow dance',
    icon: '🟢',
    type: 'playlist',
    height: 152,
  },
  {
    provider: 'spotify',
    originalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2pSTOxoPbx9',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX2pSTOxoPbx9?utm_source=generator&theme=0',
    title: 'Cozy Acoustic Love',
    subtitle: 'Spotify Official • Warm guitar fingerpicking & soft vocals',
    icon: '🟢',
    type: 'playlist',
    height: 152,
  },
  {
    provider: 'spotify',
    originalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4t95PaoR1zy',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4t95PaoR1zy?utm_source=generator&theme=0',
    title: 'Midnight Lo-Fi Romance',
    subtitle: 'Spotify Official • Gentle study & chill beats for two',
    icon: '🟢',
    type: 'playlist',
    height: 152,
  },
  {
    provider: 'spotify',
    originalUrl: 'https://open.spotify.com/track/0tgVpDi06FyKpA1z0VMD4v',
    embedUrl: 'https://open.spotify.com/embed/track/0tgVpDi06FyKpA1z0VMD4v?utm_source=generator&theme=0',
    title: 'Perfect — Ed Sheeran',
    subtitle: 'Spotify Single • Iconic timeless love ballad',
    icon: '🟢',
    type: 'track',
    height: 80,
  },

  // Apple Music Presets
  {
    provider: 'apple-music',
    originalUrl: 'https://music.apple.com/us/playlist/romantic-essentials/pl.b7952a265691461db1d7ad9989b1da98',
    embedUrl: 'https://embed.music.apple.com/us/playlist/romantic-essentials/pl.b7952a265691461db1d7ad9989b1da98',
    title: 'Apple Music: Romantic Essentials',
    subtitle: 'Apple Music Editorial • Soul-stirring love songs',
    icon: '🍎',
    type: 'playlist',
    height: 152,
  },
  {
    provider: 'apple-music',
    originalUrl: 'https://music.apple.com/us/playlist/pure-romance/pl.f64b4c7c88f149e3bf5d4ceac91fb8ca',
    embedUrl: 'https://embed.music.apple.com/us/playlist/pure-romance/pl.f64b4c7c88f149e3bf5d4ceac91fb8ca',
    title: 'Apple Music: Pure Romance',
    subtitle: 'Apple Music Editorial • Soft pop, R&B, and acoustic gems',
    icon: '🍎',
    type: 'playlist',
    height: 152,
  },

  // YouTube Live / Ambient Presets
  {
    provider: 'youtube',
    originalUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    embedUrl: 'https://www.youtube-nocookie.com/embed/5qap5aO4i9A?autoplay=1&enablejsapi=1',
    title: 'Lofi Girl: Relaxing Romantic Beats',
    subtitle: 'YouTube Music • Peaceful beats to talk, dream & relax to',
    icon: '▶️',
    type: 'video',
    height: 180,
  },
  {
    provider: 'youtube',
    originalUrl: 'https://www.youtube.com/watch?v=DWcJFNfaw9c',
    embedUrl: 'https://www.youtube-nocookie.com/embed/DWcJFNfaw9c?autoplay=1&enablejsapi=1',
    title: 'Romantic Candlelight Piano',
    subtitle: 'YouTube Music • Beautiful peaceful piano melodies for couples',
    icon: '▶️',
    type: 'video',
    height: 180,
  },
];
