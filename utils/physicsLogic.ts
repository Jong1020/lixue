import { PhysicsConstants, SimulationState } from '../types.ts';

export const CONSTANTS: PhysicsConstants = {
  blockWeight: 5,        // From graph: Start force = 5N
  containerArea: 0.01,   // 100 cm^2 = 0.01 m^2
  waterDensity: 1000,    // 1.0 * 10^3 kg/m^3
  gravity: 10,           // 10 N/kg
  waterMassTouch: 1,     // From graph: Force drops after m=1kg
  maxSensorForce: 7      // From graph: Final force = 7N
};

// Derived values for calculation
export const getDerivedValues = () => {
  const { blockWeight, gravity, maxSensorForce, waterMassTouch, containerArea } = CONSTANTS;
  
  const blockMass = blockWeight / gravity;
  
  // Logic: Final Sensor Force = |G - F_buoy_max|.
  // F_sensor = F_buoy_max - G => 7 = F_buoy_max - 5 => F_buoy_max = 12N.
  const maxBuoyancy = maxSensorForce + blockWeight;
  
  const blockVolume = maxBuoyancy / (CONSTANTS.waterDensity * gravity);
  const blockDensity = blockMass / blockVolume;
  
  // For visualization, assume block is a cylinder.
  // We need to assume a Block Area to calculate water height rise.
  // Let's assume Block Area is half of Container Area for visualization clarity.
  const visualBlockArea = CONSTANTS.containerArea * 0.5; 
  const visualBlockHeight = blockVolume / visualBlockArea;

  // Calculate Key Masses for Charting
  // 1. Touch: Defined constant
  const mTouch = waterMassTouch;

  // 2. Full Submersion
  // Water needed to fill the annular space up to block height.
  // Annular Area = Container Area - Block Area
  const annularArea = containerArea - visualBlockArea;
  const vAnnular = annularArea * visualBlockHeight;
  const mAnnular = vAnnular * CONSTANTS.waterDensity; // kg
  const mSubmerged = mTouch + mAnnular;

  // 3. Float Point (Sensor = 0)
  // Happens when Buoyancy = Weight = 5N.
  // Max Buoyancy = 12N at mSubmerged. Buoyancy is 0 at mTouch.
  // Linear interpolation: 5 / 12 = (mFloat - mTouch) / (mSubmerged - mTouch)
  const ratio = blockWeight / maxBuoyancy;
  const mFloat = mTouch + (mSubmerged - mTouch) * ratio;

  return {
    blockMass,
    maxBuoyancy,
    blockVolume,
    blockDensity,
    visualBlockArea,
    visualBlockHeight,
    keyPoints: {
      mTouch: parseFloat(mTouch.toFixed(2)),
      mFloat: parseFloat(mFloat.toFixed(2)),
      mSubmerged: parseFloat(mSubmerged.toFixed(2))
    }
  };
};

export const calculateState = (waterMass: number): SimulationState => {
  const { containerArea, waterDensity, gravity, blockWeight, waterMassTouch } = CONSTANTS;
  const { maxBuoyancy, visualBlockArea, visualBlockHeight } = getDerivedValues();

  // 1. Calculate Water Height
  // Volume of water = mass / density
  const vWater = waterMass / waterDensity;

  // Height where block starts (bottom of block)
  const hBlockBottom = waterMassTouch / (waterDensity * containerArea);

  let waterHeight = 0;
  let blockSubmergedHeight = 0;

  // Phase 1: Water below block
  const vBelow = hBlockBottom * containerArea;
  
  if (vWater <= vBelow) {
    waterHeight = vWater / containerArea;
    blockSubmergedHeight = 0;
  } else {
    // Phase 2: Water rising around block
    const vRemaining = vWater - vBelow;
    const annularArea = containerArea - visualBlockArea;
    
    // Height rise along the block
    const hRise = vRemaining / annularArea;
    
    if (hRise <= visualBlockHeight) {
      waterHeight = hBlockBottom + hRise;
      blockSubmergedHeight = hRise;
    } else {
      // Phase 3: Water above block
      const vAbove = vRemaining - (visualBlockHeight * annularArea);
      const hAbove = vAbove / containerArea;
      waterHeight = hBlockBottom + visualBlockHeight + hAbove;
      blockSubmergedHeight = visualBlockHeight;
    }
  }

  // 2. Calculate Buoyancy
  const submergedFraction = Math.min(Math.max(blockSubmergedHeight / visualBlockHeight, 0), 1);
  const buoyancy = submergedFraction * maxBuoyancy;

  // 3. Calculate Sensor Force
  const sensorForce = Math.abs(blockWeight - buoyancy);

  return {
    waterMass,
    waterHeight,
    sensorForce,
    buoyancy,
    blockSubmergedHeight
  };
};