// Curated Moodboard and Coupled Logo datasets with feelings and brand names

import coupled_1_A from "@/assets/visual-identity/coupled-logos/Farhang-BoldHeavy.jpg";
import coupled_1_B from "@/assets/visual-identity/coupled-logos/Shiraz-LightFree.jpg";
import coupled_2_A from "@/assets/visual-identity/coupled-logos/WB-Detailed.jpg";
import coupled_2_B from "@/assets/visual-identity/coupled-logos/WB-Minimal.jpg";
import coupled_3_A from "@/assets/visual-identity/coupled-logos/Babel-DetailedType.png";
import coupled_3_B from "@/assets/visual-identity/coupled-logos/stripe-SimpleType.png";
import coupled_4_A from "@/assets/visual-identity/coupled-logos/Dejmar-FarsiTypeSharp.jpg";
import coupled_4_B from "@/assets/visual-identity/coupled-logos/MyLady-FarsiTypeHandwrittenorsoft.jpg";
import coupled_5_A from "@/assets/visual-identity/coupled-logos/BookBank-FarsiTypeModern.jpg";
import coupled_5_B from "@/assets/visual-identity/coupled-logos/Siliak-FarsiTypeOld.png";
import coupled_6_A from "@/assets/visual-identity/coupled-logos/Chashnika-FarsiTypeSofty.jpg";
import coupled_6_B from "@/assets/visual-identity/coupled-logos/Rapido-FarsiTypePointy.jpg";
import coupled_7_A from "@/assets/visual-identity/coupled-logos/Adobe-Flat.png";
import coupled_7_B from "@/assets/visual-identity/coupled-logos/Cube-Shaded3D.png";
import coupled_8_A from "@/assets/visual-identity/coupled-logos/Lama-Line.png";
import coupled_8_B from "@/assets/visual-identity/coupled-logos/Metamask-3DFilled.png";
import coupled_9_A from "@/assets/visual-identity/coupled-logos/Webflow-Sanserif.png";
import coupled_9_B from "@/assets/visual-identity/coupled-logos/Wordpress-Serif.png";

// Imports for 40 Moodboard Images
import mbImg_1 from "@/assets/visual-identity/moodboard/mb_01.png";
import mbImg_2 from "@/assets/visual-identity/moodboard/mb_02.png";
import mbImg_3 from "@/assets/visual-identity/moodboard/mb_03.jpg";
import mbImg_4 from "@/assets/visual-identity/moodboard/mb_04.jpg";
import mbImg_5 from "@/assets/visual-identity/moodboard/mb_05.jpg";
import mbImg_6 from "@/assets/visual-identity/moodboard/mb_06.jpg";
import mbImg_7 from "@/assets/visual-identity/moodboard/mb_07.jpg";
import mbImg_8 from "@/assets/visual-identity/moodboard/mb_08.png";
import mbImg_9 from "@/assets/visual-identity/moodboard/mb_09.png";
import mbImg_10 from "@/assets/visual-identity/moodboard/mb_10.png";
import mbImg_11 from "@/assets/visual-identity/moodboard/mb_11.png";
import mbImg_12 from "@/assets/visual-identity/moodboard/mb_12.png";
import mbImg_13 from "@/assets/visual-identity/moodboard/mb_13.png";
import mbImg_14 from "@/assets/visual-identity/moodboard/mb_14.png";
import mbImg_15 from "@/assets/visual-identity/moodboard/mb_15.png";
import mbImg_16 from "@/assets/visual-identity/moodboard/mb_16.png";
import mbImg_17 from "@/assets/visual-identity/moodboard/mb_17.png";
import mbImg_18 from "@/assets/visual-identity/moodboard/mb_18.png";
import mbImg_19 from "@/assets/visual-identity/moodboard/mb_19.png";
import mbImg_20 from "@/assets/visual-identity/moodboard/mb_20.png";
import mbImg_21 from "@/assets/visual-identity/moodboard/mb_21.png";
import mbImg_22 from "@/assets/visual-identity/moodboard/mb_22.png";
import mbImg_23 from "@/assets/visual-identity/moodboard/mb_23.png";
import mbImg_24 from "@/assets/visual-identity/moodboard/mb_24.png";
import mbImg_25 from "@/assets/visual-identity/moodboard/mb_25.png";
import mbImg_26 from "@/assets/visual-identity/moodboard/mb_26.png";
import mbImg_27 from "@/assets/visual-identity/moodboard/mb_27.png";
import mbImg_28 from "@/assets/visual-identity/moodboard/mb_28.png";
import mbImg_29 from "@/assets/visual-identity/moodboard/mb_29.png";
import mbImg_30 from "@/assets/visual-identity/moodboard/mb_30.png";
import mbImg_31 from "@/assets/visual-identity/moodboard/mb_31.png";
import mbImg_32 from "@/assets/visual-identity/moodboard/mb_32.png";
import mbImg_33 from "@/assets/visual-identity/moodboard/mb_33.png";
import mbImg_34 from "@/assets/visual-identity/moodboard/mb_34.png";
import mbImg_35 from "@/assets/visual-identity/moodboard/mb_35.png";
import mbImg_36 from "@/assets/visual-identity/moodboard/mb_36.png";
import mbImg_37 from "@/assets/visual-identity/moodboard/mb_37.png";
import mbImg_38 from "@/assets/visual-identity/moodboard/mb_38.png";
import mbImg_39 from "@/assets/visual-identity/moodboard/mb_39.png";
import mbImg_40 from "@/assets/visual-identity/moodboard/mb_40.png";

