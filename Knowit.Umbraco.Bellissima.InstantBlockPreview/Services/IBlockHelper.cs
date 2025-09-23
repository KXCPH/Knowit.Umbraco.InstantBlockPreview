using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;

namespace Knowit.Umbraco.Bellissima.InstantBlockPreview.Services
{
    public interface IBlockHelper
    {
        IPublishedElement TypedIPublishedElement(string type, string content);

        IBlockReference<IPublishedElement, IPublishedElement> TypedGenericBlock(IPublishedElement contentModel, IPublishedElement settingsModel, string blockType);
    }
}
