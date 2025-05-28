import angular from "angularjs-ts";
import * as DOMUtils from "./dom_utils";

import { TransportCardsController } from "./TransportCardsController";

export enum DashboardEvents {
   AddTransport = "AddTransport"
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
