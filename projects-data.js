/**
 * Portfolio project data.
 *
 * This is the single source of truth for every project card on the site.
 * To add / edit / remove a project, use admin.html (it generates this file for
 * you), or edit the PROJECTS array below by hand and commit it.
 *
 * Schema for each project:
 *   {
 *     id:          unique slug (used for likes + DOM id)      // string, required
 *     title:       display name                               // string, required
 *     category:    "animations" | "environments" | "product" | "ai"
 *     tools:       ["Blender", "After Effects", ...]          // array of strings
 *     description: overview text                              // string
 *     media:       [ { type: "video" | "image", src: "path" }, ... ]
 *                  - one video  -> video card (plays only while on screen)
 *                  - one image  -> single image card
 *                  - 2+ images  -> auto slideshow with arrows
 *                  Optional per-item optimization fields:
 *                    image: "webp"   -> a .webp version; browser uses it, falls back to src
 *                    video: "poster" -> a still image shown before the video plays
 *                  (See generate-media.ps1 to create these assets in bulk.)
 *     links:       [ { label: "Breakdown", url: "https://..." }, ... ]  // optional
 *   }
 */
const PROJECTS = [
  {
    id: "ess-logo",
    title: "ESS Logo Animation",
    category: "animations",
    tools: ["Blender", "After Effects"],
    description: "Created a dynamic and visually engaging logo animation for the Electronics Student Society at the University of Kelaniya, showcasing their innovative spirit and technological focus.",
    media: [{ type: "video", src: "projects/ESS/ess_logo_animation.mp4" }],
    links: [{ label: "Breakdown", url: "https://x.com/lakmal_wijeth/status/1695793106912723378" }]
  },
  {
    id: "padura-stage",
    title: "Padura Concert Stage",
    category: "environments",
    tools: ["Blender", "Revit"],
    description: "Designed 3D visualization for the \"Padura\" concert organized by the Science Students' Union. The project involved creating an immersive stage environment enhancing the overall concert experience.",
    media: [{ type: "image", src: "projects/padura/padura_stage.jpg" }],
    links: [
      { label: "Breakdown", url: "https://x.com/lakmal_wijeth/status/1918608944362029124" },
      { label: "View Details", url: "https://www.facebook.com/share/p/1CHT7gnm8v/" }
    ]
  },
  {
    id: "mama-pathuwe",
    title: "මම පැතුවේ....",
    category: "ai",
    tools: ["Stable Diffusion", "AI Tools"],
    description: "Music video generated with AI✨",
    media: [{ type: "video", src: "projects/mama_pathuwe/mama_pathuwe.mp4" }],
    links: [{ label: "View Details", url: "https://x.com/lakmal_wijeth/status/1825449903465918786" }]
  },
  {
    id: "icaps-logo",
    title: "ICAPS Logo Animation",
    category: "animations",
    tools: ["Blender", "After Effects"],
    description: "Designed a captivating logo animation for the International Conference on Applied and Pure Sciences 2024, reflecting the conference's dedication to innovation and scientific excellence.",
    media: [{ type: "video", src: "projects/icaps/logo_animation.mp4" }],
    links: [{ label: "Breakdown", url: "https://x.com/lakmal_wijeth/status/1845119198483366025" }]
  },
  {
    id: "icaps-thankyou",
    title: "ICAPS Guest Appreciation Animation",
    category: "animations",
    tools: ["Blender", "After Effects"],
    description: "Created a heartfelt appreciation animation, showcasing gratitude and respect for contributions to the field of science and education.",
    media: [{ type: "video", src: "projects/icaps/thank_you.mp4" }],
    links: [{ label: "Breakdown", url: "https://x.com/lakmal_wijeth/status/1845119787770446051" }]
  },
  {
    id: "cloth-sim",
    title: "Dynamic Cloth Simulation",
    category: "animations",
    tools: ["CLO 3D", "Blender", "Marvelous Designer"],
    description: "Showcasing a dynamic cloth simulation created using CLO 3D for garment design and Blender 3D for advanced simulation and rendering.",
    media: [{ type: "video", src: "projects/cloth_sim/cloth_sim.mp4" }],
    links: [{ label: "Breakdown", url: "https://x.com/lakmal_wijeth/status/1847795826401431816" }]
  },
  {
    id: "iveco-zeta",
    title: "Iveco Zeta",
    category: "product",
    tools: ["Blender", "Fusion 360", "3D Printing"],
    description: "Designed a detailed 3D model of the Iveco Zeta truck, optimized specifically for 3D printing. This project involved precise scaling, intricate detailing, and ensuring printability for high-quality physical replicas.",
    media: [
      { type: "image", src: "projects/ivenco_zeta/side.png" },
      { type: "image", src: "projects/ivenco_zeta/Screenshot 2025-04-28 152341.png" },
      { type: "image", src: "projects/ivenco_zeta/Screenshot 2025-04-28 152315.png" },
      { type: "image", src: "projects/ivenco_zeta/Screenshot 2025-04-28 152304.png" },
      { type: "image", src: "projects/ivenco_zeta/back.png" },
      { type: "image", src: "projects/ivenco_zeta/1.png" }
    ],
    links: [{ label: "View Details", url: "https://x.com/lakmal_wijeth/status/1916795847066403053" }]
  },
  {
    id: "pss-logo",
    title: "PSS Logo Animation",
    category: "animations",
    tools: ["Blender", "After Effects"],
    description: "Designed a captivating logo animation for the Physics Students' Society at the University of Kelaniya.",
    media: [{ type: "video", src: "projects/pss/white_back0001-0300.mp4" }],
    links: [{ label: "Breakdown", url: "https://x.com/lakmal_wijeth/status/1916817905326735380" }]
  },
  {
    id: "defender-body",
    title: "Defender Body",
    category: "product",
    tools: ["Fusion 360", "3D Printing"],
    description: "Designed a 3D model of an RC Defender body, optimized for 3D printing. This project involved precise scaling, and ensuring structural integrity for a seamless assembly and realistic appearance.",
    media: [
      { type: "image", src: "projects/defender_body/Screenshot 2025-04-29 220130.png" },
      { type: "image", src: "projects/defender_body/Screenshot 2025-04-29 220142.png" },
      { type: "image", src: "projects/defender_body/Screenshot 2025-04-29 220307.png" }
    ],
    links: []
  },
  {
    id: "caravan-fresh",
    title: "Caravan Fresh Outlet Renovation",
    category: "environments",
    tools: ["Revit", "Blender"],
    description: "A complete 3D visualization and design concept for the interior renovation of a Caravan Fresh outlet. The project focused on creating a modern, welcoming space with an efficient layout for customers and staff.",
    media: [
      { type: "image", src: "projects/CaravanFresh/1.png" },
      { type: "image", src: "projects/CaravanFresh/2.png" },
      { type: "image", src: "projects/CaravanFresh/3.png" },
      { type: "image", src: "projects/CaravanFresh/4.png" },
      { type: "image", src: "projects/CaravanFresh/5.png" },
      { type: "image", src: "projects/CaravanFresh/6.png" },
      { type: "image", src: "projects/CaravanFresh/7.png" },
      { type: "image", src: "projects/CaravanFresh/8.png" }
    ],
    links: []
  },
  {
    id: "traditional-mask",
    title: "Traditional Mask",
    category: "product",
    tools: ["Blender", "3D Printing", "Silicone Molding"],
    description: "A detailed 3D model of a traditional Sri Lankan 'Yaka' mask, digitally sculpted and optimized for 3D printing. This model serves as a master pattern for creating silicone molds, intended for the production of cultural souvenirs like keytags and fridge magnets.",
    media: [
      { type: "image", src: "projects/Mask/Screenshot 2025-08-28 185643.png" },
      { type: "image", src: "projects/Mask/Screenshot 2025-08-28 185701.png" }
    ],
    links: []
  },
  {
    id: "tatra-148",
    title: "Tatra 148",
    category: "product",
    tools: ["Fusion 360", "Blender", "Resin 3D Printing"],
    description: "A collection of detailed 3D models featuring heavy-duty and emergency vehicles, including a Tatra 148 Crane, Cargo Truck, Digger, Tipper, and Firetruck. Each vehicle was accurately modeled and specifically optimized for Resin 3D printing.",
    media: [
      { type: "image", src: "projects/Tatra 148/1.png" },
      { type: "image", src: "projects/Tatra 148/2.png" },
      { type: "image", src: "projects/Tatra 148/3.png" },
      { type: "image", src: "projects/Tatra 148/4.png" },
      { type: "image", src: "projects/Tatra 148/5.png" },
      { type: "image", src: "projects/Tatra 148/6.png" }
    ],
    links: []
  },
  {
    id: "acrylic-lamp",
    title: "Acrylic Lamp",
    category: "product",
    tools: ["Fusion 360", "3D Printing", "Electronics"],
    description: "A custom-designed base for an edge-lit acrylic LED lamp. This model was engineered for 3D printing, featuring a precise 5mm slot for the acrylic panel and a hollow interior designed to neatly house all electronic components.",
    media: [
      { type: "image", src: "projects/LED/1.png" },
      { type: "image", src: "projects/LED/2.png" },
      { type: "image", src: "projects/LED/3.png" },
      { type: "image", src: "projects/LED/4.png" },
      { type: "image", src: "projects/LED/5.png" },
      { type: "image", src: "projects/LED/6.png" },
      { type: "image", src: "projects/LED/7.png" }
    ],
    links: []
  },
  {
    id: "grass-cutter",
    title: "Grass Cutter",
    category: "product",
    tools: ["Fusion 360", "CAD Software", "3D Printing"],
    description: "Complete 3D design for the enclosure of a handheld electric grass cutter. The model features an ergonomic, two-part clamshell casing that securely houses all internal mechanical and electronic components.",
    media: [
      { type: "image", src: "projects/GrassCutter/1.png" },
      { type: "image", src: "projects/GrassCutter/2.png" },
      { type: "image", src: "projects/GrassCutter/3.png" },
      { type: "image", src: "projects/GrassCutter/4.png" },
      { type: "image", src: "projects/GrassCutter/5.png" },
      { type: "image", src: "projects/GrassCutter/6.png" },
      { type: "image", src: "projects/GrassCutter/7.png" },
      { type: "image", src: "projects/GrassCutter/8.png" },
      { type: "image", src: "projects/GrassCutter/9.png" },
      { type: "image", src: "projects/GrassCutter/10.png" },
      { type: "image", src: "projects/GrassCutter/11.png" }
    ],
    links: []
  }
];

// Expose for both the main site and the admin panel.
if (typeof window !== "undefined") window.PROJECTS = PROJECTS;
