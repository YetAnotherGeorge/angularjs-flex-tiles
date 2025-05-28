import * as BE from "./get_typed";
import { timestampToStringRO } from "./misc_util";

export type DBTransportCardValuesDefinition = {
   TransportId             : [ "t1.id"                ,  number ],
   SupplierId1             : [ "t1.supplierid1"       ,  number ],
   SupplierId2             : [ "t1.supplierid2"       ,  number ],
   VehicleId               : [ "t1.vehicleid"         ,  number ],
   //VehicleId             : [ "v1.id"                ,  string ],
   WoodTypeId              : [ "t1.woodtypeid"        ,  number ],
   ContainerId1            : [ "t1.containerid1"      ,  number ],
   Container1Name          : [ "c1.name"              ,  string ],
   ContainerId2            : [ "t1.containerid2"      ,  number ],
   Container2Name          : [ "c2.name"              ,  string ],

   TransportStatus         : [ "t1.status"            ,  number ],
   VehicleStatusName       : [ "t1.statusname"        ,  string ],

   TransportStartMs        : [ "t1.startstamp"        ,  number,   string], // string -> number
   TransportEndMs          : [ "t1.endstamp"          ,  number,   string], // string -> number
   TransportPlannedStartMs : [ "t1.plannedstartstamp" ,  number,   string], // string -> number
   TransportPlannedEndMs   : [ "t1.plannedendstamp"   ,  number,   string], // string -> number

   Supplier1Name           : [ "s1.name"              ,  string ],
   Supplier2Name           : [ "s2.name"              ,  string ],
   VehicleName             : [ "v1.name"              ,  string ],
   WoodType                : [ "w1.name"              ,  string ],
   VehicleLat              : [ "v1.lat"               ,  number ],
   VehicleLng              : [ "v1.long"              ,  number ],
   VehicleMoving           : [ "v1.ismoving"          ,  boolean,  number],  // number -> boolean
}
export const dbTransportCardValuesInstance: DBTransportCardValuesDefinition = {
   TransportId             : [ "t1.id"                ,     0  ],
   SupplierId1             : [ "t1.supplierid1"       ,     0  ],
   SupplierId2             : [ "t1.supplierid2"       ,     0  ],
   VehicleId               : [ "t1.vehicleid"         ,     0  ],
   //VehicleId             : [ "v1.id"                ,  "str" ],
   WoodTypeId              : [ "t1.woodtypeid"        ,     0  ],
   ContainerId1            : [ "t1.containerid1"      ,     0  ],
   Container1Name          : [ "c1.name"              ,  "str" ],
   ContainerId2            : [ "t1.containerid2"      ,     0  ],
   Container2Name          : [ "c2.name"              ,  "str" ],
   TransportStatus         : [ "t1.status"            ,     0  ],
   VehicleStatusName       : [ "t1.statusname"        ,  "str" ],
   TransportStartMs        : [ "t1.startstamp"        ,     0,  "str" ],
   TransportEndMs          : [ "t1.endstamp"          ,     0,  "str" ],
   TransportPlannedStartMs : [ "t1.plannedstartstamp" ,     0,  "str" ],
   TransportPlannedEndMs   : [ "t1.plannedendstamp"   ,     0,  "str" ],
   Supplier1Name           : [ "s1.name"              ,  "str" ],
   Supplier2Name           : [ "s2.name"              ,  "str" ],
   VehicleName             : [ "v1.name"              ,  "str" ],
   WoodType                : [ "w1.name"              ,  "str" ],
   VehicleLat              : [ "v1.lat"               ,     0  ],
   VehicleLng              : [ "v1.long"              ,     0  ],
   VehicleMoving           : [ "v1.ismoving"          ,   true,     1 ],
};
export type DBTransportCardValues = { [P in keyof DBTransportCardValuesDefinition]: DBTransportCardValuesDefinition[P][1] };

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
export class TransportCard {
   //#region DB
   private dbValues: DBTransportCardValues; 
   private originalDbValues: Record<string, any>;
   private cached: Map<string, string>;
  
