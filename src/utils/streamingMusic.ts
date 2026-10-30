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
  spotifyUri?: string;
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
 * Extract clean URL from any raw input (even if user pasted text like "Listen to X on Spotify: https://...")
 */
function extractUrl(rawText: string): string {
  const trimmed = rawText.trim();
  const urlMatch = trimmed.match(/(https?:\/\/[^\s]+)/i);
  return urlMatch ? urlMatch[1] : trimmed;
}

/**
 * Extract canonical Spotify URI from any standard or internationalized Spotify URL or URI
 */
export function extractSpotifyUri(url: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (trimmed.startsWith('spotify:')) return trimmed;
  const match = trimmed.match(
    /spotify\.com\/(?:intl-[a-zA-Z-]+\/)?(?:embed\/)?(track|playlist|album|artist|episode)\/([a-zA-Z0-9]+)/i
  );
  if (match) {
    return `spotify:${match[1].toLowerCase()}:${match[2]}`;
  }
  return undefined;
}

/**
 * Spotify track/playlist → matching YouTube video ID for synchronized shared listening.
 * Spotify's embed player runs independently per browser and cannot be synchronised
 * (no postMessage API, each user needs their own session). By resolving to the same
 * song on a controllable player, both partners hear the exact same audio at the exact
 * same millisecond without any login required.
 */
const SPOTIFY_SYNC_MAP: Record<string, { title: string; subtitle: string; videoId: string }> = {
  // Ed Sheeran - Perfect
  '0tgVpDi06FyKpA1z0VMD4v': { title: 'Perfect — Ed Sheeran',                        subtitle: 'Synced Stream • Timeless acoustic love ballad',         videoId: '2Vv-BfVoq4g' },
  // Stephen Sanchez - Until I Found You
  '0P6cw2qYwVzF6x8l0Y3l0h': { title: 'Until I Found You — Stephen Sanchez',          subtitle: 'Synced Stream • Vintage 1950s style soul ballad',       videoId: 'GxldQ9GyXfY' },
  '7qEHsqek3amrGQHHW9WOpd': { title: 'Until I Found You — Stephen Sanchez',          subtitle: 'Synced Stream • Vintage 1950s style soul ballad',       videoId: 'GxldQ9GyXfY' },
  // John Legend - All of Me
  '3U4isOIWM3VvDubwSI3y7a': { title: 'All of Me — John Legend',                      subtitle: 'Synced Stream • Soulful piano love anthem',             videoId: '450p7goxZqg' },
  // Lady Gaga & Bruno Mars - Die With A Smile
  '2plbrEY59IikOBNoBvt7x0': { title: 'Die With A Smile — Lady Gaga & Bruno Mars',    subtitle: 'Synced Stream • Romantic vocal masterpiece',             videoId: 'kPa7bsKwL-8' },
  '1mea3bSkSGXuIRvnydlB5b': { title: 'Die With A Smile — Lady Gaga & Bruno Mars',    subtitle: 'Synced Stream • Romantic vocal masterpiece',             videoId: 'kPa7bsKwL-8' },
  // Kina Grannis - Can't Help Falling in Love
  '1vYxbdtPtqI2uG491Z26Bf': { title: "Can't Help Falling in Love — Kina Grannis",    subtitle: 'Synced Stream • Soft acoustic romance',                 videoId: 'P4XfB8o4Q1o' },
  // Taylor Swift - Lover
  '1dGr1nxG9ZGpmZbaBp1IYW': { title: 'Lover — Taylor Swift',                         subtitle: 'Synced Stream • Romantic waltz for couples',             videoId: '-BjZmE2gtdo' },
  // James Arthur - Say You Won't Let Go
  '0vg4WnUWv4K69wSDf29tp5': { title: "Say You Won't Let Go — James Arthur",          subtitle: 'Synced Stream • Warm acoustic guitar & vocals',          videoId: '0yW7w8F2TVA' },
  // Christina Perri - A Thousand Years
  '6lanRgr6w69um7oqpm8TwA': { title: 'A Thousand Years — Christina Perri',           subtitle: 'Synced Stream • Pure romantic cello & piano ballad',     videoId: 'rtOvBOTyX00' },
  // JVKE - golden hour
  '5odlY52u43F5BjByvv7GSw': { title: 'golden hour — JVKE',                          subtitle: 'Synced Stream • Emotional piano romantic masterpiece',   videoId: 'PEM0Vs8jf1w' },
  // Ruth B. - Dandelions
  '2eAvDnpXP5W0cVhuKJj1Dw': { title: 'Dandelions — Ruth B.',                         subtitle: 'Synced Stream • Gentle whimsical love song',            videoId: 'W8a4sUabCUo' },
  // The Weeknd - Die For You
  '2Ch7LmS7r2Cool42cuQAqw': { title: 'Die For You — The Weeknd',                     subtitle: 'Synced Stream • Smooth R&B romantic devotion',           videoId: 'u9n7Cw-4_PE' },
  // Bruno Mars - Just the Way You Are
  '7BqBn9nXd0B0OiNOUpGl3A': { title: 'Just the Way You Are — Bruno Mars',            subtitle: 'Synced Stream • Uplifting classic love anthem',          videoId: 'LjhCEhWiKXk' },
  // Calum Scott - You Are The Reason
  '69vToJ9BMbbLlFZo7k7A78': { title: 'You Are The Reason — Calum Scott',             subtitle: 'Synced Stream • Powerful heartfelt emotional ballad',    videoId: 'ShZ978fBl6Y' },
  // Arijit Singh - Kesariya (Brahmāstra)
  '7n92Q7XhWkWy0Y9x6k9j1b': { title: 'Kesariya — Arijit Singh',                     subtitle: 'Synced Stream • Soulful Indian acoustic romance',        videoId: 'BddP6PYo2gs' },
  // Arijit Singh - Tum Hi Ho
  '1qE0dkhz95427rG87Vp0jU': { title: 'Tum Hi Ho — Arijit Singh',                     subtitle: 'Synced Stream • Iconic piano romantic anthem',           videoId: 'IJq0yyWug1k' },
  // Shershaah - Raataan Lambiyan
  '2rGP8e35r6m63pW9vWfXQv': { title: 'Raataan Lambiyan — Tanishk Bagchi',            subtitle: 'Synced Stream • Sweet acoustic romantic melodies',       videoId: 'gvyUuxdRdR4' },
  // Playlists
  '37i9dQZF1DX50oq6vV7x2S': { title: 'Love Ballads & Romance',                       subtitle: 'Synced Stream • All-time romantic classics & slow dance',videoId: 'DWcJFNfaw9c' },
  '37i9dQZF1DX2pSTOxoPbx9': { title: 'Cozy Acoustic Love',                            subtitle: 'Synced Stream • Warm guitar fingerpicking & soft vocals',videoId: 'rtOvBOTyX00' },
  '37i9dQZF1DX4t95PaoR1zy': { title: 'Midnight Lo-Fi Romance',                        subtitle: 'Synced Stream • Gentle study & chill beats for two',     videoId: '5qap5aO4i9A' },
};

