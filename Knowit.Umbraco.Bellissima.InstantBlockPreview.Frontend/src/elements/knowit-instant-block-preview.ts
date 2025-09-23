import { html, customElement, unsafeHTML, css, TemplateResult} from "@umbraco-cms/backoffice/external/lit";
import { styleMap } from "@umbraco-cms/backoffice/external/lit";
import { UMB_PROPERTY_CONTEXT } from '@umbraco-cms/backoffice/property';
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/document";
import { UmbWorkspaceUniqueType } from "@umbraco-cms/backoffice/workspace";
import { debounce } from "@umbraco-cms/backoffice/utils";
import { DocumentTypeService, DataTypeService, DataTypeResponseModel } from "../api";

import '@umbraco-cms/backoffice/ufm';

import { UMB_BLOCK_ENTRY_CONTEXT, UMB_BLOCK_MANAGER_CONTEXT, UmbBlockDataType } from "@umbraco-cms/backoffice/block";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { marryContentAndValue, parseBadKeys } from "../util/block-content-utils";

@customElement('knowit-instant-block-preview')
export class InstantBlockPreview extends UmbLitElement {
  
  static typeKeys: string[] = [];
  static typeDefinitions: { [editorAlias: string]: DataTypeResponseModel } = {};

  #propertyType: string | undefined;
  #settings: any | undefined;
  #currentSettings: UmbBlockDataType | undefined;
  #currentContent: UmbBlockDataType | undefined;
  #currentValue: any | undefined;
  #blockType: string | undefined;
  #currentId : UmbWorkspaceUniqueType | undefined;
  #documentTypeId: string | undefined;
  #contentElementTypeKey : string | undefined;
  #contentKey: string | undefined;
  #settingsElementTypeKey : string | null | undefined;
  #label: string | undefined;
  #contentEditPath: string | undefined;
  #settingEditPath: string | undefined;
  #loader = `Loading preview...`;
  #showLoader = false;
  #htmlOutput : TemplateResult | undefined;
  #icon: string | undefined;
  #content: any | undefined;
  #contentTypeKey: string | undefined;
  #contentCache: Map<any,any> | undefined = undefined;
  #culture: string | null | undefined;
  #segment: string | null | undefined;
  constructor() {
    super();
    this.#contentCache = new Map();
    this.#htmlOutput = this.blockBeam();
    this.init();
  }

  async init() {
    this.#settings = await fetch('/api/blockpreview');
    
    this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (workspaceContext) => {
      this.#currentId = workspaceContext?.getUnique();
      this.#documentTypeId = workspaceContext?.getContentTypeUnique();
    });

    let editorNode = "";
    this.consumeContext(UMB_PROPERTY_CONTEXT, (propertyContext) => {
      this.#propertyType = propertyContext?.getAlias();
      
      this.observe(propertyContext?.value, (value) => {
        this.#currentValue = value;
        this.handleBlock();
      });

      editorNode = propertyContext?.getEditor()?.tagName ?? "";
    });

    
    this.consumeContext(UMB_BLOCK_MANAGER_CONTEXT, (manager) => {
      this.observe(manager?.variantId, (variantId) => {
        this.#culture = variantId?.culture;
        this.#segment = variantId?.segment;
      });
    });
        
