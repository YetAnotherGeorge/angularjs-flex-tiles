import angular from "angularjs-ts";
import { DashboardEvents } from ".";
import * as DOMUtils from "./dom_utils";
import { TaskCompletionSource } from "./misc_util";

import { TransportCardDataModel, TransportCardPaginationEvents } from "./transport_cards/transport_defs";
import { TransportCard } from "./transport_cards/transport_card";
import { TransportCardPagination } from "./transport_cards/transport_card_pagination";
import { generateDummyTransportCardData } from "./transport_cards/transport_card_dummy_gen";

type TransportCardsControllerValueTypeDefs = {
   paginationGotoValue: number;
   gotoPage: () => void;

   paginationItemsPerPageValue: number;
   changeItemsPerPage: () => void;

   pagination: TransportCardPagination;
   allCollapsed: boolean;
   paginationVisible: boolean;
   filtersVisible: boolean;
   paginationSmallThreshold: number;
   paginationSmall: boolean;
   paginationSmallInit: () => void;
   collapseAll: (targetState: boolean) => void;
   addButtonClicked: () => void;
};

export function TransportCardsController($scope: angular.IScope, $timeout: angular.ITimeoutService): void {
   const lh = () => `[${new Date().toISOString().slice(0, -1).split('T')[1]}] [TCController]`;

   const resizeTarget: HTMLDivElement = <HTMLDivElement>DOMUtils.getElementByIdOrThrow("i011");

   // Data gen
   const paginationDummyData: TransportCardDataModel[] = generateDummyTransportCardData(500);
   console.log(`${lh()} Generated dummy data for pagination: ${paginationDummyData.length} items`, paginationDummyData);

   // Create data context
   let cv: TransportCardsControllerValueTypeDefs = {
      paginationGotoValue: 1,
      gotoPage: () => {
         cv.pagination.pageNum = cv.paginationGotoValue;
      },
      paginationItemsPerPageValue: -1,
      changeItemsPerPage: () => {
         cv.pagination.pageItemCount = cv.paginationItemsPerPageValue;
      },
      pagination: new TransportCardPagination(1, 50, paginationDummyData),
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
         cv.pagination.tcArray.forEach(c => {
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

   (document as any).SAP = () => $scope.$apply();
   document.addEventListener(TransportCardPaginationEvents.Updated, async () => {
      console.log("TransportCardPaginationEvents.Updated");
      cv.pagination.tcArray.forEach(c => {
         if (c.collapsed != cv.allCollapsed) {
            cv.allCollapsed ? c.collapse() : c.uncollapse();
         }
      });

      if (!$scope.$$phase && !$scope.$root.$$phase) {
         $scope.$apply();
      }
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
            deltaX = ev.clientX;
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
      console.error(`${lh()} Destroy not implemented`);
   });
}
