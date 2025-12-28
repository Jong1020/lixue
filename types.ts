export interface SimulationState {
  waterMass: number;     // Current mass of water added (kg)
  waterHeight: number;   // Height of water in container (m)
  sensorForce: number;   // Reading on the force sensor (N)
  buoyancy: number;      // Current buoyancy force (N)
  blockSubmergedHeight: number; // Height of block under water (m)
}

export interface PhysicsConstants {
  blockWeight: number;   // G (N)
  containerArea: number; // S (m^2)
  waterDensity: number;  // rho (kg/m^3)
  gravity: number;       // g (N/kg)
  waterMassTouch: number; // Mass when water touches block (kg)
  maxSensorForce: number; // Final sensor reading (N)
}