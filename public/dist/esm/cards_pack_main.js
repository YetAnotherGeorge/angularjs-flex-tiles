var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
// import angular from "angularjs-ts";

// src/misc_util.ts
var TaskCompletionSource = class _TaskCompletionSource {
  static {
    __name(this, "TaskCompletionSource");
  }
  static tcsError;
  static {
    _TaskCompletionSource.tcsError = () => {
      throw new Error("TaskCompletionSource error");
    };
  }
  _promise;
  _resolve;
  _resolveSet;
  _reject;
  _rejectSet;
  constructor() {
    this._resolve = _TaskCompletionSource.tcsError;
    this._resolveSet = false;
    this._reject = _TaskCompletionSource.tcsError;
    this._rejectSet = false;
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }
  get promise() {
    return this._promise;
  }
  resolve(value) {
    this._resolve(value);
    this._resolveSet = true;
  }
  get resolveSet() {
    return this._resolveSet;
  }
  reject(reason) {
    this._reject(reason);
    this._rejectSet = true;
  }
  get rejectSet() {
    return this._rejectSet;
  }
};
function timestampToStringRO(timestamp) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${hours}:${minutes} ${day}.${month}.${year}`;
}
__name(timestampToStringRO, "timestampToStringRO");

// src/dom_utils.ts
function getElementByIdOrThrow(idStr) {
  let elem = document.getElementById(idStr);
  if (elem == null)
    throw new Error(`Element with id ${idStr} not found`);
  return elem;
}
__name(getElementByIdOrThrow, "getElementByIdOrThrow");
function animationFlash(elem) {
  elem.classList.add("flashing");
  setTimeout(() => {
    elem.classList.remove("flashing");
  }, 150);
}
__name(animationFlash, "animationFlash");
function GetDomRectComputed(elem) {
  let d = elem.getBoundingClientRect();
  let computedHeight = parseFloat(window.getComputedStyle(elem, null).getPropertyValue("height"));
  if (isNaN(computedHeight))
    throw new Error(`Computed height is NaN for element ${elem}`);
  let computedWidth = parseFloat(window.getComputedStyle(elem, null).getPropertyValue("width"));
  if (isNaN(computedWidth))
    throw new Error(`Computed width is NaN for element ${elem}`);
  let dc = {
    bottom: d.bottom,
    height: d.height,
    left: d.left,
    right: d.right,
    top: d.top,
    width: d.width,
    x: d.x,
    y: d.y,
    computedHeight,
    computedWidth
  };
  return dc;
}
__name(GetDomRectComputed, "GetDomRectComputed");

// src/get_typed.ts
// import { get } from "./get_recreated";
async function typedDBGet(urlencoded, converter) {
  let roTaskCompletionSource = new TaskCompletionSource();
  get(urlencoded, (obj) => {
    if (Array.isArray(obj.data)) {
      let daRaw = obj.data;
      let da = [];
      for (let i = 0; i < daRaw.length; i++) {
        let v = converter(daRaw[i], roTaskCompletionSource.reject);
        if (roTaskCompletionSource.rejectSet)
          return;
        da.push(v);
      }
      roTaskCompletionSource.resolve(da);
    } else {
      console.error(obj);
      roTaskCompletionSource.reject(`Expected array in obj.data but got ${typeof obj.data}`);
    }
  }, (error) => {
    roTaskCompletionSource.reject(error ?? "unknown error");
  });
  let result = await roTaskCompletionSource.promise;
  return result;
}
__name(typedDBGet, "typedDBGet");

// src/transport_cards.ts
var dbTransportCardValuesInstance = {
  TransportId: ["t1.id", 0],
  SupplierId1: ["t1.supplierid1", 0],
  SupplierId2: ["t1.supplierid2", 0],
  VehicleId: ["t1.vehicleid", 0],
  //VehicleId             : [ "v1.id"                ,  "str" ],
  WoodTypeId: ["t1.woodtypeid", 0],
  ContainerId1: ["t1.containerid1", 0],
  Container1Name: ["c1.name", "str"],
  ContainerId2: ["t1.containerid2", 0],
  Container2Name: ["c2.name", "str"],
  TransportStatus: ["t1.status", 0],
  VehicleStatusName: ["t1.statusname", "str"],
  TransportStartMs: ["t1.startstamp", 0, "str"],
  TransportEndMs: ["t1.endstamp", 0, "str"],
  TransportPlannedStartMs: ["t1.plannedstartstamp", 0, "str"],
  TransportPlannedEndMs: ["t1.plannedendstamp", 0, "str"],
  Supplier1Name: ["s1.name", "str"],
  Supplier2Name: ["s2.name", "str"],
  VehicleName: ["v1.name", "str"],
  WoodType: ["w1.name", "str"],
  VehicleLat: ["v1.lat", 0],
  VehicleLng: ["v1.long", 0],
  VehicleMoving: ["v1.ismoving", true, 1]
};
var transportStatusMap = Object.freeze({
  m0: /* @__PURE__ */ new Map([
    [1, "PLANIFICAT"],
    [2, "IN PROGRES"],
    [3, "FINALIZAT"],
    [4, "ANULAT"]
  ]),
  m1: /* @__PURE__ */ new Map([
    ["PLANIFICAT", 1],
    ["IN PROGRES", 2],
    ["FINALIZAT", 3],
    ["ANULAT", 4]
  ])
});
var TransportCard = class _TransportCard {
  static {
    __name(this, "TransportCard");
  }
  //#region DB
  dbValues;
  originalDbValues;
  cached;
  constructor(dbValues, originalDbValues) {
    this.dbValues = dbValues;
    this.originalDbValues = originalDbValues;
    this.cached = /* @__PURE__ */ new Map();
  }
  static FromDBValues(obj) {
    if (typeof obj != "object")
      throw new Error("Expected object");
    let dbValues = {};
    for (const [key, keyDefinitions] of Object.entries(dbTransportCardValuesInstance)) {
      let v = obj[keyDefinitions[0]];
      if (typeof v == typeof keyDefinitions[1]) {
        dbValues[key] = v;
        continue;
      } else if (keyDefinitions.length == 3 && typeof v == typeof keyDefinitions[2]) {
        if (typeof keyDefinitions[1] == "number" && typeof keyDefinitions[2] == "string") {
          let isFloat = v.indexOf(".") != -1;
          let vn = isFloat ? parseFloat(v) : parseInt(v);
          if (!isNaN(vn)) {
            dbValues[key] = vn;
            continue;
          }
        } else if (typeof keyDefinitions[1] == "boolean" && typeof keyDefinitions[2] == "number") {
          dbValues[key] = v != 0;
          continue;
        }
      }
      console.warn(`[${key}]: ${keyDefinitions[0]} expected ${typeof keyDefinitions[1]} but got ${typeof v}; value of v: ${v}; using default value ${keyDefinitions[1]}`);
      dbValues[key] = keyDefinitions[1];
    }
    return new _TransportCard(dbValues, obj);
  }
  //#endregion
  //#region VALUES
  get transportIdName() {
    if (!this.cached.has("transportIdName"))
      this.cached.set("transportIdName", `${this.dbValues.TransportId.toString()}`);
    let v = this.cached.get("transportIdName");
    return v;
  }
  get container1Name() {
    if (!this.cached.has("container1Name"))
      this.cached.set("container1Name", `${this.dbValues.Container1Name}`);
    let v = this.cached.get("container1Name");
    return v;
  }
  get container2Name() {
    if (!this.cached.has("container2Name"))
      this.cached.set("container2Name", `${this.dbValues.Container2Name}`);
    let v = this.cached.get("container2Name");
    return v;
  }
  get transportStatusName() {
    if (!this.cached.has("transportStatusName")) {
      if (transportStatusMap.m0.has(this.dbValues.TransportStatus)) {
        this.cached.set("transportStatusName", `${transportStatusMap.m0.get(this.dbValues.TransportStatus)}`);
      } else {
        this.cached.set("transportStatusName", `necunoscut: ${this.dbValues.TransportStatus}`);
      }
    }
    return this.cached.get("transportStatusName");
  }
  transportStatusIntSwitch(o, defaultValue) {
    let statusId = this.dbValues.TransportStatus;
    let v = o[statusId];
    return v === void 0 ? defaultValue : v;
  }
  get startTimeString() {
    if (!this.cached.has("startTimeString")) {
      let t = this.dbValues.TransportStartMs;
      this.cached.set("startTimeString", t < 1 ? `necunoscut` : `${timestampToStringRO(t)}`);
    }
    return this.cached.get("startTimeString");
  }
  get endTimeString() {
    if (!this.cached.has("endTimeString")) {
      let t = this.dbValues.TransportEndMs;
      this.cached.set("endTimeString", t < 1 ? `necunoscut` : `${timestampToStringRO(t)}`);
    }
    return this.cached.get("endTimeString");
  }
  get plannedStartTimeString() {
    if (!this.cached.has("plannedStartTimeString")) {
      let t = this.dbValues.TransportPlannedStartMs;
      this.cached.set("plannedStartTimeString", t < 1 ? `necunoscut` : `${timestampToStringRO(t)}`);
    }
    return this.cached.get("plannedStartTimeString");
  }
  get plannedEndTimeString() {
    if (!this.cached.has("plannedEndTimeString")) {
      let t = this.dbValues.TransportEndMs;
      this.cached.set("plannedEndTimeString", t < 1 ? `necunoscut` : `${timestampToStringRO(t)}`);
    }
    return this.cached.get("plannedEndTimeString");
  }
  get supplierNames() {
    if (!this.cached.has("supplierNames")) {
      let sarr = [this.dbValues.Supplier1Name, this.dbValues.Supplier2Name].filter((v) => v != "Fara");
      if (sarr.length == 0)
        this.cached.set("supplierNames", "Fara furnizori");
      else
        this.cached.set("supplierNames", `${sarr.join(", ")}`);
    }
    return this.cached.get("supplierNames");
  }
  get materialName() {
    if (!this.cached.has("materialName"))
      this.cached.set("materialName", `${this.dbValues.WoodType}`);
    return this.cached.get("materialName");
  }
  get vehicleName() {
    if (!this.cached.has("vehicleName")) {
      this.cached.set("vehicleName", `${this.dbValues.VehicleName}`);
    }
    return this.cached.get("vehicleName");
  }
  get vehicleMoving() {
    return this.dbValues.VehicleMoving;
  }
  //#endregion
  //#region UI_ONLY
  buttonClick(buttonName) {
    let ev = new CustomEvent("transportCardButtonClick" /* ButtonClick */, {
      detail: { sender: this, buttonName },
      bubbles: false
    });
    document.dispatchEvent(ev);
    console.log("Transport card: dispatched event");
    console.log(ev);
  }
  _hovering = false;
  get hovering() {
    return this._hovering;
  }
  hoverStart() {
    this._hovering = true;
    let ev = new CustomEvent("transportCardHoverStart" /* HoverStart */, {
      detail: { sender: this },
      bubbles: false
    });
    document.dispatchEvent(ev);
  }
  hoverEnd() {
    this._hovering = false;
    let ev = new CustomEvent("transportCardHoverEnd" /* HoverEnd */, {
      detail: { sender: this },
      bubbles: false
    });
    document.dispatchEvent(ev);
  }
  _collapsed = false;
  get collapsed() {
    return this._collapsed;
  }
  collapse() {
    this._collapsed = true;
    let ev = new CustomEvent("transportCardCollapsed" /* Collapsed */, {
      detail: { sender: this },
      bubbles: false
    });
    document.dispatchEvent(ev);
  }
  uncollapse() {
    this._collapsed = false;
    let ev = new CustomEvent("transportCardUncollapsed" /* Uncollapsed */, {
      detail: { sender: this },
      bubbles: false
    });
    document.dispatchEvent(ev);
  }
  toggleCollapse() {
    if (this._collapsed)
      this.uncollapse();
    else
      this.collapse();
  }
  //#endregion
};
var TransportCardPagination = class {
  static {
    __name(this, "TransportCardPagination");
  }
  lh = () => `[${(/* @__PURE__ */ new Date()).toISOString().slice(0, -1).split("T")[1]}] [TransportCardPagination]`;
  _tca = [];
  get tca() {
    return this._tca;
  }
  _pageNum;
  get pageNum() {
    return this._pageNum;
  }
  set pageNum(value) {
    if (value < 0)
      return;
    this._pageNum = value;
    this.update();
  }
  pageNumIncrement() {
    this.pageNum = this.pageNum + 1;
  }
  pageNumDecrement() {
    this.pageNum = this.pageNum - 1;
  }
  _pageItemCount;
  get pageItemCount() {
    return this._pageItemCount;
  }
  set pageItemCount(value) {
    this._pageItemCount = value;
    this.update();
  }
  //#region FILTERS 
  _filter_TransportStartMs_min = null;
  get filter_TransportStartMs_min() {
    return this._filter_TransportStartMs_min;
  }
  set filter_TransportStartMs_min(value) {
    this._filter_TransportStartMs_min = value;
    this.update();
  }
  _filter_TransportStartMs_max = null;
  get filter_TransportStartMs_max() {
    return this._filter_TransportStartMs_max;
  }
  set filter_TransportStartMs_max(value) {
    this._filter_TransportStartMs_max = value;
    this.update();
  }
  _filter_TransportEndMs_min = null;
  get filter_TransportEndMs_min() {
    return this._filter_TransportEndMs_min;
  }
  set filter_TransportEndMs_min(value) {
    this._filter_TransportEndMs_min = value;
    this.update();
  }
  _filter_TransportEndMs_max = null;
  get filter_TransportEndMs_max() {
    return this._filter_TransportEndMs_max;
  }
  set filter_TransportEndMs_max(value) {
    this._filter_TransportEndMs_max = value;
    this.update();
  }
  _filter_TransportPlannedStartMs_min = null;
  get filter_TransportPlannedStartMs_min() {
    return this._filter_TransportPlannedStartMs_min;
  }
  set filter_TransportPlannedStartMs_min(value) {
    this._filter_TransportPlannedStartMs_min = value;
    this.update();
  }
  _filter_TransportPlannedStartMs_max = null;
  get filter_TransportPlannedStartMs_max() {
    return this._filter_TransportPlannedStartMs_max;
  }
  set filter_TransportPlannedStartMs_max(value) {
    this._filter_TransportPlannedStartMs_max = value;
    this.update();
  }
  _filter_TransportPlannedEndMs_min = null;
  get filter_TransportPlannedEndMs_min() {
    return this._filter_TransportPlannedEndMs_min;
  }
  set filter_TransportPlannedEndMs_min(value) {
    this._filter_TransportPlannedEndMs_min = value;
    this.update();
  }
  _filter_TransportPlannedEndMs_max = null;
  get filter_TransportPlannedEndMs_max() {
    return this._filter_TransportPlannedEndMs_max;
  }
  set filter_TransportPlannedEndMs_max(value) {
    this._filter_TransportPlannedEndMs_max = value;
    this.update();
  }
  _filter_TransportId = null;
  get filter_TransportId() {
    return this._filter_TransportId;
  }
  set filter_TransportId(value) {
    this._filter_TransportId = value;
    this.update();
  }
  _filter_Container1Name = null;
  get filter_Container1Name() {
    return this._filter_Container1Name;
  }
  set filter_Container1Name(value) {
    this._filter_Container1Name = value;
    this.update();
  }
  _filter_Container2Name = null;
  get filter_Container2Name() {
    return this._filter_Container2Name;
  }
  set filter_Container2Name(value) {
    this._filter_Container2Name = value;
    this.update();
  }
  _filter_VehicleName = null;
  get filter_VehicleName() {
    return this._filter_VehicleName;
  }
  set filter_VehicleName(value) {
    this._filter_VehicleName = value;
    this.update();
  }
  _filter_Supplier1Name = null;
  get filter_Supplier1Name() {
    return this._filter_Supplier1Name;
  }
  set filter_Supplier1Name(value) {
    this._filter_Supplier1Name = value;
    this.update();
  }
  _filter_Supplier2Name = null;
  get filter_Supplier2Name() {
    return this._filter_Supplier2Name;
  }
  set filter_Supplier2Name(value) {
    this._filter_Supplier2Name = value;
    this.update();
  }
  _filter_WoodType = null;
  get filter_WoodType() {
    return this._filter_WoodType;
  }
  set filter_WoodType(value) {
    this._filter_WoodType = value;
    this.update();
  }
  _filter_Status = null;
  // DROPDOWN
  get filter_Status() {
    return this._filter_Status?.toString() ?? null;
  }
  set filter_Status(valueStr) {
    let value = valueStr == null ? null : parseInt(valueStr);
    if (value == null || transportStatusMap.m0.has(value)) {
      this._filter_Status = value;
      this.update();
    } else {
      throw new Error(`${this.lh()} Not setting filter status to value ${value} (type ${typeof value}) because it is not in transportStatusMap.m0`);
    }
  }
  getFilterStringObject() {
    let o = {};
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
    if (this.filter_TransportId != null) {
      o[dtcv.TransportId[0]] = this.filter_TransportId;
    }
    if (this.filter_Container1Name != null) {
      o[dtcv.Container1Name[0]] = this.filter_Container1Name;
    }
    if (this.filter_Container2Name != null) {
      o[dtcv.Container2Name[0]] = this.filter_Container2Name;
    }
    if (this.filter_VehicleName != null) {
      o[dtcv.VehicleName[0]] = this.filter_VehicleName;
    }
    if (this.filter_Supplier1Name != null) {
      o[dtcv.Supplier1Name[0]] = this.filter_Supplier1Name;
    }
    if (this.filter_Supplier2Name != null) {
      o[dtcv.Supplier2Name[0]] = this.filter_Supplier2Name;
    }
    if (this.filter_WoodType != null) {
      o[dtcv.WoodType[0]] = this.filter_WoodType;
    }
    if (this.filter_Status != null) {
      o[dtcv.TransportStatus[0]] = this.filter_Status;
    }
    return o;
  }
  //#endregion
  //#region SORT
  _orderBy = "TransportId";
  get orderBy() {
    return this._orderBy;
  }
  set orderBy(value) {
    console.log(`${this.lh()}: DEBUG orderBy SET: ${value}`);
    if (value == null) {
      this._orderBy = null;
    } else {
      if (dbTransportCardValuesInstance[value] == null)
        throw new Error(`Invalid orderBy value: ${value}`);
      else
        this._orderBy = value;
    }
    this.update();
  }
  _orderDirection = "ASC";
  get orderDirection() {
    return this._orderDirection;
  }
  set orderDirection(value) {
    console.log(`${this.lh()}: DEBUG orderDirection SET: ${value}`);
    if (value != "ASC" && value != "DESC")
      throw new Error(`Invalid orderDirection value: ${value}`);
    this._orderDirection = value;
    this.update();
  }
  //#endregion
  _urlBase;
  constructor(currentPageNum, pageItemCount, urlBase) {
    this._pageNum = currentPageNum;
    this._pageItemCount = pageItemCount;
    this._urlBase = urlBase;
  }
  async update() {
    let fso = this.getFilterStringObject();
    let u = `${this._urlBase}`;
    u += `?start=${this._pageNum * this._pageItemCount}&count=${this._pageItemCount}`;
    u += `&filter=${JSON.stringify(fso)}`;
    if (this._orderBy != null) {
      u += `&orderby=${dbTransportCardValuesInstance[this._orderBy][0]} ${this._orderDirection}`;
    }
    console.log(`${this.lh()} url: ${u}`);
    let cards = await typedDBGet(u, (raw) => TransportCard.FromDBValues(raw));
    this._tca = cards;
    console.log(`${this.lh()} Fetched Cards; num: ${cards.length}`);
    document.dispatchEvent(new Event("transportPaginationUpdated" /* Updated */));
  }
};

// src/index.ts
var DashboardEvents = /* @__PURE__ */ ((DashboardEvents2) => {
  DashboardEvents2["AddTransport"] = "AddTransport";
  return DashboardEvents2;
})(DashboardEvents || {});
function TransportCardsController($scope, $timeout) {
  const lh = /* @__PURE__ */ __name(() => `[${(/* @__PURE__ */ new Date()).toISOString().slice(0, -1).split("T")[1]}] [TransportCardsController]`, "lh");
  const resizeTarget = getElementByIdOrThrow("i011");
  let cv = {
    paginationGotoValue: 1,
    gotoPage: () => {
      cv.pagination.pageNum = cv.paginationGotoValue - 1;
    },
    paginationItemsPerPageValue: -1,
    changeItemsPerPage: () => {
      cv.pagination.pageItemCount = cv.paginationItemsPerPageValue;
    },
    pagination: new TransportCardPagination(0, 400, "https://localhost/transports_get"),
    allCollapsed: false,
    paginationVisible: true,
    filtersVisible: false,
    paginationSmallThreshold: 588,
    paginationSmall: false,
    paginationSmallInit: () => {
      let wInit = GetDomRectComputed(resizeTarget).computedWidth;
      cv.paginationSmall = wInit <= cv.paginationSmallThreshold;
    },
    collapseAll: (targetState) => {
      if (typeof targetState != "boolean")
        throw new Error(`Expected boolean value for targetState`);
      cv.pagination.tca.forEach((c) => {
        targetState == true ? c.collapse() : c.uncollapse();
      });
      console.log(`${lh()} Collapsed all to target state: ${targetState}`);
      cv.allCollapsed = targetState;
    },
    addButtonClicked: () => {
      document.dispatchEvent(new Event("AddTransport" /* AddTransport */));
      console.log("Add button clicked event");
    }
  };
  cv.paginationItemsPerPageValue = cv.pagination.pageItemCount;
  cv.paginationSmallInit();
  $scope.cards = cv;
  document.addEventListener("transportPaginationUpdated" /* Updated */, async () => {
    console.log("TransportCardPaginationEvents.Updated");
    cv.pagination.tca.forEach((c) => {
      if (c.collapsed != cv.allCollapsed) {
        cv.allCollapsed ? c.collapse() : c.uncollapse();
      }
    });
    $scope.$apply();
  });
  cv.pagination.update();
  $scope.resize = {};
  $scope.resize.drag = async () => {
    let m0 = false;
    let deltaX = 0;
    let initialSizeX = GetDomRectComputed(resizeTarget).computedWidth;
    let mouseMoveListener = /* @__PURE__ */ __name((ev) => {
      ev.stopPropagation();
      if (!m0) {
        deltaX = ev.clientX;
        m0 = true;
      } else {
        let moveX = ev.clientX - deltaX;
        let newW = initialSizeX + moveX;
        resizeTarget.style.width = `${newW}px`;
        let ps = newW <= cv.paginationSmallThreshold;
        if (ps != cv.paginationSmall) {
          cv.paginationSmall = ps;
          $scope.$apply();
        }
      }
    }, "mouseMoveListener");
    document.addEventListener("mousemove", mouseMoveListener);
    let taskCompletionSource = new TaskCompletionSource();
    let mouseUpListener = /* @__PURE__ */ __name((_) => {
      taskCompletionSource.resolve();
    }, "mouseUpListener");
    document.addEventListener("mouseup", mouseUpListener);
    await taskCompletionSource.promise;
    document.removeEventListener("mouseup", mouseUpListener);
    document.removeEventListener("mousemove", mouseMoveListener);
    console.log(`DragStop`);
  };
  $scope.$on("$destroy", () => {
  });
}
__name(TransportCardsController, "TransportCardsController");
async function ControllerMain(app) {
  document.animationFlash = animationFlash;
  app.controller("TransportCardsController", ["$scope", "$timeout", TransportCardsController]);
  console.log("Loaded TransportCardsController");
  document.addEventListener("AddTransport", (ev) => {
    console.log(`EVENT ${"AddTransport" /* AddTransport */} Event ${ev.type} fired`);
  });
}
__name(ControllerMain, "ControllerMain");
(async () => {
  //let app = angular.module("MainApp", []);
  ControllerMain(app);
})();