   constructor(dbValues: DBTransportCardValues, originalDbValues: Record<string, any>) {
      this.dbValues = dbValues;
      this.originalDbValues = originalDbValues;
      this.cached = new Map<string, string>();
   }
   public static FromDBValues(obj: any) {
      if (typeof (obj) != "object") throw new Error("Expected object");
      let dbValues: Record<string, string | number | boolean> = {}; // : DBTransportCardValues

      for (const [key, keyDefinitions] of Object.entries(dbTransportCardValuesInstance)) {
         let v: any = obj[keyDefinitions[0]];
           
         if (typeof v == typeof keyDefinitions[1]) {
            dbValues[key] = v;
            continue;
         } else if (keyDefinitions.length == 3 && typeof v == typeof keyDefinitions[2]) {

            if (typeof keyDefinitions[1] == "number" && typeof keyDefinitions[2] == "string") {
               // Parse string -> number 
               let isFloat = (v as string).indexOf('.') != -1;
               let vn: number = isFloat ? parseFloat(v) : parseInt(v);
               if (!isNaN(vn)) {
                  dbValues[key] = vn;
                  continue;
               }
            } else if (typeof keyDefinitions[1] == "boolean" && typeof keyDefinitions[2] == "number") {
               dbValues[key] = (v as number) != 0;
               continue;
            }
         }

         console.warn(`[${key}]: ${keyDefinitions[0]} expected ${typeof (keyDefinitions[1])} but got ${typeof v}; value of v: ${v}; using default value ${keyDefinitions[1]}`);
         dbValues[key] = keyDefinitions[1]; // default value
      }
      return new TransportCard(dbValues as DBTransportCardValues, obj as Record<string, any>); 
   }
   //#endregion

   //#region VALUES
   public get transportIdName(): string {
      if (!this.cached.has("transportIdName")) 
         this.cached.set("transportIdName", `${this.dbValues.TransportId.toString()}`);
      let v = this.cached.get("transportIdName")!;
      //console.log(`Returning: ${v}`);
      return v;
   }
   public get container1Name(): string {
      if (!this.cached.has("container1Name"))
         this.cached.set("container1Name", `${this.dbValues.Container1Name}`);
      let v = this.cached.get("container1Name")!;
      //console.log(`Returning: ${v}`); 
      return v;
   }
   public get container2Name(): string {
      if (!this.cached.has("container2Name"))
         this.cached.set("container2Name", `${this.dbValues.Container2Name}`);
      let v = this.cached.get("container2Name")!;
      //console.log(`Returning: ${v}`); 
      return v;
   }
   public get transportStatusName(): string {
      if (!this.cached.has("transportStatusName")) {
         if (transportStatusMap.m0.has(this.dbValues.TransportStatus)) {
            this.cached.set("transportStatusName", `${transportStatusMap.m0.get(this.dbValues.TransportStatus)!}`);
         } else {
            this.cached.set("transportStatusName", `necunoscut: ${this.dbValues.TransportStatus}`)
         }
      }
      return this.cached.get("transportStatusName")!;
   }
   public transportStatusIntSwitch(o: Record<number, string>, defaultValue: string): string {
      let statusId: number = this.dbValues.TransportStatus;
      let v: string | undefined = o[statusId];
      return v === undefined ? defaultValue : v;
   }

   public get startTimeString(): string {
      if (!this.cached.has("startTimeString")) {
         let t: number = this.dbValues.TransportStartMs;
         this.cached.set("startTimeString", (t < 1 ? `necunoscut` : `${timestampToStringRO(t)}`));
      }
      return this.cached.get("startTimeString")!;
   }
   public get endTimeString(): string {
      if (!this.cached.has("endTimeString")) {
         let t: number = this.dbValues.TransportEndMs;
         this.cached.set("endTimeString", (t < 1 ? `necunoscut` : `${timestampToStringRO(t)}`));
      }
      return this.cached.get("endTimeString")!;
   }

   public get plannedStartTimeString(): string {
      if (!this.cached.has("plannedStartTimeString")) {
         let t: number = this.dbValues.TransportPlannedStartMs;
         this.cached.set("plannedStartTimeString", (t < 1 ? `necunoscut` : `${timestampToStringRO(t)}`));
      }
      return this.cached.get("plannedStartTimeString")!;
   }
   public get plannedEndTimeString(): string {
      if (!this.cached.has("plannedEndTimeString")) {
         let t: number = this.dbValues.TransportEndMs;
         this.cached.set("plannedEndTimeString", (t < 1 ? `necunoscut` : `${timestampToStringRO(t)}`));
      }
      return this.cached.get("plannedEndTimeString")!;
   }

