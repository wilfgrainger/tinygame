export type QualityZoneId = 'woodland' | 'mountain-rise' | 'harbour' | 'home-lane';
export type QualityElementKind = 'tree' | 'pine' | 'bush' | 'rock' | 'post' | 'lantern' | 'bench' | 'flower' | 'plank';

export type QualityElement = {
  kind: QualityElementKind;
  x: number;
  z: number;
  scale: number;
  rotation?: number;
};

export type QualityCluster = {
  id: string;
  elements: QualityElement[];
};

export type QualityZoneComposition = {
  anchor: { name: string; x: number; z: number };
  clusters: QualityCluster[];
};

export const QUALITY_COMPOSITION: Record<QualityZoneId, QualityZoneComposition> = {
  woodland: {
    anchor: { name: 'Old Oak Threshold', x: -31, z: -26 },
    clusters: [
      {
        id: 'woodland-threshold',
        elements: [
          { kind: 'tree', x: -26, z: -18, scale: 1.15 },
          { kind: 'pine', x: -34, z: -20, scale: 1.2 },
          { kind: 'bush', x: -28, z: -21, scale: 1.0 },
          { kind: 'rock', x: -35, z: -24, scale: 0.9 }
        ]
      },
      {
        id: 'woodland-grove-frame',
        elements: [
          { kind: 'tree', x: -59, z: -38, scale: 1.25 },
          { kind: 'pine', x: -47, z: -49, scale: 1.15 },
          { kind: 'bush', x: -58, z: -46, scale: 1.15 },
          { kind: 'rock', x: -48, z: -38, scale: 1.05 },
          { kind: 'lantern', x: -50, z: -40, scale: 0.9 }
        ]
      },
      {
        id: 'woodland-deep-edge',
        elements: [
          { kind: 'pine', x: -66, z: -31, scale: 1.2 },
          { kind: 'tree', x: -64, z: -55, scale: 1.1 },
          { kind: 'bush', x: -60, z: -53, scale: 1.0 }
        ]
      }
    ]
  },
  'mountain-rise': {
    anchor: { name: 'Summit Cairn', x: 46, z: -50 },
    clusters: [
      {
        id: 'mountain-lower-gate',
        elements: [
          { kind: 'rock', x: 18, z: -20, scale: 1.2 },
          { kind: 'rock', x: 24, z: -28, scale: 0.9 },
          { kind: 'pine', x: 17, z: -28, scale: 0.9 }
        ]
      },
      {
        id: 'mountain-upper-frame',
        elements: [
          { kind: 'rock', x: 39, z: -43, scale: 1.15 },
          { kind: 'rock', x: 50, z: -44, scale: 1.0 },
          { kind: 'post', x: 43, z: -47, scale: 0.9 }
        ]
      },
      {
        id: 'summit-lookout',
        elements: [
          { kind: 'bench', x: 42.5, z: -52, scale: 0.95, rotation: 25 },
          { kind: 'post', x: 49, z: -52, scale: 1.1 },
          { kind: 'rock', x: 46, z: -53, scale: 0.8 }
        ]
      }
    ]
  },
  harbour: {
    anchor: { name: 'Tiny Raft Mooring', x: 50, z: 57 },
    clusters: [
      {
        id: 'harbour-arrival',
        elements: [
          { kind: 'lantern', x: 39, z: 47, scale: 1.0 },
          { kind: 'post', x: 43, z: 50, scale: 1.0 },
          { kind: 'bench', x: 36.5, z: 44, scale: 0.9, rotation: 45 }
        ]
      },
      {
        id: 'raft-mooring',
        elements: [
          { kind: 'post', x: 47, z: 55, scale: 1.15 },
          { kind: 'post', x: 54, z: 55, scale: 1.15 },
          { kind: 'lantern', x: 46, z: 52, scale: 0.9 },
          { kind: 'plank', x: 50, z: 53, scale: 1.1, rotation: 0 }
        ]
      },
      {
        id: 'shore-softening',
        elements: [
          { kind: 'rock', x: 31, z: 52, scale: 0.8 },
          { kind: 'bush', x: 30, z: 45, scale: 0.85 },
          { kind: 'flower', x: 34, z: 47, scale: 0.9 }
        ]
      }
    ]
  },
  'home-lane': {
    anchor: { name: 'Home Porch Garden', x: -39, z: 25 },
    clusters: [
      {
        id: 'home-front-garden',
        elements: [
          { kind: 'bush', x: -44, z: 26, scale: 0.9 },
          { kind: 'bush', x: -34, z: 26, scale: 0.9 },
          { kind: 'flower', x: -42, z: 25, scale: 1.0 },
          { kind: 'flower', x: -36, z: 25, scale: 1.0 }
        ]
      },
      {
        id: 'home-lane-warmth',
        elements: [
          { kind: 'lantern', x: -31, z: 25, scale: 0.9 },
          { kind: 'bench', x: -30, z: 31, scale: 0.85, rotation: 90 },
          { kind: 'tree', x: -48, z: 33, scale: 0.95 }
        ]
      },
      {
        id: 'home-boundary',
        elements: [
          { kind: 'post', x: -47, z: 25, scale: 0.8 },
          { kind: 'post', x: -45, z: 25, scale: 0.8 },
          { kind: 'plank', x: -46, z: 25, scale: 0.75, rotation: 90 }
        ]
      }
    ]
  }
};
