using Knowit.Umbraco.Bellissima.InstantBlockPreview.Helpers;
using Knowit.Umbraco.Bellissima.InstantBlockPreview.Models;
using Knowit.Umbraco.Bellissima.InstantBlockPreview.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.PropertyEditors.ValueConverters;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;

namespace Knowit.Umbraco.Bellissima.InstantBlockPreview.Controllers
{
    [ApiController]
    [Route("api/blockpreview")]
    public class BlockPreviewController : Controller
    {
        private readonly IPreviewSettings _settings;
        private readonly IContentTypeService _contentTypeService;
        
		private readonly ILogger _logger;
		private readonly IFakeViewEngine _fakeViewEngine;
		private readonly IBlockHelper _blockHelper;
        public BlockPreviewController(
			IFakeViewEngine fakeViewEngine,
            IPreviewSettings previewSettings,
            IBlockHelper blockHelper,
			IContentTypeService contentTypeService,
			IPublishedContentTypeFactory publishedContentTypeFactory,
            IPublishedValueFallback publishedValueFallback,

            BlockGridPropertyValueConverter blockGridPropertyValueConverter,
            BlockListPropertyValueConverter blockListPropertyValueConverter,
			ILogger logger)
        {
            _fakeViewEngine = fakeViewEngine;
            _settings = previewSettings;
            _blockHelper = blockHelper;
            _contentTypeService = contentTypeService;
            _logger = logger;
        }


        [HttpPost]
        public async Task<IActionResult> Render([FromBody] RenderingPayloadBellissima scope)
		{
			var content = scope.Content;
            var settings = scope.Settings;
            var elementTypeId = scope.ContentElementTypeKey;
            var settingsElementTypeId = scope.SettingsElementTypeKey;
            var controllerName = string.Empty;
            var blockType = scope.BlockType;
			var htmlString = string.Empty;
            
            
            try
			{
                controllerName = _contentTypeService.Get(Guid.Parse(elementTypeId)).Alias;
                controllerName = char.ToUpper(controllerName[0]) + controllerName.Substring(1);
                var contentModel = _blockHelper.TypedIPublishedElement(elementTypeId, content);
                var settingsModel = settings != null ? _blockHelper.TypedIPublishedElement(settingsElementTypeId, settings) : null;

                var blockInstanceItem = _blockHelper.TypedGenericBlock(contentModel, settingsModel, blockType);

                var formattedViewPath = string.Format("{0}.cshtml", controllerName);
				var viewPath = (blockType == PreviewConstants.BlockTypeGrid ? _settings.PackageSettings.GridViewPath : _settings.PackageSettings.BlockViewPath) + formattedViewPath;

				Dictionary<string, object> viewData = new Dictionary<string, object>();

				if (blockType == PreviewConstants.BlockTypeGrid && _settings.PackageSettings.AreaReplace.HasValue && _settings.PackageSettings.AreaReplace.Value)
                    viewData[PreviewConstants.ViewDataRenderGridAreaSlot] = PreviewConstants.RenderGridAreaSlotValue;
                
				htmlString = await _fakeViewEngine.RenderView(ControllerContext.HttpContext, viewPath, controllerName, blockInstanceItem, scope.ContentId, viewData);
				htmlString = _fakeViewEngine.BootstrapJs(htmlString);
				htmlString = _fakeViewEngine.StripLinks(htmlString);

				return Ok(new { html = htmlString });
			}
			catch (Exception e)
			{
				if(_settings.PackageSettings.Debug.HasValue && _settings.PackageSettings.Debug.Value)
                {
                    _logger.Error(e, "Error rendering block preview");
                }
                return Ok(new { html = PreviewConstants.BlockBeamValue });
			}
        }

		[HttpGet]
        public IActionResult Settings()
		{
			return Ok(_settings.PackageSettings);
        }
    }
}