export interface CoupledOption {
  image: string;
  brand: string;
  feeling: string;
}

export interface CoupledPair {
  id: number;
  folderCategory: string;
  feelingA: string;
  feelingB: string;
  optionA: CoupledOption;
  optionB: CoupledOption;
}

export const COUPLED_LOGO_PAIRS: CoupledPair[] = [
  {
    id: 1,
    folderCategory: "BoldHeavy-LightFree",
    feelingA: "BoldHeavy",
    feelingB: "LightFree",
    optionA: {
      image: coupled_1_A,
      brand: "Farhang",
      feeling: "BoldHeavy",
    },
    optionB: {
      image: coupled_1_B,
      brand: "Shiraz",
      feeling: "LightFree",
    },
  },
  {
    id: 2,
    folderCategory: "Detail-Minimal",
    feelingA: "Detailed",
    feelingB: "Minimal",
    optionA: {
      image: coupled_2_A,
      brand: "WB",
      feeling: "Detailed",
    },
    optionB: {
      image: coupled_2_B,
      brand: "WB",
      feeling: "Minimal",
    },
  },
  {
    id: 3,
    folderCategory: "DetailedType-SimpleType",
    feelingA: "DetailedType",
    feelingB: "SimpleType",
    optionA: {
      image: coupled_3_A,
      brand: "Babel",
      feeling: "DetailedType",
    },
    optionB: {
      image: coupled_3_B,
      brand: "stripe",
      feeling: "SimpleType",
    },
  },
  {
    id: 4,
    folderCategory: "FarsiTypeHandwrittenorsoft-FarsiTypeSharp",
    feelingA: "FarsiTypeSharp",
    feelingB: "FarsiTypeHandwrittenorsoft",
    optionA: {
      image: coupled_4_A,
      brand: "Dejmar",
      feeling: "FarsiTypeSharp",
    },
    optionB: {
      image: coupled_4_B,
      brand: "MyLady",
      feeling: "FarsiTypeHandwrittenorsoft",
    },
  },
  {
    id: 5,
    folderCategory: "FarsiTypeOld-FarsiTypeModern",
    feelingA: "FarsiTypeModern",
    feelingB: "FarsiTypeOld",
    optionA: {
      image: coupled_5_A,
      brand: "BookBank",
      feeling: "FarsiTypeModern",
    },
    optionB: {
      image: coupled_5_B,
      brand: "Siliak",
      feeling: "FarsiTypeOld",
    },
  },
  {
    id: 6,
    folderCategory: "FarsiTypeSofty-FarsiTypePointy",
    feelingA: "FarsiTypeSofty",
    feelingB: "FarsiTypePointy",
    optionA: {
      image: coupled_6_A,
      brand: "Chashnika",
      feeling: "FarsiTypeSofty",
    },
    optionB: {
      image: coupled_6_B,
      brand: "Rapido",
      feeling: "FarsiTypePointy",
    },
  },
  {
    id: 7,
    folderCategory: "Flat-Shaded3D",
    feelingA: "Flat",
    feelingB: "Shaded3D",
    optionA: {
      image: coupled_7_A,
      brand: "Adobe",
      feeling: "Flat",
    },
    optionB: {
      image: coupled_7_B,
      brand: "Cube",
      feeling: "Shaded3D",
    },
  },
  {
    id: 8,
    folderCategory: "Line-3DFilled",
    feelingA: "Line",
    feelingB: "3DFilled",
    optionA: {
      image: coupled_8_A,
      brand: "Lama",
      feeling: "Line",
    },
    optionB: {
      image: coupled_8_B,
      brand: "Metamask",
      feeling: "3DFilled",
    },
  },
  {
    id: 9,
    folderCategory: "Serif-SanSerif",
    feelingA: "Sanserif",
    feelingB: "Serif",
    optionA: {
      image: coupled_9_A,
      brand: "Webflow",
      feeling: "Sanserif",
    },
    optionB: {
      image: coupled_9_B,
      brand: "Wordpress",
      feeling: "Serif",
    },
  },
];

