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
  github: { label: "GitHub", href: "https://github.com/Ujjwal-Qubit" },
  // TODO(content): Dossier only captured the LinkedIn link-preview title
  // ("Ujjwal Kaushik | LinkedIn"), not the actual URL — add the real profile link.
  linkedin: { label: "LinkedIn" },
  // TODO(content): Dossier only captured the word "Instagram" as a link-preview
  // title, not the actual handle/URL — add the real profile link.
  instagram: { label: "Instagram" },
  email: "ujjwalkaushik672@gmail.com",
};
