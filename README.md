
# Knowit.Umbraco.InstantBlockPreview (and *.Headless)

A package-set for Umbraco that enables instant previews in the Umbraco Backoffice for Block Grid and Block List element types, 
without the need to save the document first. This package was heavily inspired by [Rick Butterfield's Block Preview package](https://github.com/rickbutterfield/Umbraco.Community.BlockPreview).


**Knowit.Umbraco.InstantBlockPreview currently supports Umbraco 10 to 17.1**

**Knowit.Umbraco.InstantBlockPreview.Headless currently supports Umbraco 12 to 13**

If you use Umbraco 13 or old, use version 1.x.x

If you use Umbraco 14 use version 2.x.x (due to the rewrite of the backoffice)
If you use Umbraco 15+ use version 3.x.x (due to the rewrite of the blocks in Umbraco)

The two packages "Knowit.Umbraco.InstantBlockPreview" and "Knowit.Umbraco.InstantBlockPreview.Headless" share this repo and readme. 

Choose your section accordingly.

## Features
- Instant preview for Block Grid and Block List element types.
- No document save required to perform a preview.
- MVC: Supports rendering through ViewComponents
- Headless: Supports rendering with HTML fetched from an SSR app (if you're using Knowit.Umbraco.InstantBlockPreview.Headless)

## MVC
### Configuration

Configuration is optional, if you are happy with the standard values, you don't need to add anything to your `appsettings.json`. 

**(Intellisens support in 2.1.1 or newer)**  - You can add the following to appsettings-schema.json for intellisense support in your appsettings.json
```json
{
      "$ref": "App_Plugins\\knowit-instantblockpreview\\appsettings-schema.Knowit.Umbraco.InstantBlockPreview.json#"
}
``` 


The following values are available for configuration:

```json
"Knowit.Umbraco.InstantBlockPreview": {
  "gridViewPath": "~/Views/Partials/blockgrid/Components/",
  "blockViewPath": "~/Views/Partials/blocklist/Components/",
  "rteViewPath": "~/Views/Partials/richtext/Components/",
  "injections": []
  "areaReplace": true, 
  "CollapsibleBlocks": false,
  "divInlineStyle": "",
  "enableFor": [], // only v14 and newer, see below
  "disableFor": [], // only v14 and newer, see below
}
```

- `gridviewPath` - The path to the Block Grid views. Default is `~/Views/Partials/blockgrid/Components/`.
- `blockViewPath` - The path to the Block List views. Default is `~/Views/Partials/blocklist/Components/`.
- `rteViewPath` - The path to the richtext Block views. Default is `~/Views/Partials/blocklist/Components/`.
- `injections` - In short, a way to add lines of code to the start of the preview-HTML. Use it to inject your web-components JS or your app or something else!
- `areaReplace` - If set to true, will try to render grid areas wherever it finds the magic viewbag item "@ViewBag.renderGridAreaSlots"
- `CollapsibleBlocks` - If set to true, will render blocks with a collapsible div around them.
- `divInlineStyle` - Inline style configuration for the div element containing the block rendered as a string in a style attribute.

AreaReplace example: 

```razor
@using Umbraco.Extensions
@inherits Umbraco.Cms.Web.Common.Views.UmbracoViewPage<Umbraco.Cms.Core.Models.Blocks.BlockGridItem>

<div>
    This is my 2-col<hr />
    @await Html.GetBlockGridItemAreasHtmlAsync(Model)
    @ViewBag.renderGridAreaSlots
</div>
```

#### Version 14+ specific behavior
As version 14.1+ of Umbraco currently doesn't use the "advanced" tab info from the block setups, and instead lets you override "all" block renderings, I've introduced `enabledFor`and `disableFor` as a way to give that control back. 

Default behaviour with no configuration is to take control of all block-renderings. If something goes wrong, it will output html like Umbraco normally would without the plugin installed.

- If `enableFor` is in use, it will only render blocks whose alias match the list.
- If `disableFor` is in use, it will render all blocks except aliases matching the list.

### Razor View
Implement your views normally. 

You can include special code to run only in the back office like so:
```csharp
@if (ViewBag.blockPreview != null)
{
    <p style="color:red">I am only visible in backoffice and this is my id @ViewBag.assignedContentId</p>
}
```

Umbraco.AssignedContentItem.Id will not work in your previews as the content is temporary and not assigned to anything.

A workaround if you must have a reference in your view to the content the element is assigned, something like this can be used.

```csharp
var id = ViewBag.blockPreview ? ViewBag.assignedContentId : Umbraco.AssignedContentItem.Id;
```

### Version 13 and earlier specific behavior
Set `gridView.html` for Block Grid and `listview.html` for Block List, which are installed by this package in `app_plugins/Knowit.Umbraco.InstantBlockPreview`. 



## Headless
### Configuration

The following values are available for configuration:

```json
"Knowit.Umbraco.InstantBlockPreview": {
  "ssrApiUrl": "https://localhost:3000/api/blockPreview",
  "ssrUrl": "https://localhost:3000/blockPreview",
  "ssrSecret": "my-ssr-secret",
  "ssrSelector": "#__nuxt",
  "injections": []
}
```

- `ssrApiUrl` - The URL to the API that will recieve the JSON from Umbraco.
- `ssrUrl` - The URL to the API that will return the HTML to Umbraco.
- `ssrSecret` - A secret key that will be sent to the API to verify that the request is coming from Umbraco.
- `injections` - In short, a way to add lines of code to the start of the preview-HTML. Use it to inject your web-components JS or your app or something else!

Read more under "Headless Preview"

### Umbraco Cloud
Currently to deploy this package on a Umbraco Cloud solution, the following is required to be added to your web projects .csproj file:

```xml
<PropertyGroup>
    <ErrorOnDuplicatePublishOutputFiles>false</ErrorOnDuplicatePublishOutputFiles>
</PropertyGroup>
```


### Headless Preview

To allow an Headless app (Next/Nuxt etc) to provide a preview for the plugin, you will need to wire up some stuff yourself.

It will send a POST to the "ssrApiUrl" with whatever you've put in "ssrSecret" as an "knowit-umbraco-instantblock-preview-secret" header. The POST BODY will include standard Content Delivery API Json in the form of a Grid or Blocklist entry depending on what you're doing.

It will expect to receive a string back which will act as a key for the next call. It will then perform a GET call to "ssrUrl" with ?key=returnedKeyFromApi appended and again with the authorization header.

Your application needs to return server-side rendered HTML back from that request.

So on your end.

- Api needs to recieve JSON from POST and save/cache it somehow with a key, and return the key as response
- Preview Url needs to return preview-HTML when given the key through a GET request

"ssrSelector" is an optional option to narrow the amount of HTML returned to Umbraco. You can put in body/#__nuxt or any other valid css selector and the API will only return the INNERHTML of that selector to Umbraco for a cleaner HTML output.

#### Example

You've set up a grid element with a rich text editor to use Instant Block Preview and have just now entered some text and hit save.

1) The Javascript sends your changes to Instant Block Preview API 
2) Instant Block Preview API sends a POST request to https://localhost:3000/api/blockPreview with following BODY: 
```json
{"gridColumns":12,"items":[{"rowSpan":0,"columnSpan":0,"areaGridColumns":12,"areas":[],"content":{"id":"554991cb-dfa4-43fd-85ba-9c9b0213438e","contentType":"text","properties":{"richText":{"markup":"<p>Test 123</p>","blocks":[]}}},"settings":null}]}
```
as well as an header with your secret key

3) Your app, whatever it may be, recieves the call, verifies the secret key and caches the json in a way where your app will be able to retrieve it with just a string key you've just generated. Could just be current time in microseconds or a guid or something else
4) Your app returns the string key as response (example key "lutvdx1hghiz4w9suye")
5) Instant Block Preview now makes a GET request to https://localhost:3000/blockPreview?key=lutvdx1hghiz4w9suye with the same authorization headers set
6) Your app retrieves the JSON from it's cache with the key, and renders the HTML just like you would with a normal response from the Content Delivery API
7) Instant Block Preview recieves the Html and (optionally) filters it down to the css selector you've sendt in "ssrSelector" and returns that Html to be previewed in Umbraco

## License
[MIT](LICENSE)
