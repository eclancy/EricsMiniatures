import GirlOnBeach from '../../Images/Miniatures/GirlOnBeach/GirlOnBeach1.jpg';
import Temple6 from '../../Images/Terrain/TempleInterior/Temple6.jpg';
import GameAnimation from '../../Images/Other/WizardWars/FireAnimation.gif'

export const sections = [
   {
    title: 'Miniatures',
    date: 'Aug 4',
    description:
      "Hand painted miniature creatures, characters, and props. Monsters that can fit in the palm of your hand!",
    image: GirlOnBeach,
    url: '/gallery/miniatures',
  },
  {
    title: 'Terrain',
    date: 'Aug 4',
    description:
      "Sculpted from a wide variety of items including clay, foam, or even trash! Realistic landscaps crafted and painted from basic every day items.",
    image: Temple6,
    url: '/gallery/terrain',
  },
  {
    title: 'Other Projects',
    date: 'Aug 4',
    description:
      "Other projects I've worked on, including 3d printing, creating games, and anything else I think is cool enough to share.",
    image: GameAnimation, 
    url: '/gallery/other'
  },
];

export function getSection() {
  if (window.location.href.includes('miniatures')) {
    return 'miniatures'
  }
  else if (window.location.href.includes('terrain')) {
    return 'terrain'
  }
  else if (window.location.href.includes('other')) {
    return 'other'
  }
}

export default sections;