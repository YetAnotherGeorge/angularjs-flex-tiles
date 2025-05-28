import { TransportCard } from "./transport_card";
import { TransportCardDataModel, TransportCardDataModelKeys, TransportCardPaginationEvents, transportStatusMap } from "./transport_defs";

export class TransportCardPagination {
   private lh = () => `[${new Date().toISOString().slice(0, -1).split('T')[1]}] [TCPag]`;

   private _tcMapEnabled: Map<TransportCard, boolean> = new Map<TransportCard, boolean>();
   public get tcMapEnabled(): Map<TransportCard, boolean> {
      return this._tcMapEnabled;
   }

   private _tcArray: TransportCard[] = [];
   public get tcArray(): TransportCard[] {
      return this._tcArray;
   }


   private _pageNum: number; 
   /**
    * 1-indexed page number
    */
   public get pageNum(): number {
      return this._pageNum;
   }
   /**
    * 1-indexed page number
    */
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
   // 1. TransportStartMs_min
   private _filter_TransportStartMs_min: Date | null = null;
   public get filter_TransportStartMs_min(): Date | null { return this._filter_TransportStartMs_min; }
   public set filter_TransportStartMs_min(value: Date | null) {
      this._filter_TransportStartMs_min = value;
      this.update();
   }
   // 2. TransportStartMs_max
   private _filter_TransportStartMs_max: Date | null = null;
   public get filter_TransportStartMs_max(): Date | null { return this._filter_TransportStartMs_max; }
   public set filter_TransportStartMs_max(value: Date | null) {
      this._filter_TransportStartMs_max = value;
      this.update();
   }

   // 3. TransportEndMs_min
   private _filter_TransportEndMs_min: Date | null = null;
   public get filter_TransportEndMs_min(): Date | null { return this._filter_TransportEndMs_min; }
   public set filter_TransportEndMs_min(value: Date | null) {
      this._filter_TransportEndMs_min = value;
      this.update();
   }
   // 4. TransportEndMs_max
   private _filter_TransportEndMs_max: Date | null = null;
   public get filter_TransportEndMs_max(): Date | null { return this._filter_TransportEndMs_max; }
   public set filter_TransportEndMs_max(value: Date | null) {
      this._filter_TransportEndMs_max = value;
      this.update();
   }

   // 5. TransportPlannedStartMs_min
   private _filter_TransportPlannedStartMs_min: Date | null = null;
   public get filter_TransportPlannedStartMs_min(): Date | null { return this._filter_TransportPlannedStartMs_min; }
   public set filter_TransportPlannedStartMs_min(value: Date | null) {
      this._filter_TransportPlannedStartMs_min = value;
      this.update();
   }
   // 6. TransportPlannedStartMs_max
   private _filter_TransportPlannedStartMs_max: Date | null = null;
   public get filter_TransportPlannedStartMs_max(): Date | null { return this._filter_TransportPlannedStartMs_max; }
   public set filter_TransportPlannedStartMs_max(value: Date | null) {
      this._filter_TransportPlannedStartMs_max = value;
      this.update();
   }

   // 7. TransportPlannedEndMs_min
   private _filter_TransportPlannedEndMs_min: Date | null = null;
   public get filter_TransportPlannedEndMs_min(): Date | null { return this._filter_TransportPlannedEndMs_min; }
   public set filter_TransportPlannedEndMs_min(value: Date | null) {
      this._filter_TransportPlannedEndMs_min = value;
      this.update();
   }
   // 8. TransportPlannedEndMs_max
   private _filter_TransportPlannedEndMs_max: Date | null = null; // 8.
   public get filter_TransportPlannedEndMs_max(): Date | null { return this._filter_TransportPlannedEndMs_max; }
   public set filter_TransportPlannedEndMs_max(value: Date | null) {
      this._filter_TransportPlannedEndMs_max = value;
      this.update();
   }

   // 9. TransportId
   private _filter_TransportId: number | null = null; // 9.
   public get filter_TransportId(): number | null { return this._filter_TransportId; }
   public set filter_TransportId(value: number | null) {
      this._filter_TransportId = value;
      this.update();
   }
   
   // 10. Container1Name
   private _filter_Container1Name: string | null = null;
   public get filter_Container1Name() { return this._filter_Container1Name; }
   public set filter_Container1Name(value: string | null) {
      this._filter_Container1Name = value;
      this.update();
   }
   // 11. Container2Name
   private _filter_Container2Name: string | null = null;
   public get filter_Container2Name() { return this._filter_Container2Name; }
   public set filter_Container2Name(value: string | null) {
      this._filter_Container2Name = value;
      this.update();
   }