   public get supplierNames(): string {
      if (!this.cached.has("supplierNames")) {
         let sarr = [this.dbValues.Supplier1Name, this.dbValues.Supplier2Name].filter(v => v != "Fara");
         if (sarr.length == 0)
            this.cached.set("supplierNames", "Fara furnizori");
         else
            this.cached.set("supplierNames", `${sarr.join(', ')}`);
      }
      return this.cached.get("supplierNames")!;
   }
   public get materialName(): string {
      if (!this.cached.has("materialName"))
         this.cached.set("materialName", `${this.dbValues.WoodType}`);
      return this.cached.get("materialName")!;
   }
   public get vehicleName(): string {
      if (!this.cached.has("vehicleName")) {
         this.cached.set("vehicleName", `${this.dbValues.VehicleName}`);
      }
      return this.cached.get("vehicleName")!;
   }
   public get vehicleMoving(): boolean {
      return this.dbValues.VehicleMoving;
   }
   //#endregion

   //#region UI_ONLY
   public buttonClick(buttonName: string) {
      let ev = new CustomEvent<{ sender: TransportCard, buttonName: string }>(TransportCardEvents.ButtonClick, {
         detail: { sender: this, buttonName: buttonName }, bubbles: false
      });
      document.dispatchEvent(ev);
      console.log("Transport card: dispatched event"); console.log(ev);
   }

   private _hovering: boolean = false;
   public get hovering(): boolean { return this._hovering; }
   public hoverStart() {
      this._hovering = true;
      let ev = new CustomEvent<{ sender: TransportCard }>(TransportCardEvents.HoverStart, {
         detail: { sender: this }, bubbles: false
      });
      document.dispatchEvent(ev);
      //console.log("Transport card: dispatched event"); console.log(ev);
   }
   public hoverEnd() {
      this._hovering = false;
      let ev = new CustomEvent<{ sender: TransportCard }>(TransportCardEvents.HoverEnd, {
         detail: { sender: this }, bubbles: false
      });
      document.dispatchEvent(ev);
      //console.log("Transport card: dispatched event"); console.log(ev);
   }

   private _collapsed: boolean = false;
   public get collapsed(): boolean {
      return this._collapsed;
   }
   public collapse() {
      this._collapsed = true;
      let ev = new CustomEvent<{ sender: TransportCard }>(TransportCardEvents.Collapsed, {
         detail: { sender: this }, bubbles: false
      });
      document.dispatchEvent(ev);
      //console.log("Transport card: dispatched event"); console.log(ev);
   }
   public uncollapse() {
      this._collapsed = false;
      let ev = new CustomEvent<{ sender: TransportCard }>(TransportCardEvents.Uncollapsed, {
         detail: { sender: this }, bubbles: false
      });
      document.dispatchEvent(ev);
      //console.log("Transport card: dispatched event"); console.log(ev);
   }
   public toggleCollapse() {
      if (this._collapsed)
         this.uncollapse();
      else
         this.collapse()
   }
   //#endregion
}
export class TransportCardPagination {
   private lh = () => `[${new Date().toISOString().slice(0, -1).split('T')[1]}] [TransportCardPagination]`;

   private _tca: TransportCard[] = [];
   public get tca(): TransportCard[] {
      return this._tca;
   }

   private _pageNum: number;
   public get pageNum(): number {
      return this._pageNum;
   }
   public set pageNum(value: number) {
      if (value < 0)
         return;
      this._pageNum = value;
      this.update();
   }

   public pageNumIncrement() {
      this.pageNum = this.pageNum + 1;
   }
   public pageNumDecrement() {
      this.pageNum = this.pageNum - 1;
   }

   private _pageItemCount: number;
   public get pageItemCount(): number { return this._pageItemCount; }
   public set pageItemCount(value: number) {
      this._pageItemCount = value;
      this.update();
   }

   //#region FILTERS 
   private _filter_TransportStartMs_min: Date | null = null;
   public get filter_TransportStartMs_min(): Date | null { return this._filter_TransportStartMs_min; }
   public set filter_TransportStartMs_min(value: Date | null) {
      this._filter_TransportStartMs_min = value;
      this.update();
   }
   private _filter_TransportStartMs_max: Date | null = null;
   public get filter_TransportStartMs_max(): Date | null { return this._filter_TransportStartMs_max; }
   public set filter_TransportStartMs_max(value: Date | null) {
      this._filter_TransportStartMs_max = value;
      this.update();
   }

   private _filter_TransportEndMs_min: Date | null = null;
   public get filter_TransportEndMs_min(): Date | null { return this._filter_TransportEndMs_min; }
   public set filter_TransportEndMs_min(value: Date | null) {
      this._filter_TransportEndMs_min = value;
      this.update();
   }
   private _filter_TransportEndMs_max: Date | null = null;
   public get filter_TransportEndMs_max(): Date | null { return this._filter_TransportEndMs_max; }
   public set filter_TransportEndMs_max(value: Date | null) {
      this._filter_TransportEndMs_max = value;
      this.update();
   }

