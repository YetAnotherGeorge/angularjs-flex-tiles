import angular from "angularjs-ts";
import { TaskCompletionSource } from "./misc_util";
import * as DOMUtils from "./dom_utils";
import { TransportCard, TransportCardPagination, TransportCardPaginationEvents } from "./transport_cards";
import * as BE from "./get_recreated";

export enum DashboardEvents {
   AddTransport = "AddTransport"
}
function TransportCardsController($scope: angular.IScope, $timeout: angular.ITimeoutService): void {
   const lh = () => `[${new Date().toISOString().slice(0, -1).split('T')[1]}] [TransportCardsController]`;
   
   const resizeTarget: HTMLDivElement = <HTMLDivElement>DOMUtils.getElementByIdOrThrow("i011");

  
   type TransportCardsControllerValueTypeDefs = {
      paginationGotoValue: number,
      gotoPage: () => void,

      paginationItemsPerPageValue: number,
      changeItemsPerPage: () => void,

      pagination: TransportCardPagination,
      allCollapsed: boolean,
      paginationVisible: boolean,
      filtersVisible: boolean,
      paginationSmallThreshold: number,
      paginationSmall: boolean,
      paginationSmallInit: () => void,
      collapseAll: (targetState: boolean) => void,
      addButtonClicked: () => void,
   }
   let cv: TransportCardsControllerValueTypeDefs = {
      paginationGotoValue: 1,
      gotoPage: () => {
         cv.pagination.pageNum = (cv.paginationGotoValue - 1);
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
         let wInit: number = DOMUtils.GetDomRectComputed(resizeTarget).computedWidth;
         cv.paginationSmall = wInit <= cv.paginationSmallThreshold;
      },
      collapseAll: (targetState: boolean) => {
         if (typeof (targetState) != "boolean") throw new Error(`Expected boolean value for targetState`);
         cv.pagination.tca.forEach(c => {
            targetState == true ? c.collapse() : c.uncollapse();
         });
         console.log(`${lh()} Collapsed all to target state: ${targetState}`);
         cv.allCollapsed = targetState;
      },
      addButtonClicked: () => {
         document.dispatchEvent(new Event(DashboardEvents.AddTransport));
         console.log("Add button clicked event");
      }
   };
   cv.paginationItemsPerPageValue = cv.pagination.pageItemCount;
   cv.paginationSmallInit();
   $scope.cards = cv;

   document.addEventListener(TransportCardPaginationEvents.Updated, async () => {
      console.log("TransportCardPaginationEvents.Updated");
      cv.pagination.tca.forEach(c => {
         if (c.collapsed != cv.allCollapsed) {
            cv.allCollapsed ? c.collapse() : c.uncollapse();
         }
      });
      $scope.$apply();
   });
   cv.pagination.update();

   // RESIZE, cv.paginationSmall value
   $scope.resize = {};
   $scope.resize.drag = async () => {
      let m0 = false;
      let deltaX: number = 0;
      let initialSizeX: number = DOMUtils.GetDomRectComputed(resizeTarget).computedWidth;
      let mouseMoveListener = (ev: MouseEvent) => {
         ev.stopPropagation();
         if (!m0) {
            deltaX = ev.clientX
            m0 = true;
         } else {
            let moveX: number = ev.clientX - deltaX;
            let newW: number = initialSizeX + moveX;
            resizeTarget.style.width = `${newW}px`;

            let ps: boolean = newW <= cv.paginationSmallThreshold;
            if (ps != cv.paginationSmall) {
               cv.paginationSmall = ps;
               $scope.$apply();
            }
         }
      };
      document.addEventListener("mousemove", mouseMoveListener);

      let taskCompletionSource = new TaskCompletionSource<void>();
      let mouseUpListener = (_: MouseEvent) => { taskCompletionSource.resolve(); };
      document.addEventListener("mouseup", mouseUpListener);
      await taskCompletionSource.promise;
      document.removeEventListener("mouseup", mouseUpListener);
      document.removeEventListener("mousemove", mouseMoveListener);

      console.log(`DragStop`);
   };


   $scope.$on("$destroy", () => {

   });
}

async function ControllerMain(app?: angular.IModule): Promise<void> {
   // Register animation flash function
   (document as any).animationFlash = DOMUtils.animationFlash;
   app!.controller("TransportCardsController", ["$scope", "$timeout", TransportCardsController]);
   console.log("Loaded TransportCardsController");

   // For debugging
   document.addEventListener("AddTransport", (ev: Event) => {
      console.log(`EVENT ${DashboardEvents.AddTransport} Event ${ev.type} fired`);
   });
}


(async () => {
   let app: angular.IModule = angular.module("MainApp", []);
   ControllerMain(app); /* STRIP FROM EXPORT */
})();