   // 12. VehicleName
   private _filter_VehicleName: string | null = null;
   public get filter_VehicleName() { return this._filter_VehicleName; }
   public set filter_VehicleName(value: string | null) {
      this._filter_VehicleName = value;
      this.update();
   }

   // 13. Supplier1Name
   private _filter_Supplier1Name: string | null = null;
   public get filter_Supplier1Name() { return this._filter_Supplier1Name; }
   public set filter_Supplier1Name(value: string | null) {
      this._filter_Supplier1Name = value;
      this.update();
   }
   // 14. Supplier2Name
   private _filter_Supplier2Name: string | null = null;
   public get filter_Supplier2Name() { return this._filter_Supplier2Name; }
   public set filter_Supplier2Name(value: string | null) {
      this._filter_Supplier2Name = value;
      this.update();
   }
   // 15. MaterialTransported
   private _filter_MaterialTransported: string | null = null;
   public get filter_MaterialTransported() { return this._filter_MaterialTransported; }
   public set filter_MaterialTransported(value: string | null) {
      this._filter_MaterialTransported = value;
      this.update();
   }

   // 16. Status
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

   /**
    * From above filters, set true / false for values in _tcMapEnabled and then construct _tcArray from enabled values.
    */
   public applyFilters(): void {
      console.log(`${this.lh()}: DEBUG applyFilters called`);
      // Reset based on filters:
      this._tcMapEnabled.forEach((_:boolean, tc: TransportCard) => {
         // 1. _filter_TransportStartMs_min
         if (this._filter_TransportStartMs_min != null) {
            if (tc.values.transportStartMs < this._filter_TransportStartMs_min.getTime()) {
               this._tcMapEnabled.set(tc, false);
               return;
            }
         }

         // 2. _filter_TransportStartMs_max
         if (this._filter_TransportStartMs_max != null) {
            if (tc.values.transportStartMs > this._filter_TransportStartMs_max.getTime()) {
               this._tcMapEnabled.set(tc, false);
               return;
            }
         }

         // 3. _filter_TransportEndMs_min
         if (this._filter_TransportEndMs_min != null) {
            if (tc.values.transportEndMs < this._filter_TransportEndMs_min.getTime()) {
               this._tcMapEnabled.set(tc, false);
               return;
            }
         }
         
         // 4. _filter_TransportEndMs_max
         if (this._filter_TransportEndMs_max != null) {
            if (tc.values.transportEndMs > this._filter_TransportEndMs_max.getTime()) {
               this._tcMapEnabled.set(tc, false);
               return;
            }
         }

         // 5. _filter_TransportPlannedStartMs_min
         if (this._filter_TransportPlannedStartMs_min != null) {
            if (tc.values.transportPlannedStartMs < this._filter_TransportPlannedStartMs_min.getTime()) {
               this._tcMapEnabled.set(tc, false);
               return;
            }
         }

         // 6. _filter_TransportPlannedStartMs_max
         if (this._filter_TransportPlannedStartMs_max != null) {
            if (tc.values.transportPlannedStartMs > this._filter_TransportPlannedStartMs_max.getTime()) {
               this._tcMapEnabled.set(tc, false);
               return;
            }
         }

         // 7. _filter_TransportPlannedEndMs_min
         if (this._filter_TransportPlannedEndMs_min != null) {
            if (tc.values.transportPlannedEndMs < this._filter_TransportPlannedEndMs_min.getTime()) {
               this._tcMapEnabled.set(tc, false);
               return;
            }
         }

         // 8. _filter_TransportPlannedEndMs_max
         if (this._filter_TransportPlannedEndMs_max != null) {
            if (tc.values.transportPlannedEndMs > this._filter_TransportPlannedEndMs_max.getTime()) {
               this._tcMapEnabled.set(tc, false);
               return;
            }
         }

         // 9. _filter_TransportId
         if (this._filter_TransportId != null) {
            if (tc.values.transportId !== this._filter_TransportId) {
               this._tcMapEnabled.set(tc, false);
               return;
            }
         }

         // 10. _filter_Container1Name
         if (this._filter_Container1Name != null) {
            if (!tc.values.container1Name.toLowerCase().includes(this._filter_Container1Name.toLowerCase())) {
               this._tcMapEnabled.set(tc, false);
               return;
            }
         }

         // 11. _filter_Container2Name
         if (this._filter_Container2Name != null) {
            if (!tc.values.container2Name.toLowerCase().includes(this._filter_Container2Name.toLowerCase())) {
               this._tcMapEnabled.set(tc, false);
               return;
            }
         }

         // 12. _filter_VehicleName
         if (this._filter_VehicleName != null) {
            if (!tc.values.vehicleName.toLowerCase().includes(this._filter_VehicleName.toLowerCase())) {
               this._tcMapEnabled.set(tc, false);
               return;
            }
         }

         // 13. _filter_Supplier1Name
         if (this._filter_Supplier1Name != null) {
            if (!tc.values.supplier1Name.toLowerCase().includes(this._filter_Supplier1Name.toLowerCase())) {
               this._tcMapEnabled.set(tc, false);
               return;
            }
         }

         // 14. _filter_Supplier2Name
         if (this._filter_Supplier2Name != null) {
            if (!tc.values.supplier2Name.toLowerCase().includes(this._filter_Supplier2Name.toLowerCase())) {
               this._tcMapEnabled.set(tc, false);
               return;
            }
         }

         // 15. _filter_MaterialTransported
         if (this._filter_MaterialTransported != null) {
            if (!tc.values.materialTransported.toLowerCase().includes(this._filter_MaterialTransported.toLowerCase())) {
               this._tcMapEnabled.set(tc, false);
               return;
            }
         }

         // 16. _filter_Status
         if (this._filter_Status != null) {
            if (tc.values.transportStatus !== this._filter_Status) {
               this._tcMapEnabled.set(tc, false);
               return;
            }
         }

         // All filters passed
         this._tcMapEnabled.set(tc, true);
      });
   }
   //#endregion
  
