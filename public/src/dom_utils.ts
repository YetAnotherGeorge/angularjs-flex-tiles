/**
 * Applies CSS string to via element.style
 * @param elem
 * @param styleString
 */
export function SetStylesFromCssString(elem: HTMLElement, styleString: string) {
   let sa: [string, string][] = <[string, string][]>styleString.split(";")
      .map((token) => token.trim())
      .filter((token: string) => token.length > 0 && (token.match(/:/g) || []).length == 1)
      .map((token: string) => token.split(":").map(tt => tt.trim()));

   // background-color => backgroundColor
   for (let i = 0; i < sa.length; i++) {
      sa[i][0] = sa[i][0].replace(/-[a-z]{1}/g, function (match: string) { return match.slice(1).toUpperCase(); })
   }

   for (let i = 0; i < sa.length; i++) {
      (elem.style as any)[sa[i][0]] = sa[i][1];
   }
}
/**
* Replaces CSS keys in string with ""
* @param elem
* @param styleString
*/
export function RemoveStylesFromCssString(elem: HTMLElement, styleString: string) {
   let sa: [string, string][] = <[string, string][]>styleString.split(";")
      .map((token) => token.trim())
      .filter((token: string) => token.length > 0 && (token.match(/:/g) || []).length == 1)
      .map((token: string) => {
         return [token.split(":")[0].trim(), ""];
      });

   // background-color => backgroundColor
   for (let i = 0; i < sa.length; i++) {
      sa[i][0] = sa[i][0].replace(/-[a-z]{1}/g, function (match: string) { return match.slice(1).toUpperCase(); })
   }

   for (let i = 0; i < sa.length; i++) {
      (elem.style as any)[sa[i][0]] = sa[i][1];
   }
}

export function getElementByIdOrThrow<T extends HTMLElement>(idStr: string): T | never {
   let elem: HTMLElement | null = document.getElementById(idStr);
   if (elem == null) throw new Error(`Element with id ${idStr} not found`);
   return <T>elem;
}
export function downloadJson(data: string, fileName: string) {
   let down: string = "data:text;json;charset=utf-8," + encodeURIComponent(data);

   let downloadAnchor: HTMLAnchorElement = document.createElement("a");
   downloadAnchor.style.display = "none";
   downloadAnchor.setAttribute("href", down);
   downloadAnchor.setAttribute("download", fileName);
   downloadAnchor.click();
}
export function downloadBinaryFromBase64(b64Str: string, fileName: string) {
   let down: string = "data:application/octet-steam;base64," + b64Str;

   let downloadAnchor: HTMLAnchorElement = document.createElement("a");
   downloadAnchor.setAttribute("href", down);
   downloadAnchor.setAttribute("download", fileName);
   downloadAnchor.click();
}


export function animationFlash(elem: HTMLElement) {
   elem.classList.add("flashing");
   setTimeout(() => { elem.classList.remove("flashing") }, 150);
}

export type DOMRectComputed = {
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/bottom) */
   readonly bottom: number;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/height) */
   readonly height: number;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/left) */
   readonly left: number;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/right) */
   readonly right: number;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/top) */
   readonly top: number;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/width) */
   readonly width: number;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/x) */
   readonly x: number;
   /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMRectReadOnly/y) */
   readonly y: number;

   /** From window.getComputedStyle ... -> float */
   readonly computedHeight: number;
   /** From window.getComputedStyle ... -> float */
   readonly computedWidth: number;
}
export function GetDomRectComputed(elem: HTMLElement): DOMRectComputed {
   let d: DOMRect = elem.getBoundingClientRect();
   let computedHeight: number = parseFloat(window.getComputedStyle(elem, null).getPropertyValue("height"));
   if (isNaN(computedHeight)) throw new Error(`Computed height is NaN for element ${elem}`);
   let computedWidth: number = parseFloat(window.getComputedStyle(elem, null).getPropertyValue("width"));
   if (isNaN(computedWidth)) throw new Error(`Computed width is NaN for element ${elem}`);

   let dc: DOMRectComputed = {
      bottom: d.bottom,
      height: d.height,
      left: d.left,
      right: d.right,
      top: d.top,
      width: d.width,
      x: d.x,
      y: d.y,
      computedHeight: computedHeight,
      computedWidth: computedWidth
   }
   return dc;
}