    this.consumeContext(UMB_BLOCK_ENTRY_CONTEXT, async (context) => {
      this.#blockType = editorNode == "UMB-PROPERTY-EDITOR-UI-BLOCK-LIST" ? "list" : "grid";
      this.#label = context?.getLabel();
      this.#htmlOutput = this.blockBeam();
      this.requestUpdate();

      this.observe(context?.contentKey, (contentKey) => {
        this.#contentKey = contentKey;
      });

      this.observe(context?.contentTypeKey, (contentTypeKey) => {
        this.#contentTypeKey = contentTypeKey;
      });

      this.observe(context?.contentElementTypeKey, (contentElementTypeKey) => {
        this.#contentElementTypeKey = contentElementTypeKey;
      });

      this.observe(context?.settingsElementTypeKey, (settingsElementTypeKey) => {
        this.#settingsElementTypeKey = settingsElementTypeKey;
      });

      this.observe(context?.workspaceEditContentPath, (contentEditPath) => {
        this.#contentEditPath = contentEditPath;
      });

      this.observe(context?.workspaceEditSettingsPath, (settingsEditPath) => {
        this.#settingEditPath = settingsEditPath;
      });

      this.observe(context?.contentElementTypeIcon, (icon) => {
        this.#icon = icon;
      });
;
      // Use a separate array for the promises, await their resolution with Promise.all()
      await this.GetDataTypes();
      
      context?.settingsValues().then(async (settings) => {
        this.observe(settings, async (settings) => {
          this.#currentSettings = settings;
          this.handleBlock();
        });
      });

      context?.contentValues().then(async (blockContent) => {
        this.observe(blockContent, async (content) => {
          this.#currentContent = content;
          this.handleBlock();
        });
      });
    });
  }


  async handleBlock() {
    
    this.#showLoader = true;
    
    if(this.#currentContent == null) 
      return;

    const content = this.#currentContent;
    const settings = this.#currentSettings;

    const marriedContent = marryContentAndValue(content, this.#currentValue.contentData.find((x: { key: string | undefined; }) => x.key === this.#contentKey).values, this.#culture, this.#segment);

    const marriedSettings = settings ? marryContentAndValue(content, this.#currentValue.settingsData.find((x: { key: string | undefined; }) => x.key === this.#contentKey).values, this.#culture, this.#segment) : settings;

    const goodContent = parseBadKeys(marriedContent, InstantBlockPreview.typeDefinitions);
    const goodSettings = settings ? parseBadKeys(marriedSettings, InstantBlockPreview.typeDefinitions) : settings;

    const payload = {
      content: JSON.stringify(goodContent),
      settings: JSON.stringify(goodSettings),
      contentId: this.#currentId,
      propertyTypeAlias: this.#propertyType,
      contentTypeId: this.#documentTypeId,
      contentElementTypeKey: this.#contentElementTypeKey,
      settingsElementTypeKey: this.#settingsElementTypeKey,
      blockType: this.#blockType,
    }

    const data = await this.fetchBlockPreview(payload);

    this.buildHtml(data);
    this.requestUpdate();

    this.parseBlockScriptsAndAttachListeners();
  }
  private async fetchBlockPreview(payload : any) {
    if(this.#contentCache === undefined) this.#contentCache = new Map();
    // Convert the payload to a string to use as a key in the cache
    const payloadKey = JSON.stringify(payload);

    // Check if we have a cached response for the same payload
    if (this.#contentCache.has(payloadKey)) {
      return this.#contentCache.get(payloadKey); // Return the cached response
    }

    // If no cached response, make the network request
    const response = await fetch('/api/blockpreview', {
      method: 'POST',
      body: payloadKey, // Reuse the stringified payload
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if(this.#contentCache.values.length > 10) {
      this.#contentCache.delete(this.#contentCache.keys().next().value);
    }
    // Cache the response using the payload as the key
    this.#contentCache.set(payloadKey, data);

    // Return the response data
    return data;
  }

  private parseBlockScriptsAndAttachListeners() {
    const debouncedScriptParser = debounce(() => {
      this.manageScripts();

      const collaps = this.shadowRoot?.querySelector('.kibp_collaps');
      const contentElement = this.shadowRoot?.querySelector('.kibp_content');

      if (this.#settings.collapsibleBlocks) {
        collaps?.addEventListener('click', (e) => {

          collaps.classList.toggle('active');

          contentElement?.classList.toggle('hidden');
          e.preventDefault();
          e.stopImmediatePropagation();
        });
      }
      else {
        collaps?.classList.remove('kibp_collaps');
        collaps?.remove();
      }
    }, 100);

    debouncedScriptParser();
  }

  private buildHtml(data: any) {
    this.#showLoader = false;

    if (data.html === "blockbeam")
      this.#htmlOutput = this.blockBeam();
    else {

      const containsRenderGridAreaSlots = data.html.includes("###renderGridAreaSlots");
      
      // Parse the inline style string into a style object for styleMap
      const parseInlineStyle = (styleString: string) => {
        const styles: { [key: string]: string } = {};
        if (!styleString) return styles;
        
        styleString.split(';').forEach(rule => {
          const [property, value] = rule.split(':').map(s => s.trim());
          if (property && value) {
            // Convert kebab-case to camelCase for CSS properties
            const camelProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            styles[camelProperty] = value;
          }
        });
        return styles;
      };
      
      const divStyles = this.#settings.divInlineStyle ? parseInlineStyle(this.#settings.divInlineStyle) : {};
      if (containsRenderGridAreaSlots) {
        const areaHtml = this.areas();
        data.html = data.html.replace("###renderGridAreaSlots", areaHtml);
        this.#htmlOutput = html`
            <div class="kibp_defaultDivStyle" style=${styleMap(divStyles)}>
              <div class="kibp_collaps"><span class="inactive">- &nbsp;&nbsp; Click to minimize</span><span class="active">+ &nbsp;&nbsp; ${this.#label} &nbsp;&nbsp; (Click to maximize)</span></div>
                <div class="kibp_content">
                ${unsafeHTML(data.html)}
                </div>
              </div>
            </div>`;
      }
      else {
        this.#htmlOutput = html`
            <div class="kibp_defaultDivStyle" style=${styleMap(divStyles)}>
              <div id="kibp_collapsible">
                <div class="kibp_collaps"><span class="inactive">- &nbsp;&nbsp; Click to minimize</span><span class="active">+ &nbsp;&nbsp; ${this.#label} &nbsp;&nbsp; (Click to maximize)</span></div>
                  <div class="kibp_content">
                    ${unsafeHTML(data.html)}
                  </div>
                </div>
              </div>
            </div>`;
      }
    }
  }

  private async GetDataTypes() {
    const documentType = await DocumentTypeService.getDocumentTypeById({ id: this.#contentTypeKey as string });

    const propertyPromises = documentType.properties.map(async (property) => {
      const dataTypeId = property.dataType.id;

      // Check if the dataType is already in typeDefinitions
      let editorAlias = InstantBlockPreview.typeKeys.find(alias => InstantBlockPreview.typeDefinitions[alias]?.id === dataTypeId);

      if (!editorAlias) {
        // If not cached, fetch it
        const dataType = await DataTypeService.getDataTypeById({ id: dataTypeId });
        editorAlias = dataType.editorAlias;

        // Add the fetched dataType to both arrays, ensure the push is synchronous
        InstantBlockPreview.typeKeys.push(this.#contentTypeKey as string);
        InstantBlockPreview.typeDefinitions[property.alias] = dataType;
      }

      return editorAlias;
    });

    // Await for all properties to be processed
    await Promise.all(propertyPromises);
  }

  private manageScripts() {
    const scripts = this.shadowRoot?.querySelectorAll('script');
    scripts?.forEach(oldScript => {
      const newScript = document.createElement('script');

      // Copy attributes from old script to new script
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });

      // Copy the inline script content
      if (oldScript.src) {
        // If the script has a src attribute, set it to the new script
        newScript.src = oldScript.src;
      } else {
        // Otherwise, set the inline script content
        newScript.textContent = oldScript.textContent;
      }

      // Append the new script to the same parent node
      oldScript?.parentNode?.replaceChild(newScript, oldScript);
    });
  }

  private areas() {
    
    return `
      <umb-ref-grid-block standalone href="${this.#settingEditPath}">
        <span style="margin-right: 20px">${this.#label}</span> ${this.#showLoader ? this.#loader : ''}
        <umb-block-grid-areas-container slot="areas"></umb-block-grid-areas-container>
      </umb-ref-grid-block>
      `;

  }

  private blockBeam() {
    
    return html`
    <umb-ref-grid-block standalone href="${this.#contentEditPath!}">
      <umb-icon slot="icon" .name=${this.#icon}></umb-icon>
      <umb-ufm-render inline .markdown=${this.#label} .value=${this.#content}></umb-ufm-render>
      ${this.#showLoader ? this.#loader : ''}
		</umb-ref-grid-block>`
  }

  render() {
    return html`${this.#htmlOutput}`;
  }

  static override styles = css`
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
  `
}

export default InstantBlockPreview;

declare global {
  interface HTMLElementTagNameMap {
    'knowit-instant-block-preview': InstantBlockPreview;
  }
}