   //#region SORT
   private _orderBy: (keyof TransportCardDataModel) | null = "transportId";
   public get orderBy() {
      return this._orderBy;
   }
   public set orderBy(value: string | null) {
      console.log(`${this.lh()}: DEBUG orderBy SET: ${value}`);
      if (value == null) {
         this._orderBy = null;
      } else {
         if (TransportCardDataModelKeys[value as keyof TransportCardDataModel] == null) {
            console.error(`Invalid orderBy value: ${value}`);
            this._orderBy = null;
            return;
         } else {
            this._orderBy = value as keyof TransportCardDataModel;
            console.log(`${this.lh()}: DEBUG orderBy set to: ${this._orderBy}`);
         }
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
   public applySort(): void {
      console.log(`${this.lh()}: DEBUG applySort called - orderBy: ${this._orderBy}, orderDirection: ${this._orderDirection}`);
      if (this.orderDirection == "ASC") {
         this._tcArray.sort((a, b) => a.values[this._orderBy!] > b.values[this._orderBy!] ? 1 : -1);
      } else {
         this._tcArray.sort((a, b) => a.values[this._orderBy!] < b.values[this._orderBy!] ? 1 : -1);
      }
   }
   //#endregion

   //#region PAGINATION
   private _tcArraySlice: TransportCard[] = [];
   public get tcArraySlice(): TransportCard[] {
      return this._tcArraySlice;
   }

   /**
    * tcArray is expected to be filtered and sorted, now set tcArraySlice
    */
   applyPagination(): void {
      const skip = (this.pageNum - 1) * this.pageItemCount;
      if (skip > this._tcArray.length) { 
         this._tcArraySlice = [];
      } else {
         this._tcArraySlice = this._tcArray.slice(skip, Math.min(skip + this.pageItemCount, this.tcArray.length));
      }

      console.log(`${this.lh()}: DBG applyPagination; pageNum: ${this.pageNum}, pageItemCount: ${this.pageItemCount}, skip: ${skip}`);
      console.log(`${this.lh()}: DBG SLICE`, this.tcArraySlice);
   }
   //#endregion

   /**
    * 
    * @param currentPageNum 1-indexed page number
    * @param pageItemCount 
    * @param cardsData 
    */
   constructor(currentPageNum: number, pageItemCount: number, cardsData: TransportCardDataModel[]) {
      if (currentPageNum < 1)
         throw new Error(`${this.lh()}: currentPageNum must be >= 1, got ${currentPageNum}`);
      this._pageNum = currentPageNum;
      this._pageItemCount = pageItemCount;

      // Set _tcArray from cardsData
      this._tcArray = cardsData.map(data => {
         if (typeof data !== "object" || data === null) {
            throw new Error(`${this.lh()}: Expected TransportCardDataModel object, got ${typeof data}`);
         }
         return new TransportCard(data);
      });
      // Set _tcMapEnabled to true for all cards
      this._tcMapEnabled = new Map<TransportCard, boolean>();
      for (let i = 0; i < this._tcArray.length; i++) {
         this._tcMapEnabled.set(this._tcArray[i], true);
      }

      this.update();
   }

   public async update(): Promise<void> {
      console.log(`${this.lh()}: DEBUG update called`);

      // 1. filters
      this.applyFilters();
      // 2. sort
      this.applySort();
      // 3. pagination
      this.applyPagination();

      document.dispatchEvent(new Event(TransportCardPaginationEvents.Updated));
   }
}