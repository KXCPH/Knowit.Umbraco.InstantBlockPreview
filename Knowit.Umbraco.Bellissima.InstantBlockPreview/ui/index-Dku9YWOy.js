import { UMB_AUTH_CONTEXT as r } from "@umbraco-cms/backoffice/auth";
class c {
  constructor() {
    this._fns = [];
  }
  eject(e) {
    const t = this._fns.indexOf(e);
    t !== -1 && (this._fns = [...this._fns.slice(0, t), ...this._fns.slice(t + 1)]);
  }
  use(e) {
    this._fns = [...this._fns, e];
  }
}
const s = {
  BASE: "",
  CREDENTIALS: "include",
  ENCODE_PATH: void 0,
  HEADERS: void 0,
  PASSWORD: void 0,
  TOKEN: void 0,
  USERNAME: void 0,
  VERSION: "Latest",
  WITH_CREDENTIALS: !1,
  interceptors: {
    request: new c(),
    response: new c()
  }
}, E = async (i, e) => {
  i.consumeContext(r, async (o) => {
    if (!o) return;
    const n = o.getOpenApiConfiguration();
    s.BASE = n.base, s.TOKEN = await n.token(), s.CREDENTIALS = n.credentials;
  });
  const t = {
    alias: "knowit-instant-block-preview",
    name: "Knowit Instant Block Preview",
    type: "blockEditorCustomView",
    elementName: "knowit-instant-block-preview",
    js: () => import("./knowit-instant-block-preview-D1k6F-Dm.js")
  };
  e.register(t);
};
export {
  s as O,
  E as o
};
//# sourceMappingURL=index-Dku9YWOy.js.map
