import { PresetCollection } from "./types";

export const PRESETS: PresetCollection = {
  subjects: [
    {
      id: "subj-1",
      name: "Cyberpunk Hacker Cat",
      imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80",
      description: "A cool cat wearing neon-glowing cyber visor glasses and small ear-set."
    },
    {
      id: "subj-2",
      name: "Astronaut Explorer",
      imageUrl: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=200&auto=format&fit=crop&q=80",
      description: "An adventurer wearing a detailed golden-retlector interstellar spacesuit."
    },
    {
      id: "subj-3",
      name: "Origami Crimson Dragon",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
      description: "A highly intricate red folded paper dragon with delicate paper creases."
    },
    {
      id: "subj-4",
      name: "Vintage Roadster Coupe",
      imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=200&auto=format&fit=crop&q=80",
      description: "A sleek classic 1950s sports car with chrome bumpers and wire-spoke wheels."
    },
    {
      id: "subj-5",
      name: "Adorable Golden Retriever",
      imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&auto=format&fit=crop&q=80",
      description: "A happy, smiling golden retriever puppy looking upwards values."
    }
  ],
  scenes: [
    {
      id: "scene-1",
      name: "Neon Tokyo Streets",
      imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=200&auto=format&fit=crop&q=80",
      description: "A dynamic Tokyo alleyway covered in holographic neon advertisements and rain puddles."
    },
    {
      id: "scene-2",
      name: "Overgrown Forest Temple",
      imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=200&auto=format&fit=crop&q=80",
      description: "Mystical stone ruins shrouded in climbing ivy and bright shafts of emerald sunlight."
    },
    {
      id: "scene-3",
      name: "Floating Cloud Islands",
      imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80",
      description: "Ethereal, gravity-defying rock islands floating in a soft pastel pink sky filled with nebulae."
    },
    {
      id: "scene-4",
      name: "Rainy Cafe Window",
      imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&auto=format&fit=crop&q=80",
      description: "A cozy modern coffee shop table next to a large misted glass window with water droplets."
    },
    {
      id: "scene-5",
      name: "Minimalist Sandy Desert",
      imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=200&auto=format&fit=crop&q=80",
      description: "Smooth golden sand dunes with sharp wind-carved geometric shadows under a dark navy sky."
    }
  ],
  styles: [
    {
      id: "style-1",
      name: "3D Claymation & Plasticine",
      imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80",
      description: "Charming stop-motion look with fingerprint textures, tactile details, and cute proportions."
    },
    {
      id: "style-2",
      name: "Vibrant Watercolor Blend",
      imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200&auto=format&fit=crop&q=80",
      description: "Dreamy color wash with organic pigment blooms, soft splatters, and dynamic brushstrokes."
    },
    {
      id: "style-3",
      name: "Retro 1980s Synthwave",
      imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80",
      description: "Electric magenta and ultraviolet light traces, wireframe grids, and early-computational aesthetics."
    },
    {
      id: "style-4",
      name: "Isometric Vector Flat",
      imageUrl: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=200&auto=format&fit=crop&q=80",
      description: "Clean mathematical geometry, pastel tones, isometric rendering ideal for app UI illustrations."
    },
    {
      id: "style-5",
      name: "Vintage Studio Oil Portrait",
      imageUrl: "https://images.unsplash.com/photo-1579783928621-7a13d66a6211?w=200&auto=format&fit=crop&q=80",
      description: "Rich layered impasto paint strokes, warm directional candle-light, and cracked glaze texture."
    }
  ]
};
export const DEFAULT_RECIPE_SUGGESTIONS = [
  {
    title: "Clay Adventure",
    subject: "A tiny adventurous explorer red panda wearing a woolly green scarf",
    scene: "An overgrown stone step ruins buried deep in a misty green jungle",
    style: "Charming tactile 3D claymation and physical modeling style with soft studio warm glow",
    explanation: "Creates a adorable, highly detailed toy-like adventure."
  },
  {
    title: "Cyber City Cat",
    subject: "A cyberpunk gray street cat sitting atop an old computer monitor console",
    scene: "Rainy futuristic Tokyo alleyways with bright pink and neon yellow advertisements",
    style: "Electric retro 1980s synthwave vaporwave with glowing wireframes and clean neon lighting",
    explanation: "Evokes striking high-energy futuristic nightlife styles."
  },
  {
    title: "Celestial Voyager",
    subject: "A lonely glass capsule floating sailboat with radiant sails",
    scene: "An active spiral galaxy core swirling in clouds of sparkling amethyst and gold stardust",
    style: "Dreamy vibrant watercolor painting with soft organic splatters and rich pigment glows",
    explanation: "Blends epic cosmic scale with elegant classical paint mediums."
  }
];
