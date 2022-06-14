import miniaturePreview from '../../Images/Miniatures/Blimpy/Blimpy2.jpg';
import terrainPreview from '../../Images/Terrain/TempleInterior/Temple6.jpg';
import modelkitPreview from '../../Images/ModelKits/GundamCentaur/GundamCentaur3.jpg'
import otherPreview from '../../Images/Other/WizardWars/WizardWarsFireGif.gif'

export const sections = [
   {
    title: 'Miniatures',
    description:
      "Hand painted miniature creatures, characters, and props. Monsters that can fit in the palm of your hand!",
    image: miniaturePreview,
    url: '/gallery/miniatures',
  },
  {
    title: 'Terrain',
    description:
      "Sculpted from a wide variety of items including clay, foam, or even trash! Realistic landscaps crafted and painted from basic every day items.",
    image: terrainPreview,
    url: '/gallery/terrain',
  },
  {
    title: 'Model Kits',
    description:
      "Model kits involve tiny plastic parts and following instructions. Not as creative as other projects, but oh so satisfying.",
    image: modelkitPreview, 
    url: '/gallery/modelkits'
  },
  {
    title: 'Other Projects',
    description:
      "Other projects I've worked on, including 3d printing, creating games, and anything else I think is cool enough to share.",
    image: otherPreview, 
    url: '/gallery/other'
  },
];

export default sections;