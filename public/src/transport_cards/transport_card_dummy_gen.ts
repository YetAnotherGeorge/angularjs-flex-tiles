import { TransportCard } from "./transport_card";
import { TransportCardDataModel } from "./transport_defs";

const supplierNames: string[] = [
   "MetalWorks Inc.",
   "Woodland Supplies",
   "EcoTransport Ltd.",
   "Green Logistics",
   "Fast Freight Co.",
   "Cargo Masters",
   "Transport Solutions",
   "Global Movers",
   "Swift Haulage",
   "Reliable Carriers",
   "Urban Transport Services",
   "Precision Logistics",
   "Mountain Movers"
];
function getRandomSupplierName(): string {
   return supplierNames[Math.floor(Math.random() * supplierNames.length)];
}

const materialNames: string[] = [
   "Oak Wood",
   "Pine Wood",
   "Birch Wood",
   "Maple Wood",
   "Teak Wood",
   "Mahogany Wood",
   "Cedar Wood",
   "Spruce Wood",
   "Bamboo",
   "Recycled Plastic",
   "Rebar Steel",
   "Aluminum Sheets",
   "Copper Wire",
];
function getRandomMaterialName(): string {
   return materialNames[Math.floor(Math.random() * materialNames.length)];
}

export function generateDummyTransportCardData(count: number): TransportCardDataModel[] {
   const transports: TransportCardDataModel[] = [];
   const timeMin_MS = 60 * 1000;

   for (let i = 0; i < count; i++) {
      const tc: TransportCardDataModel = {
            transportId: i + 1,
            supplierId1: Math.floor(Math.random() * 100) + 1,
            supplierId2: Math.floor(Math.random() * 100) + 1,
            vehicleId: Math.floor(Math.random() * 50) + 1,
            woodTypeId: Math.floor(Math.random() * 10) + 1,
            containerId1: Math.floor(Math.random() * 20) + 1,
            container1Name: `Container ${Math.floor(Math.random() * 100)}`,
            containerId2: Math.floor(Math.random() * 20) + 1,
            container2Name: `Container ${Math.floor(Math.random() * 100)}`,
            transportStatus: Math.floor(Math.random() * 5),
            vehicleStatusName: "Active",

            transportStartMs: Date.now() - Math.floor(Math.random() * 120 * timeMin_MS),
            transportEndMs: Date.now() + Math.floor(Math.random() * 120 * timeMin_MS),
            transportPlannedStartMs:  Date.now() - Math.floor(Math.random() * 120 * timeMin_MS),
            transportPlannedEndMs: Date.now() + Math.floor(Math.random() * 120 * timeMin_MS),

            supplier1Name: getRandomSupplierName(),
            supplier2Name: getRandomSupplierName(),
            vehicleName: `Vehicle ${Math.floor(Math.random() * 100)}`,
            materialTransported: getRandomMaterialName(),
            vehicleLat: parseFloat((Math.random() * 180 - 90).toFixed(6)),
            vehicleLng: parseFloat((Math.random() * 360 - 180).toFixed(6)),
            vehicleMoving: Math.random() > 0.5
      };
      transports.push(tc);
   }
   return transports;
}
