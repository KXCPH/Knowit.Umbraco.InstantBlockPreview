import { UmbBlockDataType } from "@umbraco-cms/backoffice/block";
import { DataTypeResponseModel } from "../api";

export function marryContentAndValue(
  content: UmbBlockDataType, 
  values: any, 
  culture: string | null | undefined, 
  segment: string | null | undefined
) {
  const mutableContent = JSON.parse(JSON.stringify(content));
  
  values.forEach((v: { alias: string | number; value: any; culture?: string | null; segment?: string | null; }) => {
    // Check if culture and segment match or are null
    const cultureMatches = !v.culture || v.culture === culture;
    const segmentMatches = !v.segment || v.segment === segment;

    if (cultureMatches && segmentMatches) {
      mutableContent[v.alias] = v.value;
    }
  });
  
  return mutableContent as UmbBlockDataType;
}

export function parseBadKeys(content: UmbBlockDataType | undefined, typeDefinitions: { [editorAlias: string]: DataTypeResponseModel }) {
  const mutableContent = JSON.parse(JSON.stringify(content));
  for (const key in mutableContent) {
    
    const value = mutableContent[key];
    const editorAlias = typeDefinitions[key]?.editorAlias;
    
    if(editorAlias) {
      switch(editorAlias) {
        case "Umbraco.Tags":
          mutableContent[key] = JSON.stringify(value);
        break;
        case "Umbraco.Decimal":
          mutableContent[key] = JSON.stringify(value);
          break;
        case "Umbraco.ContentPicker":
          const newItem = `umb://document/${value}`;
          mutableContent[key] = newItem;
        break;
        case "Umbraco.DropDown.Flexible": 
        mutableContent[key] = JSON.stringify(value);
        break;
        case "Umbraco.CheckBoxList": 
        mutableContent[key] = JSON.stringify(value);
        break;

        case "Umbraco.MultipleTextstring": 
        mutableContent[key] = value.join('\n');
        break;
        case "Umbraco.MultiNodeTreePicker": 
          for (let i = 0; i < mutableContent[key].length; i++) {
            const newItem = `umb://${mutableContent[key][i].type}/${mutableContent[key][i].unique}`;
            mutableContent[key][i] = newItem;
          }
          mutableContent[key] = mutableContent[key].join(',');
        break;
      }
    }
  }
  return mutableContent as UmbBlockDataType;
}