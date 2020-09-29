import GirlOnBeach from '../../Images/Miniatures/GirlOnBeach/GirlOnBeach.jpg';
import Temple6 from '../../Images/Terrain/TempleInterior/Temple6.jpg';
import GameAnimation from '../../Images/Other/WizardWars/FireAnimation.gif'

export const sections = [
  { title: 'Home', url: '#' },
  {
    title: 'Miniatures',
    date: 'Aug 4',
    description:
      "Hand painted miniature creatures, characters, and props. ",
    image: GirlOnBeach,
    url: '/Gallery',
  },
  {
    title: 'Terrain',
    date: 'Aug 4',
    description:
      "Sculpted from clay, foam, or even trash! Realistic landscaps crafted and painted from basic every day items.",
    image: Temple6,
    url: '/Gallery',
  },
  {
    title: 'Other Projects',
    date: 'Aug 4',
    description:
      "Other projects I've worked on, including 3d printing, creating games, and anything else I'm proud of.",
    image: GameAnimation, 
    url: '/Gallery'
  },
];