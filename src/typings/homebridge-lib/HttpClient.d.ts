/** biome-ignore-all lint/style/useExportType: Types for homebridge-lib */

declare module 'homebridge-lib/HttpClient' {
  import { EventEmitter } from 'node:events';

  class HttpClient extends EventEmitter {
    static get HttpError(): typeof HttpError;
    static get HttpRequest(): typeof HttpRequest;
    static get HttpResponse(): typeof HttpResponse;

    constructor(params: {
      headers?: {
        [key: string]: string;
      };
      host?: string;
      https?: boolean;
      json?: boolean;
      keepAlive?: boolean;
      maxSockets?: number;
      path?: string;
      port?: number;
      timeout?: number;
      url?: string;
      validStatusCodes?: Array<number>;
    });
    _setUrl(): void;
    /** Server IP address.
     * @type {string}
     * @readonly
     */
    get address(): string;
    /** Server hostname and port.
     * @type {string}
     */
    get host(): string;
    set host(value: string);
    /** Local IP address used for the connection.
     * @type {string}
     * @readonly
     */
    get localAddress(): string;
    /** Server frienly name.
     * Defaults to the hostname.
     * @type {string}
     */
    get name(): string;
    set name(name: string);
    /** Server (base) path.
     * @type {string}
     */
    get path(): string;
    set path(value: string);
    /** Server (base) url.
     * @type {string}
     * @readonly
     */
    get url(): string;
    /** GET request.
     * @param {string} [resource='/'] - The resource.
     * @param {?object} headers - Additional headers for the request.
     * @param {?string} suffix - Additional suffix to append after resource
     * e.g. for authentication of the request.
     * @return {HttpClient.HttpResponse} response - The response.
     * @throws {HttpClient.HttpError} In case of error.
     */
    get(
      resource: string,
      headers?: {
        [key: string]: string;
      },
      suffix?: string,
    ): Promise<HttpResponse>;
    /** PUT request.
     * @param {!string} resource - The resource.
     * @param {?*} body - The body for the request.
     * @param {?object} headers - Additional headers for the request.
     * @param {?string} suffix - Additional suffix to append after resource
     * e.g. for authentication of the request.
     * @return {HttpClient.HttpResponse} response - The response.
     * @throws {HttpClient.HttpError} In case of error.
     */
    put(
      resource: string,
      body: unknown,
      headers?: {
        [key: string]: string;
      },
      suffix?: string,
    ): Promise<HttpResponse>;
    /** POST request.
     * @param {!string} resource - The resource.
     * @param {?*} body - The body for the request.
     * @param {?object} headers - Additional headers for the request.
     * @param {?string} suffix - Additional suffix to append after resource
     * e.g. for authentication of the request.
     * @return {HttpClient.HttpResponse} response - The response.
     * @throws {HttpClient.HttpError} In case of error.
     */
    post(
      resource: string,
      body: unknown,
      headers?: {
        [key: string]: string;
      },
      suffix?: string,
    ): Promise<HttpResponse>;
    /** DELETE request.
     * @param {!string} resource - The resource.
     * @param {?*} body - The body for the request.
     * @param {?object} headers - Additional headers for the request.
     * @param {?string} suffix - Additional suffix to append after resource
     * e.g. for authentication of the request.
     * @return {object} response - The response.
     * @throws {HttpClient.HttpError} In case of error.
     */
    delete(
      resource: string,
      body: unknown,
      headers?: {
        [key: string]: string;
      },
      suffix?: string,
    ): Promise<HttpResponse>;
    /** Issue an HTTP request.
     * @param {string} method - The method for the request.
     * @param {!string} resource - The resource for the request.
     * @param {?*} body - The body for the request.
     * @param {?object} headers - Additional headers for the request.
     * @param {?string} suffix - Additional suffix to append after resource
     * e.g. for authentication of the request.
     * @param {?object} info - Additional key/value pairs to include in the
     * for the `HttpRequest` of the `request`, `response`, and `error` events.
     * @return {HttpClient.HttpResponse} response - The response.
     * @throws {HttpClient.HttpError} In case of error.
     */
    request(
      method: string,
      resource: string,
      body: unknown,
      headers?: {
        [key: string]: string;
      },
      suffix?: string,
      info?: {
        [key: string]: string;
      },
    ): Promise<HttpResponse>;
  }
  export { HttpClient };
}

declare class HttpError extends Error {
  request: HttpRequest;
  statusCode: number;
  statusMessage: string;

  constructor(message: string, request: HttpRequest, statusCode: number, statusMessage: string);
  super(message: string);
}

declare class HttpResponse<T> {
  request: HttpRequest;
  statusCode: number;
  statusMessage: string;
  headers: {
    [key: string]: string;
  };
  body: T;
  parsedBody?: unknown;
  ok?: boolean;

  constructor(
    request: HttpRequest,
    statusCode: number,
    statusMessage: string,
    headers: {
      [key: string]: string;
    },
    body?: T,
    parsedBody?: unknown,
  );
}

declare class HttpRequest {
  name: string;
  id: number;
  method: string;
  resource: string;
  headers: {
    [key: string]: string;
  };
  body: string;
  url: string;

  constructor(
    name: string,
    id: number,
    method: string,
    resource: string,
    headers: {
      [key: string]: string;
    },
    body: string,
    url: string,
  );
}