   private _filter_TransportPlannedStartMs_min: Date | null = null;
   public get filter_TransportPlannedStartMs_min(): Date | null { return this._filter_TransportPlannedStartMs_min; }
   public set filter_TransportPlannedStartMs_min(value: Date | null) {
      this._filter_TransportPlannedStartMs_min = value;
      this.update();
   }
   private _filter_TransportPlannedStartMs_max: Date | null = null;
   public get filter_TransportPlannedStartMs_max(): Date | null { return this._filter_TransportPlannedStartMs_max; }
   public set filter_TransportPlannedStartMs_max(value: Date | null) {
      this._filter_TransportPlannedStartMs_max = value;
      this.update();
   }

   private _filter_TransportPlannedEndMs_min: Date | null = null;
   public get filter_TransportPlannedEndMs_min(): Date | null { return this._filter_TransportPlannedEndMs_min; }
   public set filter_TransportPlannedEndMs_min(value: Date | null) {
      this._filter_TransportPlannedEndMs_min = value;
      this.update();
   }
   private _filter_TransportPlannedEndMs_max: Date | null = null;
   public get filter_TransportPlannedEndMs_max(): Date | null { return this._filter_TransportPlannedEndMs_max; }
   public set filter_TransportPlannedEndMs_max(value: Date | null) {
      this._filter_TransportPlannedEndMs_max = value;
      this.update();
   }

   private _filter_TransportId: number | null = null;
   public get filter_TransportId(): number | null { return this._filter_TransportId; }
   public set filter_TransportId(value: number | null) {
      this._filter_TransportId = value;
      this.update();
   }
   
   private _filter_Container1Name: string | null = null;
   public get filter_Container1Name() { return this._filter_Container1Name; }
   public set filter_Container1Name(value: string | null) {
      this._filter_Container1Name = value;
      this.update();
   }
   private _filter_Container2Name: string | null = null;
   public get filter_Container2Name() { return this._filter_Container2Name; }
   public set filter_Container2Name(value: string | null) {
      this._filter_Container2Name = value;
      this.update();
   }

   private _filter_VehicleName: string | null = null;
   public get filter_VehicleName() { return this._filter_VehicleName; }
   public set filter_VehicleName(value: string | null) {
      this._filter_VehicleName = value;
      this.update();
   }

   private _filter_Supplier1Name: string | null = null;
   public get filter_Supplier1Name() { return this._filter_Supplier1Name; }
   public set filter_Supplier1Name(value: string | null) {
      this._filter_Supplier1Name = value;
      this.update();
   }
   private _filter_Supplier2Name: string | null = null;
   public get filter_Supplier2Name() { return this._filter_Supplier2Name; }
   public set filter_Supplier2Name(value: string | null) {
      this._filter_Supplier2Name = value;
      this.update();
   }
   private _filter_WoodType: string | null = null;
   public get filter_WoodType() { return this._filter_WoodType; }
   public set filter_WoodType(value: string | null) {
      this._filter_WoodType = value;
      this.update();
   }

   private _filter_Status: number | null = null; // DROPDOWN
   public get filter_Status() { return this._filter_Status?.toString() ?? null; }
   public set filter_Status(valueStr: string | null) {
      let value: number | null = valueStr == null ? null : parseInt(valueStr);
      if (value == null || transportStatusMap.m0.has(value)) {
         this._filter_Status = value;
         this.update();
      } else {
         throw new Error(`${this.lh()} Not setting filter status to value ${value} (type ${typeof value}) because it is not in transportStatusMap.m0`);
      }
   }

