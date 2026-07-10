export interface Profile {
  photo: string;
  bio: string;
}

// TODO(content): the Site Copy (Final) doc had no About section — this bio is a
// placeholder standing in until the real copy is supplied. Swap before shipping.
export const profile: Profile = {
  photo: "/photo.png",
  bio: "About copy coming soon — this paragraph is a placeholder standing in for Ujjwal's bio until the real text is written.",
};
