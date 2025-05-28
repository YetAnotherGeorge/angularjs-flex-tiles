//#region SUPPORT (Will not be present in export)
export type AJAX_RESULT_OK = { status: number, responseText: string };
export type AJAX_RESULT_ERR = { status: number, responseText: string };
export function AJAX_GET(url: string): Promise<AJAX_RESULT_OK> {
   let promise: Promise<AJAX_RESULT_OK> = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onload = function () {
         if (xhr.status >= 200 && xhr.status < 300) {
            let res: AJAX_RESULT_OK = {
               status: xhr.status, responseText: xhr.responseText
            }
            resolve(res);
         } else {
            let res: AJAX_RESULT_ERR = {
               status: xhr.status, responseText: xhr.responseText
            };
            reject(res);
         }
      };
      xhr.onerror = function () {
         reject({ status: xhr.status, responseText: xhr.responseText })
      };
      xhr.send();
   });
   return promise;
}
export function AJAX_POST(url: string, body: string | null = null): Promise<AJAX_RESULT_OK> {
   const promise: Promise<AJAX_RESULT_OK> = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      xhr.onload = function () {
         if (xhr.status >= 200 && xhr.status < 300) {
            const res: AJAX_RESULT_OK = {
               status: xhr.status,
               responseText: xhr.responseText,
            };
            resolve(res);
         } else {
            const res: AJAX_RESULT_ERR = {
               status: xhr.status,
               responseText: xhr.responseText,
            };
            reject(res);
         }
      };
      xhr.onerror = function () {
         reject({ status: xhr.status, responseText: xhr.responseText });
      };
      xhr.send(body);
   });

   return promise;
}
/**
 * Does not automatically call apply; for this to work, the server's api user login + permissions monitoring must be overridden
 * @param urlencoded
 * @param cb data is found in obj.data
 * @param cberr
 * @param $http
 */
export function get(urlencoded: string, cb: (obj: any) => void, cberr: (err: any) => void): void {
   AJAX_GET(urlencoded).then((value: AJAX_RESULT_OK) => {
      let respObj: any = null;
      let respObjParsed: boolean = false;
      try {
         respObj = JSON.parse(value.responseText);
         respObjParsed = true;
      } catch (ex) {
         cberr(ex);
      }
      if (respObjParsed)
         cb(respObj);
   }).catch(cberr);
}
//#endregion




