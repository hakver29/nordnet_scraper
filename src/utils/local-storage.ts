import { AsyncLocalStorage } from 'async_hooks';

/// EXPERIMENTAL NODE API - MAY BREAK ON ANY UPGRADE - CODE DEFENSIVELY, TEST
/// THOROUGHLY.  SEE FEATURE STABILITY ON https://nodejs.org/api/async_hooks.html
/// AND REMOVE THIS NOTICE WHEN THE FEATURE IS CONSIDERED STABLE

interface ILocalStorageData {
  requestId?: string;
}

/***
 * For more on this pattern see https://dev.to/gkoniaris/nodejs-logging-from-beginner-to-expert-30a6
 * under the headline Keep track of our NodeJS logs order.
 *
 * In summary, AsyncLocalStorage lets us greate a unique store per request. In it, we store
 * a UUID for each request. This UUID we then use when logging so we have a way of keeping
 * track without passing a UUID down through every call stack.
 */
class Storage {
  storage: AsyncLocalStorage<ILocalStorageData> | null = null;

  constructor() {
    try {
      this.storage = new AsyncLocalStorage<ILocalStorageData>();
    } catch (e) {
      // Can't use Logger here because of the circular dependency.
      console.error(
        'AsyncLocalStorage failed to initialize! Request IDs will be missing from the logs until resolved. Wrong Node version? Minimum is 12.17.0'
      );
      console.error(e);
    }
  }

  enterWith(initial: ILocalStorageData) {
    if (this.storage) {
      try {
        this.storage.enterWith(initial);
      } catch (e) {
        // Can't use Logger here because of the circular dependency.
        console.error(
          'AsyncLocalStorage.enterWith failed. Did the API change? Request IDs will be missing from the logs until resolved.'
        );
        console.error(e);
      }
    }
  }

  getStore(): ILocalStorageData {
    if (!this.storage) {
      return {};
    }
    try {
      return this.storage.getStore() || {};
    } catch (e) {
      // Can't use Logger here because of the circular dependency.
      console.error(
        'AsyncLocalStorage.getStore failed. Did the API change? Request IDs will be missing from the logs until resolved.'
      );
      console.error(e);
      return {};
    }
  }
}

export default new Storage();
