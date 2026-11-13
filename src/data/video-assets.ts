const origin = import.meta.env.VITE_SUPABASE_URL?.replace(/\/+$/, "") || "";
const bucket = `${origin}/storage/v1/object/public/vault-media`;

export const echoPrimeVideos = [
  `${bucket}/video-echo-prime-01.mp4`,
  `${bucket}/video-echo-prime-02.mp4`,
  `${bucket}/video-echo-prime-03.mp4`,
] as const;
