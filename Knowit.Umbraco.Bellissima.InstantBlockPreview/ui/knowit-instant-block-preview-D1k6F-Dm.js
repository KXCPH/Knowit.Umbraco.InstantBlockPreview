import { html as N, styleMap as z, unsafeHTML as V, css as se, customElement as ae } from "@umbraco-cms/backoffice/external/lit";
import { UMB_PROPERTY_CONTEXT as ie } from "@umbraco-cms/backoffice/property";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as oe } from "@umbraco-cms/backoffice/document";
import { debounce as ne } from "@umbraco-cms/backoffice/utils";
import { O as o } from "./index-Dku9YWOy.js";
import "@umbraco-cms/backoffice/ufm";
import { UMB_BLOCK_MANAGER_CONTEXT as ce, UMB_BLOCK_ENTRY_CONTEXT as de } from "@umbraco-cms/backoffice/block";
import { UmbLitElement as ue } from "@umbraco-cms/backoffice/lit-element";
class X extends Error {
  constructor(e, t, a) {
    super(a), this.name = "ApiError", this.url = t.url, this.status = t.status, this.statusText = t.statusText, this.body = t.body, this.request = e;
  }
}
class he extends Error {
  constructor(e) {
    super(e), this.name = "CancelError";
  }
  get isCancelled() {
    return !0;
  }
}
class pe {
  constructor(e) {
    this._isResolved = !1, this._isRejected = !1, this._isCancelled = !1, this.cancelHandlers = [], this.promise = new Promise((t, a) => {
      this._resolve = t, this._reject = a;
      const s = (u) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isResolved = !0, this._resolve && this._resolve(u));
      }, i = (u) => {
        this._isResolved || this._isRejected || this._isCancelled || (this._isRejected = !0, this._reject && this._reject(u));
      }, d = (u) => {
        this._isResolved || this._isRejected || this._isCancelled || this.cancelHandlers.push(u);
      };
      return Object.defineProperty(d, "isResolved", {
        get: () => this._isResolved
      }), Object.defineProperty(d, "isRejected", {
        get: () => this._isRejected
      }), Object.defineProperty(d, "isCancelled", {
        get: () => this._isCancelled
      }), e(s, i, d);
    });
  }
  get [Symbol.toStringTag]() {
    return "Cancellable Promise";
  }
  then(e, t) {
    return this.promise.then(e, t);
  }
  catch(e) {
    return this.promise.catch(e);
  }
  finally(e) {
    return this.promise.finally(e);
  }
  cancel() {
    if (!(this._isResolved || this._isRejected || this._isCancelled)) {
      if (this._isCancelled = !0, this.cancelHandlers.length)
        try {
          for (const e of this.cancelHandlers)
            e();
        } catch (e) {
          console.warn("Cancellation threw an error", e);
          return;
        }
      this.cancelHandlers.length = 0, this._reject && this._reject(new he("Request aborted"));
    }
  }
  get isCancelled() {
    return this._isCancelled;
  }
}
const D = (r) => typeof r == "string", $ = (r) => D(r) && r !== "", W = (r) => r instanceof Blob, Z = (r) => r instanceof FormData, le = (r) => {
  try {
    return btoa(r);
  } catch {
    return Buffer.from(r).toString("base64");
  }
}, me = (r) => {
  const e = [], t = (s, i) => {
    e.push(`${encodeURIComponent(s)}=${encodeURIComponent(String(i))}`);
  }, a = (s, i) => {
    i != null && (i instanceof Date ? t(s, i.toISOString()) : Array.isArray(i) ? i.forEach((d) => a(s, d)) : typeof i == "object" ? Object.entries(i).forEach(([d, u]) => a(`${s}[${d}]`, u)) : t(s, i));
  };
  return Object.entries(r).forEach(([s, i]) => a(s, i)), e.length ? `?${e.join("&")}` : "";
}, ye = (r, e) => {
  const t = encodeURI, a = e.url.replace("{api-version}", r.VERSION).replace(/{(.*?)}/g, (i, d) => {
    var u;
    return (u = e.path) != null && u.hasOwnProperty(d) ? t(String(e.path[d])) : i;
  }), s = r.BASE + a;
  return e.query ? s + me(e.query) : s;
}, Te = (r) => {
  if (r.formData) {
    const e = new FormData(), t = (a, s) => {
      D(s) || W(s) ? e.append(a, s) : e.append(a, JSON.stringify(s));
    };
    return Object.entries(r.formData).filter(([, a]) => a != null).forEach(([a, s]) => {
      Array.isArray(s) ? s.forEach((i) => t(a, i)) : t(a, s);
    }), e;
  }
}, S = async (r, e) => typeof e == "function" ? e(r) : e, be = async (r, e) => {
  const [t, a, s, i] = await Promise.all([
    // @ts-ignore
    S(e, r.TOKEN),
    // @ts-ignore
    S(e, r.USERNAME),
    // @ts-ignore
    S(e, r.PASSWORD),
    // @ts-ignore
    S(e, r.HEADERS)
  ]), d = Object.entries({
    Accept: "application/json",
    ...i,
    ...e.headers
  }).filter(([, u]) => u != null).reduce((u, [l, m]) => ({
    ...u,
    [l]: String(m)
  }), {});
  if ($(t) && (d.Authorization = `Bearer ${t}`), $(a) && $(s)) {
    const u = le(`${a}:${s}`);
    d.Authorization = `Basic ${u}`;
  }
  return e.body !== void 0 && (e.mediaType ? d["Content-Type"] = e.mediaType : W(e.body) ? d["Content-Type"] = e.body.type || "application/octet-stream" : D(e.body) ? d["Content-Type"] = "text/plain" : Z(e.body) || (d["Content-Type"] = "application/json")), new Headers(d);
}, fe = (r) => {
  var e, t;
  if (r.body !== void 0)
    return (e = r.mediaType) != null && e.includes("application/json") || (t = r.mediaType) != null && t.includes("+json") ? JSON.stringify(r.body) : D(r.body) || W(r.body) || Z(r.body) ? r.body : JSON.stringify(r.body);
}, ve = async (r, e, t, a, s, i, d) => {
  const u = new AbortController();
  let l = {
    headers: i,
    body: a ?? s,
    method: e.method,
    signal: u.signal
  };
  for (const m of r.interceptors.request._fns)
    l = await m(l);
  return d(() => u.abort()), await fetch(t, l);
}, ge = (r, e) => {
  if (e) {
    const t = r.headers.get(e);
    if (D(t))
      return t;
  }
}, ke = async (r) => {
  if (r.status !== 204)
    try {
      const e = r.headers.get("Content-Type");
      if (e) {
        const t = ["application/octet-stream", "application/pdf", "application/zip", "audio/", "image/", "video/"];
        if (e.includes("application/json") || e.includes("+json"))
          return await r.json();
        if (t.some((a) => e.includes(a)))
          return await r.blob();
        if (e.includes("multipart/form-data"))
          return await r.formData();
        if (e.includes("text/"))
          return await r.text();
      }
    } catch (e) {
      console.error(e);
    }
}, qe = (r, e) => {
  const a = {
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "Im a teapot",
    421: "Misdirected Request",
    422: "Unprocessable Content",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required",
    ...r.errors
  }[e.status];
  if (a)
    throw new X(r, e, a);
  if (!e.ok) {
    const s = e.status ?? "unknown", i = e.statusText ?? "unknown", d = (() => {
      try {
        return JSON.stringify(e.body, null, 2);
      } catch {
        return;
      }
    })();
    throw new X(
      r,
      e,
      `Generic Error: status: ${s}; status text: ${i}; body: ${d}`
    );
  }
}, n = (r, e) => new pe(async (t, a, s) => {
  try {
    const i = ye(r, e), d = Te(e), u = fe(e), l = await be(r, e);
    if (!s.isCancelled) {
      let m = await ve(r, e, i, u, d, l, s);
      for (const re of r.interceptors.response._fns)
        m = await re(m);
      const R = await ke(m), te = ge(m, e.responseHeader);
      let K = R;
      e.responseTransformer && m.ok && (K = await e.responseTransformer(R));
      const J = {
        url: i,
        ok: m.ok,
        status: m.status,
        statusText: m.statusText,
        body: te ?? K
      };
      qe(e, J), t(J.body);
    }
  } catch (i) {
    a(i);
  }
});
class _e {
  /**
   * @param data The data for the request.
   * @param data.requestBody
   * @returns string Created
   * @throws ApiError
   */
  static postDataType(e = {}) {
    return n(o, {
      method: "POST",
      url: "/umbraco/management/api/v1/data-type",
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Generated-Resource",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns unknown OK
   * @throws ApiError
   */
  static getDataTypeById(e) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/data-type/{id}",
      path: {
        id: e.id
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns string OK
   * @throws ApiError
   */
  static deleteDataTypeById(e) {
    return n(o, {
      method: "DELETE",
      url: "/umbraco/management/api/v1/data-type/{id}",
      path: {
        id: e.id
      },
      responseHeader: "Umb-Notifications",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static putDataTypeById(e) {
    return n(o, {
      method: "PUT",
      url: "/umbraco/management/api/v1/data-type/{id}",
      path: {
        id: e.id
      },
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Notifications",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns string Created
   * @throws ApiError
   */
  static postDataTypeByIdCopy(e) {
    return n(o, {
      method: "POST",
      url: "/umbraco/management/api/v1/data-type/{id}/copy",
      path: {
        id: e.id
      },
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Generated-Resource",
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns boolean OK
   * @throws ApiError
   */
  static getDataTypeByIdIsUsed(e) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/data-type/{id}/is-used",
      path: {
        id: e.id
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static putDataTypeByIdMove(e) {
    return n(o, {
      method: "PUT",
      url: "/umbraco/management/api/v1/data-type/{id}/move",
      path: {
        id: e.id
      },
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Notifications",
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns unknown OK
   * @throws ApiError
   */
  static getDataTypeByIdReferences(e) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/data-type/{id}/references",
      path: {
        id: e.id
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @returns unknown OK
   * @throws ApiError
   */
  static getDataTypeConfiguration() {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/data-type/configuration",
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.requestBody
   * @returns string Created
   * @throws ApiError
   */
  static postDataTypeFolder(e = {}) {
    return n(o, {
      method: "POST",
      url: "/umbraco/management/api/v1/data-type/folder",
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Generated-Resource",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns unknown OK
   * @throws ApiError
   */
  static getDataTypeFolderById(e) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/data-type/folder/{id}",
      path: {
        id: e.id
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns string OK
   * @throws ApiError
   */
  static deleteDataTypeFolderById(e) {
    return n(o, {
      method: "DELETE",
      url: "/umbraco/management/api/v1/data-type/folder/{id}",
      path: {
        id: e.id
      },
      responseHeader: "Umb-Notifications",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static putDataTypeFolderById(e) {
    return n(o, {
      method: "PUT",
      url: "/umbraco/management/api/v1/data-type/folder/{id}",
      path: {
        id: e.id
      },
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Notifications",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.skip
   * @param data.take
   * @param data.name
   * @param data.editorUiAlias
   * @param data.editorAlias
   * @returns unknown OK
   * @throws ApiError
   */
  static getFilterDataType(e = {}) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/filter/data-type",
      query: {
        skip: e.skip,
        take: e.take,
        name: e.name,
        editorUiAlias: e.editorUiAlias,
        editorAlias: e.editorAlias
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns unknown OK
   * @throws ApiError
   */
  static getItemDataType(e = {}) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/item/data-type",
      query: {
        id: e.id
      },
      errors: {
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.query
   * @param data.skip
   * @param data.take
   * @returns unknown OK
   * @throws ApiError
   */
  static getItemDataTypeSearch(e = {}) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/item/data-type/search",
      query: {
        query: e.query,
        skip: e.skip,
        take: e.take
      },
      errors: {
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.descendantId
   * @returns unknown OK
   * @throws ApiError
   */
  static getTreeDataTypeAncestors(e = {}) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/tree/data-type/ancestors",
      query: {
        descendantId: e.descendantId
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.parentId
   * @param data.skip
   * @param data.take
   * @param data.foldersOnly
   * @returns unknown OK
   * @throws ApiError
   */
  static getTreeDataTypeChildren(e = {}) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/tree/data-type/children",
      query: {
        parentId: e.parentId,
        skip: e.skip,
        take: e.take,
        foldersOnly: e.foldersOnly
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.skip
   * @param data.take
   * @param data.foldersOnly
   * @returns unknown OK
   * @throws ApiError
   */
  static getTreeDataTypeRoot(e = {}) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/tree/data-type/root",
      query: {
        skip: e.skip,
        take: e.take,
        foldersOnly: e.foldersOnly
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
}
class Be {
  /**
   * @param data The data for the request.
   * @param data.requestBody
   * @returns string Created
   * @throws ApiError
   */
  static postDocumentType(e = {}) {
    return n(o, {
      method: "POST",
      url: "/umbraco/management/api/v1/document-type",
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Generated-Resource",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns unknown OK
   * @throws ApiError
   */
  static getDocumentTypeById(e) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/document-type/{id}",
      path: {
        id: e.id
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns string OK
   * @throws ApiError
   */
  static deleteDocumentTypeById(e) {
    return n(o, {
      method: "DELETE",
      url: "/umbraco/management/api/v1/document-type/{id}",
      path: {
        id: e.id
      },
      responseHeader: "Umb-Notifications",
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static putDocumentTypeById(e) {
    return n(o, {
      method: "PUT",
      url: "/umbraco/management/api/v1/document-type/{id}",
      path: {
        id: e.id
      },
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Notifications",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.skip
   * @param data.take
   * @returns unknown OK
   * @throws ApiError
   */
  static getDocumentTypeByIdAllowedChildren(e) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/document-type/{id}/allowed-children",
      path: {
        id: e.id
      },
      query: {
        skip: e.skip,
        take: e.take
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.skip
   * @param data.take
   * @returns unknown OK
   * @throws ApiError
   */
  static getDocumentTypeByIdBlueprint(e) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/document-type/{id}/blueprint",
      path: {
        id: e.id
      },
      query: {
        skip: e.skip,
        take: e.take
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns unknown OK
   * @throws ApiError
   */
  static getDocumentTypeByIdCompositionReferences(e) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/document-type/{id}/composition-references",
      path: {
        id: e.id
      },
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns string Created
   * @throws ApiError
   */
  static postDocumentTypeByIdCopy(e) {
    return n(o, {
      method: "POST",
      url: "/umbraco/management/api/v1/document-type/{id}/copy",
      path: {
        id: e.id
      },
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Generated-Resource",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns unknown OK
   * @throws ApiError
   */
  static getDocumentTypeByIdExport(e) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/document-type/{id}/export",
      path: {
        id: e.id
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static putDocumentTypeByIdImport(e) {
    return n(o, {
      method: "PUT",
      url: "/umbraco/management/api/v1/document-type/{id}/import",
      path: {
        id: e.id
      },
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Notifications",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static putDocumentTypeByIdMove(e) {
    return n(o, {
      method: "PUT",
      url: "/umbraco/management/api/v1/document-type/{id}/move",
      path: {
        id: e.id
      },
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Notifications",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.skip
   * @param data.take
   * @returns unknown OK
   * @throws ApiError
   */
  static getDocumentTypeAllowedAtRoot(e = {}) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/document-type/allowed-at-root",
      query: {
        skip: e.skip,
        take: e.take
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.requestBody
   * @returns unknown OK
   * @throws ApiError
   */
  static postDocumentTypeAvailableCompositions(e = {}) {
    return n(o, {
      method: "POST",
      url: "/umbraco/management/api/v1/document-type/available-compositions",
      body: e.requestBody,
      mediaType: "application/json",
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @returns unknown OK
   * @throws ApiError
   */
  static getDocumentTypeConfiguration() {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/document-type/configuration",
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.requestBody
   * @returns string Created
   * @throws ApiError
   */
  static postDocumentTypeFolder(e = {}) {
    return n(o, {
      method: "POST",
      url: "/umbraco/management/api/v1/document-type/folder",
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Generated-Resource",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns unknown OK
   * @throws ApiError
   */
  static getDocumentTypeFolderById(e) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/document-type/folder/{id}",
      path: {
        id: e.id
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns string OK
   * @throws ApiError
   */
  static deleteDocumentTypeFolderById(e) {
    return n(o, {
      method: "DELETE",
      url: "/umbraco/management/api/v1/document-type/folder/{id}",
      path: {
        id: e.id
      },
      responseHeader: "Umb-Notifications",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns string OK
   * @throws ApiError
   */
  static putDocumentTypeFolderById(e) {
    return n(o, {
      method: "PUT",
      url: "/umbraco/management/api/v1/document-type/folder/{id}",
      path: {
        id: e.id
      },
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Notifications",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.requestBody
   * @returns string Created
   * @throws ApiError
   */
  static postDocumentTypeImport(e = {}) {
    return n(o, {
      method: "POST",
      url: "/umbraco/management/api/v1/document-type/import",
      body: e.requestBody,
      mediaType: "application/json",
      responseHeader: "Umb-Generated-Resource",
      errors: {
        400: "Bad Request",
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource",
        404: "Not Found"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.id
   * @returns unknown OK
   * @throws ApiError
   */
  static getItemDocumentType(e = {}) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/item/document-type",
      query: {
        id: e.id
      },
      errors: {
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.query
   * @param data.skip
   * @param data.take
   * @returns unknown OK
   * @throws ApiError
   */
  static getItemDocumentTypeSearch(e = {}) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/item/document-type/search",
      query: {
        query: e.query,
        skip: e.skip,
        take: e.take
      },
      errors: {
        401: "The resource is protected and requires an authentication token"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.descendantId
   * @returns unknown OK
   * @throws ApiError
   */
  static getTreeDocumentTypeAncestors(e = {}) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/tree/document-type/ancestors",
      query: {
        descendantId: e.descendantId
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.parentId
   * @param data.skip
   * @param data.take
   * @param data.foldersOnly
   * @returns unknown OK
   * @throws ApiError
   */
  static getTreeDocumentTypeChildren(e = {}) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/tree/document-type/children",
      query: {
        parentId: e.parentId,
        skip: e.skip,
        take: e.take,
        foldersOnly: e.foldersOnly
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
  /**
   * @param data The data for the request.
   * @param data.skip
   * @param data.take
   * @param data.foldersOnly
   * @returns unknown OK
   * @throws ApiError
   */
  static getTreeDocumentTypeRoot(e = {}) {
    return n(o, {
      method: "GET",
      url: "/umbraco/management/api/v1/tree/document-type/root",
      query: {
        skip: e.skip,
        take: e.take,
        foldersOnly: e.foldersOnly
      },
      errors: {
        401: "The resource is protected and requires an authentication token",
        403: "The authenticated user do not have access to this resource"
      }
    });
  }
}
function Y(r, e, t, a) {
  const s = JSON.parse(JSON.stringify(r));
  return e.forEach((i) => {
    const d = !i.culture || i.culture === t, u = !i.segment || i.segment === a;
    d && u && (s[i.alias] = i.value);
  }), s;
}
function Q(r, e) {
  var a;
  const t = JSON.parse(JSON.stringify(r));
  for (const s in t) {
    const i = t[s], d = (a = e[s]) == null ? void 0 : a.editorAlias;
    if (d)
      switch (d) {
        case "Umbraco.Tags":
          t[s] = JSON.stringify(i);
          break;
        case "Umbraco.Decimal":
          t[s] = JSON.stringify(i);
          break;
        case "Umbraco.ContentPicker":
          const u = `umb://document/${i}`;
          t[s] = u;
          break;
        case "Umbraco.DropDown.Flexible":
          t[s] = JSON.stringify(i);
          break;
        case "Umbraco.CheckBoxList":
          t[s] = JSON.stringify(i);
          break;
        case "Umbraco.MultipleTextstring":
          t[s] = i.join(`
`);
          break;
        case "Umbraco.MultiNodeTreePicker":
          for (let l = 0; l < t[s].length; l++) {
            const m = `umb://${t[s][l].type}/${t[s][l].unique}`;
            t[s][l] = m;
          }
          t[s] = t[s].join(",");
          break;
      }
  }
  return t;
}
var Ee = Object.defineProperty, we = Object.getOwnPropertyDescriptor, x = (r) => {
  throw TypeError(r);
}, De = (r, e, t, a) => {
  for (var s = a > 1 ? void 0 : a ? we(e, t) : e, i = r.length - 1, d; i >= 0; i--)
    (d = r[i]) && (s = (a ? d(e, t, s) : d(s)) || s);
  return a && s && Ee(e, t, s), s;
}, ee = (r, e, t) => e.has(r) || x("Cannot " + t), c = (r, e, t) => (ee(r, e, "read from private field"), t ? t.call(r) : e.get(r)), p = (r, e, t) => e.has(r) ? x("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(r) : e.set(r, t), h = (r, e, t, a) => (ee(r, e, "write to private field"), e.set(r, t), t), O, v, I, k, q, U, P, A, C, _, F, f, j, M, G, g, b, H, L, B, T, E, w;
let y = class extends ue {
  constructor() {
    super(), p(this, O), p(this, v), p(this, I), p(this, k), p(this, q), p(this, U), p(this, P), p(this, A), p(this, C), p(this, _), p(this, F), p(this, f), p(this, j), p(this, M), p(this, G, "Loading preview..."), p(this, g, !1), p(this, b), p(this, H), p(this, L), p(this, B), p(this, T), p(this, E), p(this, w), h(this, T, /* @__PURE__ */ new Map()), h(this, b, this.blockBeam()), this.init();
  }
  async init() {
    h(this, v, await fetch("/api/blockpreview")), this.consumeContext(oe, (e) => {
      h(this, P, e == null ? void 0 : e.getUnique()), h(this, A, e == null ? void 0 : e.getContentTypeUnique());
    });
    let r = "";
    this.consumeContext(ie, (e) => {
      var t;
      h(this, O, e == null ? void 0 : e.getAlias()), this.observe(e == null ? void 0 : e.value, (a) => {
        h(this, q, a), this.handleBlock();
      }), r = ((t = e == null ? void 0 : e.getEditor()) == null ? void 0 : t.tagName) ?? "";
    }), this.consumeContext(ce, (e) => {
      this.observe(e == null ? void 0 : e.variantId, (t) => {
        h(this, E, t == null ? void 0 : t.culture), h(this, w, t == null ? void 0 : t.segment);
      });
    }), this.consumeContext(de, async (e) => {
      h(this, U, r == "UMB-PROPERTY-EDITOR-UI-BLOCK-LIST" ? "list" : "grid"), h(this, f, e == null ? void 0 : e.getLabel()), h(this, b, this.blockBeam()), this.requestUpdate(), this.observe(e == null ? void 0 : e.contentKey, (t) => {
        h(this, _, t);
      }), this.observe(e == null ? void 0 : e.contentTypeKey, (t) => {
        h(this, B, t);
      }), this.observe(e == null ? void 0 : e.contentElementTypeKey, (t) => {
        h(this, C, t);
      }), this.observe(e == null ? void 0 : e.settingsElementTypeKey, (t) => {
        h(this, F, t);
      }), this.observe(e == null ? void 0 : e.workspaceEditContentPath, (t) => {
        h(this, j, t);
      }), this.observe(e == null ? void 0 : e.workspaceEditSettingsPath, (t) => {
        h(this, M, t);
      }), this.observe(e == null ? void 0 : e.contentElementTypeIcon, (t) => {
        h(this, H, t);
      }), await this.GetDataTypes(), e == null || e.settingsValues().then(async (t) => {
        this.observe(t, async (a) => {
          h(this, I, a), this.handleBlock();
        });
      }), e == null || e.contentValues().then(async (t) => {
        this.observe(t, async (a) => {
          h(this, k, a), this.handleBlock();
        });
      });
    });
  }
  async handleBlock() {
    if (h(this, g, !0), c(this, k) == null)
      return;
    const r = c(this, k), e = c(this, I), t = Y(r, c(this, q).contentData.find((l) => l.key === c(this, _)).values, c(this, E), c(this, w)), a = e && Y(r, c(this, q).settingsData.find((l) => l.key === c(this, _)).values, c(this, E), c(this, w)), s = Q(t, y.typeDefinitions), i = e && Q(a, y.typeDefinitions), d = {
      content: JSON.stringify(s),
      settings: JSON.stringify(i),
      contentId: c(this, P),
      propertyTypeAlias: c(this, O),
      contentTypeId: c(this, A),
      contentElementTypeKey: c(this, C),
      settingsElementTypeKey: c(this, F),
      blockType: c(this, U)
    }, u = await this.fetchBlockPreview(d);
    this.buildHtml(u), this.requestUpdate(), this.parseBlockScriptsAndAttachListeners();
  }
  async fetchBlockPreview(r) {
    c(this, T) === void 0 && h(this, T, /* @__PURE__ */ new Map());
    const e = JSON.stringify(r);
    if (c(this, T).has(e))
      return c(this, T).get(e);
    const a = await (await fetch("/api/blockpreview", {
      method: "POST",
      body: e,
      // Reuse the stringified payload
      headers: {
        "Content-Type": "application/json"
      }
    })).json();
    return c(this, T).values.length > 10 && c(this, T).delete(c(this, T).keys().next().value), c(this, T).set(e, a), a;
  }
  parseBlockScriptsAndAttachListeners() {
    ne(() => {
      var a, s;
      this.manageScripts();
      const e = (a = this.shadowRoot) == null ? void 0 : a.querySelector(".kibp_collaps"), t = (s = this.shadowRoot) == null ? void 0 : s.querySelector(".kibp_content");
      c(this, v).collapsibleBlocks ? e == null || e.addEventListener("click", (i) => {
        e.classList.toggle("active"), t == null || t.classList.toggle("hidden"), i.preventDefault(), i.stopImmediatePropagation();
      }) : (e == null || e.classList.remove("kibp_collaps"), e == null || e.remove());
    }, 100)();
  }
  buildHtml(r) {
    if (h(this, g, !1), r.html === "blockbeam")
      h(this, b, this.blockBeam());
    else {
      const e = r.html.includes("###renderGridAreaSlots"), t = (s) => {
        const i = {};
        return s && s.split(";").forEach((d) => {
          const [u, l] = d.split(":").map((m) => m.trim());
          if (u && l) {
            const m = u.replace(/-([a-z])/g, (R) => R[1].toUpperCase());
            i[m] = l;
          }
        }), i;
      }, a = c(this, v).divInlineStyle ? t(c(this, v).divInlineStyle) : {};
      if (e) {
        const s = this.areas();
        r.html = r.html.replace("###renderGridAreaSlots", s), h(this, b, N`
            <div class="kibp_defaultDivStyle" style=${z(a)}>
              <div class="kibp_collaps"><span class="inactive">- &nbsp;&nbsp; Click to minimize</span><span class="active">+ &nbsp;&nbsp; ${c(this, f)} &nbsp;&nbsp; (Click to maximize)</span></div>
                <div class="kibp_content">
                ${V(r.html)}
                </div>
              </div>
            </div>`);
      } else
        h(this, b, N`
            <div class="kibp_defaultDivStyle" style=${z(a)}>
              <div id="kibp_collapsible">
                <div class="kibp_collaps"><span class="inactive">- &nbsp;&nbsp; Click to minimize</span><span class="active">+ &nbsp;&nbsp; ${c(this, f)} &nbsp;&nbsp; (Click to maximize)</span></div>
                  <div class="kibp_content">
                    ${V(r.html)}
                  </div>
                </div>
              </div>
            </div>`);
    }
  }
  async GetDataTypes() {
    const e = (await Be.getDocumentTypeById({ id: c(this, B) })).properties.map(async (t) => {
      const a = t.dataType.id;
      let s = y.typeKeys.find((i) => {
        var d;
        return ((d = y.typeDefinitions[i]) == null ? void 0 : d.id) === a;
      });
      if (!s) {
        const i = await _e.getDataTypeById({ id: a });
        s = i.editorAlias, y.typeKeys.push(c(this, B)), y.typeDefinitions[t.alias] = i;
      }
      return s;
    });
    await Promise.all(e);
  }
  manageScripts() {
    var e;
    const r = (e = this.shadowRoot) == null ? void 0 : e.querySelectorAll("script");
    r == null || r.forEach((t) => {
      var s;
      const a = document.createElement("script");
      Array.from(t.attributes).forEach((i) => {
        a.setAttribute(i.name, i.value);
      }), t.src ? a.src = t.src : a.textContent = t.textContent, (s = t == null ? void 0 : t.parentNode) == null || s.replaceChild(a, t);
    });
  }
  areas() {
    return `
      <umb-ref-grid-block standalone href="${c(this, M)}">
        <span style="margin-right: 20px">${c(this, f)}</span> ${c(this, g) ? c(this, G) : ""}
        <umb-block-grid-areas-container slot="areas"></umb-block-grid-areas-container>
      </umb-ref-grid-block>
      `;
  }
  blockBeam() {
    return N`
    <umb-ref-grid-block standalone href="${c(this, j)}">
      <umb-icon slot="icon" .name=${c(this, H)}></umb-icon>
      <umb-ufm-render inline .markdown=${c(this, f)} .value=${c(this, L)}></umb-ufm-render>
      ${c(this, g) ? c(this, G) : ""}
		</umb-ref-grid-block>`;
  }
  render() {
    return N`${c(this, b)}`;
  }
};
O = /* @__PURE__ */ new WeakMap();
v = /* @__PURE__ */ new WeakMap();
I = /* @__PURE__ */ new WeakMap();
k = /* @__PURE__ */ new WeakMap();
q = /* @__PURE__ */ new WeakMap();
U = /* @__PURE__ */ new WeakMap();
P = /* @__PURE__ */ new WeakMap();
A = /* @__PURE__ */ new WeakMap();
C = /* @__PURE__ */ new WeakMap();
_ = /* @__PURE__ */ new WeakMap();
F = /* @__PURE__ */ new WeakMap();
f = /* @__PURE__ */ new WeakMap();
j = /* @__PURE__ */ new WeakMap();
M = /* @__PURE__ */ new WeakMap();
G = /* @__PURE__ */ new WeakMap();
g = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakMap();
H = /* @__PURE__ */ new WeakMap();
L = /* @__PURE__ */ new WeakMap();
B = /* @__PURE__ */ new WeakMap();
T = /* @__PURE__ */ new WeakMap();
E = /* @__PURE__ */ new WeakMap();
w = /* @__PURE__ */ new WeakMap();
y.typeKeys = [];
y.typeDefinitions = {};
y.styles = se`
    .kibp_content.hidden {
      height: 0;
      overflow:hidden;
    }

    .kibp_defaultDivStyle {
      border: 1px solid var(--uui-color-border,#d8d7d9);
      min-height: 50px; box-sizing: border-box;
    }

    #kibp_collapsible:hover .kibp_collaps {
      height: 25px;
    }

    .kibp_collaps {
      height: 0px;
      width: 150px;
      background-color: #1b264f;
      transition: all ease 0.4s;
      color: white;
      font-weight: bold;
      position: absolute;
      top: 0;
      font-size: 12px;
      overflow: hidden;
      display: flex;
      align-items: center;
      opacity: 0.8;
      cursor: pointer;
    }

    .kibp_collaps span {
      margin-left: 10px;
    }

    .kibp_collaps .active {
      display: none;
    }

    .kibp_collaps.active {
      background-color: #86a0ff;
      height: 50px !important;
      width: 100%;
      position: initial;
    }

    .kibp_collaps.active .inactive {
      display: none;
    }

    .kibp_collaps.active .active {
      display: inline;
    }
  `;
y = De([
  ae("knowit-instant-block-preview")
], y);
const Ce = y;
export {
  y as InstantBlockPreview,
  Ce as default
};
//# sourceMappingURL=knowit-instant-block-preview-D1k6F-Dm.js.map
