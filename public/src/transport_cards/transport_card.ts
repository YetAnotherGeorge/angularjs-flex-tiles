
import { timestampToStringRO } from "../misc_util";
import { TransportCardDataModel, TransportCardEvents, transportStatusMap } from "./transport_defs";

export class TransportCard {
   /**
    * Base data
    */
   private _values: TransportCardDataModel;
   public get values(): TransportCardDataModel {
      return this._values;
   }
   /**
    * 
    */
   constructor (values: TransportCardDataModel) {
      this._values = values;
   }

   //#region VALUES
   public get transportIdName(): string { 
      return this._values.transportId.toString();
   }
   public get container1Name(): string {
      return this._values.container1Name;
   }
   public get container2Name(): string {
     return this._values.container2Name;
   }
   public get transportStatusName(): string {
      const stat = this._values.transportStatus;
      if (transportStatusMap.m0.has(stat)) {
         return transportStatusMap.m0.get(stat)!;
      }
      return "UNKNOWN";
   }

   private _startTimeStr: string | null = null;
   public get startTimeString(): string {
      if (this._startTimeStr === null) {
         let t: number = this._values.transportStartMs;
         this._startTimeStr = (t < 1 ? `UNKNOWN` : `${timestampToStringRO(t)}`);
      }
      return this._startTimeStr;
   }
   private _endTimeStr: string | null = null;
   public get endTimeString(): string {
      if (this._endTimeStr === null) {
         let t: number = this._values.transportEndMs;
         this._endTimeStr = (t < 1 ? `UNKNOWN` : `${timestampToStringRO(t)}`);
      }
      return this._endTimeStr;
   }

   private _plannedStartTimeStr: string | null = null;
   public get plannedStartTimeString(): string {
      if (this._plannedStartTimeStr === null) {
         let t: number = this._values.transportPlannedStartMs;
         this._plannedStartTimeStr = (t < 1 ? `UNKNOWN` : `${timestampToStringRO(t)}`);
      }
      return this._plannedStartTimeStr;
   }
   
   private _plannedEndTimeStr: string | null = null;
   public get plannedEndTimeString(): string {
      if (this._plannedEndTimeStr === null) {
         let t: number = this._values.transportPlannedEndMs;
         this._plannedEndTimeStr = (t < 1 ? `UNKNOWN` : `${timestampToStringRO(t)}`);
      }
      return this._plannedEndTimeStr;
   }

   private _supplierNames: string | null = null;
   public get supplierNames(): string {
      if (this._supplierNames == null) {
         this._supplierNames = `${this._values.supplier1Name}, ${this._values.supplier2Name}`;
      }
      return this._supplierNames;
   }
   public get materialTransported(): string {
      return this._values.materialTransported;
   }
   public get vehicleName(): string {
      return this._values.vehicleName;
   }
   public get vehicleMoving(): boolean {
      return this._values.vehicleMoving;
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