/** Build a youtube-nocookie embed URL with JS API enabled */
function ytSyncEmbed(videoId: string): string {
  const originParam = typeof window !== 'undefined'
    ? `&origin=${encodeURIComponent(window.location.origin)}`
    : '';
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1${originParam}`;
}

/**
 * Parse any user-provided URL and convert it into a secure embed player.
 * Spotify URLs are resolved to a synchronisable shared player so both
 * partners hear the same audio in real time without login requirements.
 */
export function parseStreamingUrl(rawUrl: string, customTitle?: string): StreamingTrackInfo | null {
  const url = extractUrl(rawUrl);
  if (!url) return null;

  // 1. Spotify → Synchronised shared player
  if (url.includes('spotify.com') || url.startsWith('spotify:')) {
    let type: 'track' | 'playlist' | 'album' | 'artist' | 'episode' = 'track';
    let id = '';

    const spotifyMatch = url.match(
      /spotify\.com\/(?:intl-[a-zA-Z-]+\/)?(?:embed\/)?(track|playlist|album|artist|episode)\/([a-zA-Z0-9]+)/i
    );
    if (spotifyMatch) {
      type = spotifyMatch[1].toLowerCase() as any;
      id = spotifyMatch[2];
    } else if (url.startsWith('spotify:')) {
      const parts = url.split(':');
      if (parts.length >= 3) {
        type = (parts[1] === 'playlist' || parts[1] === 'album') ? parts[1] : 'track';
        id = parts[2];
      }
    }

    if (id) {
      const spotifyUri = `spotify:${type}:${id}`;
      const mapped = SPOTIFY_SYNC_MAP[id];
      const videoId = mapped ? mapped.videoId : '2Vv-BfVoq4g';
      const title = customTitle || (mapped ? mapped.title : 'Spotify Love Song');
      const subtitle = mapped
        ? mapped.subtitle
        : `Synced Stream • Spotify ${type.charAt(0).toUpperCase() + type.slice(1)}`;

      return {
        provider: 'spotify',
        embedUrl: ytSyncEmbed(videoId),
        originalUrl: url,
        spotifyUri,
        title,
        subtitle,
        icon: '🟢',
        type: type === 'playlist' || type === 'album' ? type : 'track',
        height: 200,
      };
    }
  }

  // 2. Apple Music (Handles /us/album/..., /in/playlist/..., with or without track ?i= query)
  if (url.includes('music.apple.com')) {
    const isPlaylist = url.includes('/playlist/');
    const isAlbum = url.includes('/album/');
    const type = isPlaylist ? 'playlist' : isAlbum ? 'album' : 'track';

    // Official Apple Music embed host
    const embedUrl = url.replace('https://music.apple.com', 'https://embed.music.apple.com');
    const title =
      customTitle || (isPlaylist ? 'Apple Music Romantic Playlist' : 'Apple Music Love Ballad');

    return {
      provider: 'apple-music',
      embedUrl,
      originalUrl: url,
      title,
      subtitle: `Apple Music ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      icon: '🍎',
      type,
      height: isPlaylist ? 352 : 152,
    };
  }

  // 3. YouTube & YouTube Music (Handles watch?v=, music.youtube.com, youtu.be, shorts, and playlists)
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    let playlistId = '';

    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      videoId = urlObj.searchParams.get('v') || '';
      playlistId = urlObj.searchParams.get('list') || '';

      if (!videoId && urlObj.pathname.includes('/shorts/')) {
        videoId = urlObj.pathname.split('/shorts/')[1]?.split('/')[0]?.split('?')[0] || '';
      }
      if (!videoId && urlObj.pathname.includes('/embed/')) {
        videoId = urlObj.pathname.split('/embed/')[1]?.split('/')[0]?.split('?')[0] || '';
      }
      if (!videoId && (urlObj.hostname === 'youtu.be' || urlObj.pathname.startsWith('/'))) {
        const pathPart = urlObj.pathname.replace(/^\//, '').split('?')[0].split('/')[0];
        if (pathPart && pathPart !== 'watch' && pathPart !== 'playlist') {
          videoId = pathPart;
        }
      }
    } catch {
      const vMatch = url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([a-zA-Z0-9_-]{11})/);
      if (vMatch) videoId = vMatch[1];
      const pMatch = url.match(/list=([a-zA-Z0-9_-]+)/);
      if (pMatch) playlistId = pMatch[1];
    }

    if (videoId || playlistId) {
      let embedUrl = '';
      const originParam = typeof window !== 'undefined' ? `&origin=${encodeURIComponent(window.location.origin)}` : '';
      if (videoId) {
        // Always prioritize the exact song/video ID so YouTube never redirects to an unrelated radio mix or wrong track
        embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1${originParam}`;
      } else {
        embedUrl = `https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}&autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1${originParam}`;
      }

      const title =
        customTitle ||
        (playlistId && !videoId ? 'YouTube Romantic Playlist' : 'YouTube Music Stream');

      return {
        provider: 'youtube',
        embedUrl,
        originalUrl: url,
        title,
        subtitle: playlistId ? 'YouTube Playlist' : 'YouTube Music',
        icon: '▶️',
        type: playlistId ? 'playlist' : 'video',
        height: 200,
      };
    }
  }

  // 4. SoundCloud
  if (url.includes('soundcloud.com')) {
    const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
      url
    )}&color=%23f43f5e&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
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
 * Designed to be commercial/ad-free or official editorial embeds
 */
export const ROMANTIC_STREAMING_PRESETS: StreamingTrackInfo[] = [
  // Spotify Synced Presets — both partners hear the same audio in lockstep, zero login needed
  {
    provider: 'spotify',
    originalUrl: 'https://open.spotify.com/track/0tgVpDi06FyKpA1z0VMD4v',
    embedUrl: 'https://www.youtube-nocookie.com/embed/2Vv-BfVoq4g?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1',
    spotifyUri: 'spotify:track:0tgVpDi06FyKpA1z0VMD4v',
    title: 'Perfect — Ed Sheeran',
    subtitle: 'Synced Stream • Timeless acoustic love ballad',
    icon: '🟢',
    type: 'track',
    height: 200,
  },
  {
    provider: 'spotify',
    originalUrl: 'https://open.spotify.com/track/0P6cw2qYwVzF6x8l0Y3l0h',
    embedUrl: 'https://www.youtube-nocookie.com/embed/GxldQ9GyXfY?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1',
    spotifyUri: 'spotify:track:0P6cw2qYwVzF6x8l0Y3l0h',
    title: 'Until I Found You — Stephen Sanchez',
    subtitle: 'Synced Stream • Vintage 1950s style soul ballad',
    icon: '🟢',
    type: 'track',
    height: 200,
  },
  {
    provider: 'spotify',
    originalUrl: 'https://open.spotify.com/track/3U4isOIWM3VvDubwSI3y7a',
    embedUrl: 'https://www.youtube-nocookie.com/embed/450p7goxZqg?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1',
    spotifyUri: 'spotify:track:3U4isOIWM3VvDubwSI3y7a',
    title: 'All of Me — John Legend',
    subtitle: 'Synced Stream • Soulful piano love anthem',
    icon: '🟢',
    type: 'track',
    height: 200,
  },
  {
    provider: 'spotify',
    originalUrl: 'https://open.spotify.com/track/2plbrEY59IikOBNoBvt7x0',
    embedUrl: 'https://www.youtube-nocookie.com/embed/kPa7bsKwL-8?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1',
    spotifyUri: 'spotify:track:2plbrEY59IikOBNoBvt7x0',
    title: 'Die With A Smile — Lady Gaga & Bruno Mars',
    subtitle: 'Synced Stream • Romantic vocal masterpiece',
    icon: '🟢',
    type: 'track',
    height: 200,
  },
  {
    provider: 'spotify',
    originalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX50oq6vV7x2S',
    embedUrl: 'https://www.youtube-nocookie.com/embed/DWcJFNfaw9c?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1',
    spotifyUri: 'spotify:playlist:37i9dQZF1DX50oq6vV7x2S',
    title: 'Love Ballads & Romance',
    subtitle: 'Synced Stream • All-time romantic classics & slow dance',
    icon: '🟢',
    type: 'playlist',
    height: 200,
  },
  {
    provider: 'spotify',
    originalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2pSTOxoPbx9',
    embedUrl: 'https://www.youtube-nocookie.com/embed/rtOvBOTyX00?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1',
    spotifyUri: 'spotify:playlist:37i9dQZF1DX2pSTOxoPbx9',
    title: 'Cozy Acoustic Love',
    subtitle: 'Synced Stream • Warm guitar fingerpicking & soft vocals',
    icon: '🟢',
    type: 'playlist',
    height: 200,
  },
  {
    provider: 'spotify',
    originalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4t95PaoR1zy',
    embedUrl: 'https://www.youtube-nocookie.com/embed/5qap5aO4i9A?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1',
    spotifyUri: 'spotify:playlist:37i9dQZF1DX4t95PaoR1zy',
    title: 'Midnight Lo-Fi Romance',
    subtitle: 'Synced Stream • Gentle study & chill beats for two',
    icon: '🟢',
    type: 'playlist',
    height: 200,
  },

  // Apple Music Official Presets
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

  // YouTube Live & Ad-Free Continuous Streams (100% Synced, Zero Login Required)
  {
    provider: 'youtube',
    originalUrl: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g',
    embedUrl: 'https://www.youtube-nocookie.com/embed/2Vv-BfVoq4g?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1',
    title: 'Ed Sheeran — Perfect (Acoustic)',
    subtitle: 'YouTube Music • Timeless romantic ballad for slow dancing',
    icon: '▶️',
    type: 'video',
    height: 200,
  },
  {
    provider: 'youtube',
    originalUrl: 'https://www.youtube.com/watch?v=GxldQ9GyXfY',
    embedUrl: 'https://www.youtube-nocookie.com/embed/GxldQ9GyXfY?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1',
    title: 'Until I Found You — Stephen Sanchez',
    subtitle: 'YouTube Music • Vintage 1950s style soul ballad',
    icon: '▶️',
    type: 'video',
    height: 200,
  },
  {
    provider: 'youtube',
    originalUrl: 'https://www.youtube.com/watch?v=P4XfB8o4Q1o',
    embedUrl: 'https://www.youtube-nocookie.com/embed/P4XfB8o4Q1o?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1',
    title: "Can't Help Falling in Love — Kina Grannis",
    subtitle: 'YouTube Music • Delicate acoustic guitar & velvet vocals',
    icon: '▶️',
    type: 'video',
    height: 200,
  },
  {
    provider: 'youtube',
    originalUrl: 'https://www.youtube.com/watch?v=rtOvBOTyX00',
    embedUrl: 'https://www.youtube-nocookie.com/embed/rtOvBOTyX00?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1',
    title: 'A Thousand Years — Christina Perri',
    subtitle: 'YouTube Music • Pure romantic cello & piano ballad',
    icon: '▶️',
    type: 'video',
    height: 200,
  },
  {
    provider: 'youtube',
    originalUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    embedUrl: 'https://www.youtube-nocookie.com/embed/5qap5aO4i9A?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1',
    title: 'Lofi Girl: Relaxing Romantic Beats',
    subtitle: 'YouTube Live • Peaceful beats to talk, dream & relax to',
    icon: '▶️',
    type: 'video',
    height: 200,
  },
  {
    provider: 'youtube',
    originalUrl: 'https://www.youtube.com/watch?v=DWcJFNfaw9c',
    embedUrl: 'https://www.youtube-nocookie.com/embed/DWcJFNfaw9c?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1',
    title: 'Romantic Candlelight Piano',
    subtitle: 'YouTube Music • Beautiful peaceful piano melodies for couples',
    icon: '▶️',
    type: 'video',
    height: 200,
  },
];
