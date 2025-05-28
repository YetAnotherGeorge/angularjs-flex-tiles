export class TaskCompletionSource<T> {
   private static tcsError: () => never;
   static {
      TaskCompletionSource.tcsError = () => { throw new Error("TaskCompletionSource error"); };
   }

   private _promise: Promise<T>;
   private _resolve: (value: T | PromiseLike<T>) => void;
   private _resolveSet: boolean;
   private _reject: (reason?: any) => void;
   private _rejectSet: boolean;

   constructor() {
      this._resolve = TaskCompletionSource.tcsError;
      this._resolveSet = false;
      this._reject = TaskCompletionSource.tcsError;
      this._rejectSet = false;
      this._promise = new Promise((resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => {
         this._resolve = resolve;
         this._reject = reject;
      });
   }

   get promise() { return this._promise; }
   resolve(value: T | PromiseLike<T>) {
      this._resolve(value);
      this._resolveSet = true;
   }
   get resolveSet() { return this._resolveSet; }
   reject(reason?: any) {
      this._reject(reason);
      this._rejectSet = true;
   }
   get rejectSet() { return this._rejectSet; }
}

export function timestampToStringRO(timestamp: number): string {
   const date = new Date(timestamp);

   const hours = String(date.getHours()).padStart(2, '0');
   const minutes = String(date.getMinutes()).padStart(2, '0');
   const day = String(date.getDate()).padStart(2, '0');
   const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
   const year = date.getFullYear();

   return `${hours}:${minutes} ${day}.${month}.${year}`;
}
