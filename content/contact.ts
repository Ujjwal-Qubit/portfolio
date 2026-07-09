export interface ContactLink {
  label: string;
  href?: string;
}

export interface Contact {
  github: ContactLink;
  linkedin: ContactLink;
  instagram: ContactLink;
  email: string;
}

// Source of truth: Content Dossier (B2), Checklist B3.
export const contact: Contact = {
  github: { label: "GitHub", href: "https://github.com/Ujjwal-Qubit/" },
  linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/kaushikujjwal/" },
  instagram: { label: "Instagram", href: "https://www.instagram.com/ujjwal_insane/" },
  email: "ujjwalkaushik672@gmail.com",
};
