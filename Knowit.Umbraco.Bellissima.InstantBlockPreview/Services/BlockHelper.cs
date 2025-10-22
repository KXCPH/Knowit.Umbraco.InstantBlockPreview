using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Services;

namespace Knowit.Umbraco.Bellissima.InstantBlockPreview.Services
{
    public class BlockHelper : IBlockHelper
    {
        private readonly IContentTypeService _contentTypeService;
        private readonly IPublishedContentTypeFactory _publishedContentTypeFactory;
        private readonly IPublishedValueFallback _publishedValueFallback;
        private readonly ModelsBuilderSettings modelsBuilderSettings;
        public BlockHelper(
            IContentTypeService contentTypeService,
            IPublishedContentTypeFactory publishedContentTypeFactory,
            IPublishedValueFallback publishedValueFallback)
        {
            _contentTypeService = contentTypeService;
            _publishedContentTypeFactory = publishedContentTypeFactory;
            _publishedValueFallback = publishedValueFallback;
            modelsBuilderSettings = new ModelsBuilderSettings();
        }

        public IPublishedElement TypedIPublishedElement(string type, string content)
        {
            var elementtype = _contentTypeService.Get(Guid.Parse(type));
            var publishedElementType = _publishedContentTypeFactory.CreateContentType(elementtype);

            Dictionary<string, object> data = JsonSerializer.Deserialize<Dictionary<string, object>>(content);
            Dictionary<string, object> deserializedData = ConvertJsonElement(data);

            IPublishedElement publishedElement = null;

            VariationContext variationContext = new VariationContext();
#if NET10_0_OR_GREATER
            publishedElement = new PublishedElement(publishedElementType, Guid.NewGuid(), deserializedData, true, variationContext);
#else
            publishedElement = new PublishedElement(publishedElementType, Guid.NewGuid(), deserializedData, true);
#endif

            var elementModelName = elementtype.Alias;
            elementModelName = char.ToUpper(elementModelName[0]) + elementModelName.Substring(1);
            var modelsNameSpace = modelsBuilderSettings.ModelsNamespace;
            var fullTypeName = $"{modelsNameSpace}.{elementModelName}";

            Assembly targetAssembly = AppDomain.CurrentDomain
                .GetAssemblies()
                .FirstOrDefault(assembly => assembly.GetTypes().Any(t => t.FullName == fullTypeName));

            Type modelType = targetAssembly.GetType(fullTypeName);
            object[] constructorArgs = [publishedElement, _publishedValueFallback];
            object modelInstance = Activator.CreateInstance(modelType, constructorArgs);

            return (IPublishedElement)modelInstance;
        }

        public IBlockReference<IPublishedElement, IPublishedElement> TypedGenericBlock(IPublishedElement contentModel, IPublishedElement settingsModel, string blockType)
        {
            var blockItemType = blockType == PreviewConstants.BlockTypeGrid ? typeof(BlockGridItem<>) : typeof(BlockListItem<>);
            Type[] typeArray = settingsModel != null ? [contentModel.GetType(), settingsModel.GetType()] : [contentModel.GetType()];
            Type blockElementType = blockItemType.MakeGenericType(typeArray);
            ConstructorInfo? ctor = blockElementType.GetConstructor(
           [
                typeof(Udi),
                contentModel.GetType(),
                typeof(Udi),
                    settingsModel != null ? settingsModel.GetType() : typeof(IPublishedElement)
                    ]);

            var blockInstanceItem = ctor!.Invoke(
            [
                        Udi.Create("element",Guid.NewGuid()),
                        contentModel!,
                        Udi.Create("element",Guid.NewGuid()),
                        settingsModel
            ]);

            return (IBlockReference<IPublishedElement, IPublishedElement>)blockInstanceItem;
        }

        private Dictionary<string, object> ConvertJsonElement(Dictionary<string, object> dictionary)
        {
            var result = new Dictionary<string, object?>();

            foreach (var kvp in dictionary)
            {
                if (kvp.Value is JsonElement element)
                {
                    result[kvp.Key] = ConvertJsonValue(element);
                }
                else if (kvp.Value is Dictionary<string, object?> nestedDict)
                {
                    result[kvp.Key] = ConvertJsonElement(nestedDict);
                }
                else
                {
                    result[kvp.Key] = kvp.Value;
                }
            }

            return result;
        }

        // Converts individual JsonElement to its base type
        private object ConvertJsonValue(JsonElement element)
        {
            return element.ValueKind switch
            {
                JsonValueKind.Object => element.GetRawText(),
                JsonValueKind.Array => element.GetRawText(),
                JsonValueKind.String => element.GetString(),
                JsonValueKind.Number => element.TryGetInt64(out long l) ? l : (object)element.GetDouble(),
                JsonValueKind.True => true,
                JsonValueKind.False => false,
                JsonValueKind.Null => null,
                _ => element.GetRawText(),
            };
        }

        // Handles conversion of JSON arrays
        private object[] ConvertJsonArray(JsonElement arrayElement)
        {
            var result = new List<object?>();

            foreach (var item in arrayElement.EnumerateArray())
            {
                result.Add(ConvertJsonValue(item));
            }

            return result.ToArray();
        }

    }
}