   public getFilterStringObject() {
      let o: any = {};
      let dtcv = dbTransportCardValuesInstance;

      if (this.filter_TransportStartMs_min != null || this.filter_TransportStartMs_max != null) {
         o[dtcv.TransportStartMs[0]] = {};
         if (this.filter_TransportStartMs_min != null)
            o[dtcv.TransportStartMs[0]]["min"] = this.filter_TransportStartMs_min.getTime();
         if (this.filter_TransportStartMs_max != null)
            o[dtcv.TransportStartMs[0]]["max"] = this.filter_TransportStartMs_max.getTime();
      }

      if (this.filter_TransportEndMs_min != null || this.filter_TransportEndMs_max != null) {
         o[dtcv.TransportEndMs[0]] = {};
         if (this.filter_TransportEndMs_min != null)
            o[dtcv.TransportEndMs[0]]["min"] = this.filter_TransportEndMs_min.getTime();
         if (this.filter_TransportEndMs_max != null)
            o[dtcv.TransportEndMs[0]]["max"] = this.filter_TransportEndMs_max.getTime();
      }

      if (this.filter_TransportPlannedStartMs_min != null || this.filter_TransportPlannedStartMs_max != null) {
         o[dtcv.TransportPlannedStartMs[0]] = {};
         if (this.filter_TransportPlannedStartMs_min != null)
            o[dtcv.TransportPlannedStartMs[0]]["min"] = this.filter_TransportPlannedStartMs_min.getTime();
         if (this.filter_TransportPlannedStartMs_max != null)
            o[dtcv.TransportPlannedStartMs[0]]["max"] = this.filter_TransportPlannedStartMs_max.getTime();
      }

      if (this.filter_TransportPlannedEndMs_min != null || this.filter_TransportPlannedEndMs_max != null) {
         o[dtcv.TransportPlannedEndMs[0]] = {};
         if (this.filter_TransportPlannedEndMs_min != null)
            o[dtcv.TransportPlannedEndMs[0]]["min"] = this.filter_TransportPlannedEndMs_min.getTime();
         if (this.filter_TransportPlannedEndMs_max != null)
            o[dtcv.TransportPlannedEndMs[0]]["max"] = this.filter_TransportPlannedEndMs_max.getTime();
      }

      if (this.filter_TransportId != null) { o[dtcv.TransportId[0]] = this.filter_TransportId; }
      if (this.filter_Container1Name != null) { o[dtcv.Container1Name[0]] = this.filter_Container1Name; }
      if (this.filter_Container2Name != null) { o[dtcv.Container2Name[0]] = this.filter_Container2Name; }
      if (this.filter_VehicleName != null) { o[dtcv.VehicleName[0]] = this.filter_VehicleName; }
      if (this.filter_Supplier1Name != null) { o[dtcv.Supplier1Name[0]] = this.filter_Supplier1Name; }
      if (this.filter_Supplier2Name != null) { o[dtcv.Supplier2Name[0]] = this.filter_Supplier2Name; }
      if (this.filter_WoodType != null) { o[dtcv.WoodType[0]] = this.filter_WoodType; }
      if (this.filter_Status != null) { o[dtcv.TransportStatus[0]] = this.filter_Status; }
      return o;
   }
   //#endregion

   //#region SORT
   private _orderBy: (keyof DBTransportCardValuesDefinition) | null = "TransportId";
   public get orderBy() {
      return this._orderBy;
   }
   public set orderBy(value: string | null) {
      console.log(`${this.lh()}: DEBUG orderBy SET: ${value}`);
      if (value == null) {
         this._orderBy = null;
      } else {
         if ((dbTransportCardValuesInstance as any)[value] == null) 
            throw new Error(`Invalid orderBy value: ${value}`);
         else 
            this._orderBy = <any>value;
      }
      this.update();
   }

   private _orderDirection: "ASC" | "DESC" = "ASC";
   public get orderDirection() {
      return this._orderDirection;
   }
   public set orderDirection(value: "ASC" | "DESC") {
      console.log(`${this.lh()}: DEBUG orderDirection SET: ${value}`);
      if (value != "ASC" && value != "DESC")
         throw new Error(`Invalid orderDirection value: ${value}`);
      this._orderDirection = value;
      this.update();
   }
   //#endregion

   private _urlBase: string;
   constructor(currentPageNum: number, pageItemCount: number, urlBase: string) {
      this._pageNum = currentPageNum;
      this._pageItemCount = pageItemCount;
      this._urlBase = urlBase;
   }

   public async update(): Promise<void> {
      let fso = this.getFilterStringObject();
      let u = `${this._urlBase}`;
      u += `?start=${(this._pageNum * this._pageItemCount)}&count=${this._pageItemCount}`;
      u += `&filter=${JSON.stringify(fso)}`;

      if (this._orderBy != null) {
         u += `&orderby=${dbTransportCardValuesInstance[this._orderBy][0]} ${this._orderDirection}`;
      }

      console.log(`${this.lh()} url: ${u}`);
      let cards: TransportCard[] = await BE.typedDBGet<TransportCard>(u, (raw: any) => TransportCard.FromDBValues(raw));
      this._tca = cards;
      console.log(`${this.lh()} Fetched Cards; num: ${cards.length}`);

      document.dispatchEvent(new Event(TransportCardPaginationEvents.Updated));
   }
}
