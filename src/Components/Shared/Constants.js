import TRex from '../../Images/Miniatures/TRex/Trex1.jpg';
import Temple6 from '../../Images/Terrain/TempleInterior/Temple6.jpg';
import GameAnimation from '../../Images/Other/WizardWars/WizardWarsFireGif.gif'
import GundamCentaur3 from '../../Images/ModelKits/GundamCentaur/GundamCentaur3.jpg'

export const sections = [
   {
    title: 'Miniatures',
    description:
      "Hand painted miniature creatures, characters, and props. Monsters that can fit in the palm of your hand!",
    image: GirlOnBeach,
    url: '/gallery/miniatures',
  },
  {
    title: 'Terrain',
    description:
      "Sculpted from a wide variety of items including clay, foam, or even trash! Realistic landscaps crafted and painted from basic every day items.",
    image: Temple6,
    url: '/gallery/terrain',
  },
  {
    title: 'Model Kits',
    description:
      "Model kits involve tiny plastic parts and following instructions. Not as creative as other projects, but oh so satisfying.",
    image: GundamCentaur3, 
    url: '/gallery/modelkits'
  },
  {
    title: 'Other Projects',
    description:
      "Other projects I've worked on, including 3d printing, creating games, and anything else I think is cool enough to share.",
    image: GameAnimation, 
    url: '/gallery/other'
  },
];

export default sections;