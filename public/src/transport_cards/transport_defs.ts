
/**
 * Base model for transport cards, the link between the transport card (View Model) and db or dummy data generator
 */
export type TransportCardDataModel = {
   transportId             :  number,
   supplierId1             :  number,
   supplierId2             :  number,
   vehicleId               :  number,
   woodTypeId              :  number,
   containerId1            :  number,
   container1Name          :  string,
   containerId2            :  number,
   container2Name          :  string,

   transportStatus         :  number,
   vehicleStatusName       :  string,

   transportStartMs        :  number, // 
   transportEndMs          :  number,
   transportPlannedStartMs :  number,
   transportPlannedEndMs   :  number,

   supplier1Name           :  string,
   supplier2Name           :  string,
   vehicleName             :  string,
   materialTransported     :  string,
   vehicleLat              :  number,
   vehicleLng              :  number,
   vehicleMoving           :  boolean,
};
export const TransportCardDataModelKeys: { [K in keyof TransportCardDataModel]: K } = {
   transportId: "transportId",
   supplierId1: "supplierId1",
   supplierId2: "supplierId2",
   vehicleId: "vehicleId",
   woodTypeId: "woodTypeId",
   containerId1: "containerId1",
   container1Name: "container1Name",
   containerId2: "containerId2",
   container2Name: "container2Name",

   transportStatus: "transportStatus",
   vehicleStatusName: "vehicleStatusName",

   transportStartMs: "transportStartMs",
   transportEndMs: "transportEndMs",
   transportPlannedStartMs: "transportPlannedStartMs",
   transportPlannedEndMs: "transportPlannedEndMs",

   supplier1Name: "supplier1Name",
   supplier2Name: "supplier2Name",
   vehicleName: "vehicleName",
   materialTransported: "materialTransported",
   vehicleLat: "vehicleLat",
   vehicleLng: "vehicleLng",
   vehicleMoving: "vehicleMoving"
};


export enum TransportCardEvents {
   ButtonClick = "transportCardButtonClick",
   HoverStart = "transportCardHoverStart",
   HoverEnd = "transportCardHoverEnd",
   Collapsed = "transportCardCollapsed",
   Uncollapsed = "transportCardUncollapsed",
}
export enum TransportCardPaginationEvents {
   Updated = "transportPaginationUpdated"
}
export const transportStatusMap = Object.freeze({
   m0: new Map<number, string>([
      [1, "PLANIFICAT"],
      [2, "IN PROGRES"],
      [3, "FINALIZAT"],
      [4, "ANULAT"]
   ]),
   m1: new Map<string, number>([
      ["PLANIFICAT", 1],
      ["IN PROGRES", 2],
      ["FINALIZAT", 3],
      ["ANULAT", 4]
   ])
});