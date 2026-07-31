/**
 * Single source of truth for everything that is *about* Lakmal rather than
 * about a project. Components import from here so a phone number or a social
 * handle is never duplicated across the markup.
 */

export const site = {
  name: 'Lakmal Wijethunga',
  initials: 'LW',
  role: '3D Artist & Digital Creator',
  location: 'Mirigama, Western Province',
  locationShort: 'Mirigama, Sri Lanka',
  country: 'LK',
  region: 'Western Province',
  email: 'mpplwijethunga@gmail.com',
  phone: '+94 768681539',
  phoneHref: '+94768681539',
  cvFile: 'documents/Lakmal_Wijethunga_CV.pdf',
  cvDownloadName: 'Lakmal_Wijethunga_CV.pdf',
  formEndpoint: 'https://formspree.io/f/mnndprno',
  availability: 'Available for freelance work',
} as const;

export const socials = [
  { icon: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/lakmalwijethungaa' },
  { icon: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/lakmalwije/' },
  { icon: 'x-twitter', label: 'X (Twitter)', url: 'https://x.com/lakmal_wijeth' },
  { icon: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/lakmal_wije/' },
  { icon: 'github', label: 'GitHub', url: 'https://github.com/lakmal-wijethunga' },
] as const;

/** Drives both the desktop and mobile navigation, and the footer. */
export const navItems = [
  { label: 'Home', href: '#top' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#work' },
  { label: 'Contact', href: '#contact' },
] as const;

export const toolkit = [
  'Blender',
  'Fusion 360',
  'Revit',
  'CLO 3D',
  'Houdini',
  'After Effects',
  'Environment Design',
  'PBR Texturing',
  'Rendering',
  'Stable Diffusion',
  'LLM',
  '3D Printing',
] as const;

export const services = [
  {
    icon: 'cube',
    title: '3D Modeling',
    text: 'High-quality models built with precision — props and assets for games, film and interactive media, with optimized topology and close attention to detail.',
  },
  {
    icon: 'tree',
    title: 'Environment Design',
    text: 'Immersive, detailed 3D environments that tell a story and hold an atmosphere.',
  },
  {
    icon: 'paintbrush',
    title: 'PBR Texturing',
    text: 'Physically-based materials that bring a model to life: realistic surface response, weathering and honest material definition.',
  },
  {
    icon: 'gears',
    title: 'Logo Animation',
    text: 'Motion graphics that sharpen brand identity — smooth transitions, considered timing and effects that leave an impression.',
  },
  {
    icon: 'code',
    title: 'AI Model Training',
    text: 'Custom models for specific use cases such as object detection and classification, tuned for deployment on edge devices with a tight compute budget.',
  },
] as const;

/** Filter chips for the work grid; values match the content collection enum. */
export const categories = [
  { value: 'all', label: 'All Work' },
  { value: 'animations', label: 'Animation' },
  { value: 'environments', label: 'Environments' },
  { value: 'product', label: 'Product Design' },
  { value: 'ai', label: 'AI' },
  { value: 'technical', label: 'Technical / R&D' },
] as const;

/** Human-readable label for a project's category. */
export const categoryLabel: Record<string, string> = {
  animations: 'Animation',
  environments: 'Environment',
  product: 'Product Design',
  ai: 'AI',
  technical: 'Technical / R&D',
};