export interface MoodboardItem {
  id: number;
  image: string;
  originalName: string;
}

export const MOODBOARD_GRID_IMAGES: MoodboardItem[] = [
  { id: 1, image: mbImg_1, originalName: "IMG_5372.PNG" },
  { id: 2, image: mbImg_2, originalName: "IMG_5373.PNG" },
  { id: 3, image: mbImg_3, originalName: "IMG_5375.JPG" },
  { id: 4, image: mbImg_4, originalName: "IMG_5379.JPG" },
  { id: 5, image: mbImg_5, originalName: "IMG_5384.HEIC" },
  { id: 6, image: mbImg_6, originalName: "IMG_5386.HEIC" },
  { id: 7, image: mbImg_7, originalName: "IMG_5390.HEIC" },
  { id: 8, image: mbImg_8, originalName: "Screenshot 2026-02-25 152519.png" },
  { id: 9, image: mbImg_9, originalName: "Screenshot 2026-09-27 133146.png" },
  { id: 10, image: mbImg_10, originalName: "Screenshot 2026-09-27 133936.png" },
  { id: 11, image: mbImg_11, originalName: "Screenshot 2026-09-27 133945.png" },
  { id: 12, image: mbImg_12, originalName: "Screenshot 2026-09-27 133954.png" },
  { id: 13, image: mbImg_13, originalName: "Screenshot 2026-09-27 134004.png" },
  { id: 14, image: mbImg_14, originalName: "Screenshot 2026-09-27 134008.png" },
  { id: 15, image: mbImg_15, originalName: "Screenshot 2026-09-27 134015.png" },
  { id: 16, image: mbImg_16, originalName: "Screenshot 2026-09-27 134037.png" },
  { id: 17, image: mbImg_17, originalName: "Screenshot 2026-09-27 134119.png" },
  { id: 18, image: mbImg_18, originalName: "Screenshot 2026-09-27 143131.png" },
  { id: 19, image: mbImg_19, originalName: "Screenshot 2026-09-27 143137.png" },
  { id: 20, image: mbImg_20, originalName: "Screenshot 2026-09-27 143157.png" },
  { id: 21, image: mbImg_21, originalName: "Screenshot 2026-09-27 143211.png" },
  { id: 22, image: mbImg_22, originalName: "Screenshot 2026-09-27 143219.png" },
  { id: 23, image: mbImg_23, originalName: "Screenshot 2026-09-27 143242.png" },
  { id: 24, image: mbImg_24, originalName: "Screenshot 2026-09-27 143259.png" },
  { id: 25, image: mbImg_25, originalName: "Screenshot 2026-09-27 143306.png" },
  { id: 26, image: mbImg_26, originalName: "Screenshot 2026-09-27 143314.png" },
  { id: 27, image: mbImg_27, originalName: "Screenshot 2026-09-27 143335.png" },
  { id: 28, image: mbImg_28, originalName: "Screenshot 2026-09-27 143357.png" },
  { id: 29, image: mbImg_29, originalName: "Screenshot 2026-09-27 143450.png" },
  { id: 30, image: mbImg_30, originalName: "Screenshot 2026-09-27 143515.png" },
  { id: 31, image: mbImg_31, originalName: "Screenshot 2026-09-27 145522.png" },
  { id: 32, image: mbImg_32, originalName: "Screenshot 2026-09-27 150220.png" },
  { id: 33, image: mbImg_33, originalName: "Screenshot 2026-09-27 150238.png" },
  { id: 34, image: mbImg_34, originalName: "Screenshot 2026-09-27 150425.png" },
  { id: 35, image: mbImg_35, originalName: "Screenshot 2026-09-27 150434.png" },
  { id: 36, image: mbImg_36, originalName: "Screenshot 2026-09-27 150446.png" },
  { id: 37, image: mbImg_37, originalName: "Screenshot 2026-09-27 150527.png" },
  { id: 38, image: mbImg_38, originalName: "Screenshot 2026-09-27 150538.png" },
  { id: 39, image: mbImg_39, originalName: "Screenshot 2026-09-27 150559.png" },
  { id: 40, image: mbImg_40, originalName: "Screenshot 2026-09-27 150705.png" },
];
