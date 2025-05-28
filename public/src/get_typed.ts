import { get } from "./get_recreated";
import { TaskCompletionSource } from "./misc_util";


export async function typedDBGet<T>(urlencoded: string, converter: (raw: any, fail?: (reason?: any) => void) => T): Promise<T[]> {

   let roTaskCompletionSource = new TaskCompletionSource<T[]>(); // Result Obtained Task Completion Source
   (get as any)(urlencoded, (obj: any) => {
      if (Array.isArray(obj.data)) {
         let daRaw: any[] = <any[]>obj.data;
         let da: T[] = [];
         for (let i = 0; i < daRaw.length; i++) {
            let v: T = converter(daRaw[i], roTaskCompletionSource.reject);
            if (roTaskCompletionSource.rejectSet)
               return;
            da.push(v);
         }
         roTaskCompletionSource.resolve(da);
      } else {
         console.error(obj);
         roTaskCompletionSource.reject(`Expected array in obj.data but got ${typeof (obj.data)}`);
      }
   }, (error: any) => {
      roTaskCompletionSource.reject(error ?? "unknown error");
   });

   let result: T[] = await roTaskCompletionSource.promise;
   return result;
}
